import { McpError, ErrorCode, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Interface สำหรับ Tool Definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * Interface สำหรับ Tool Response
 */
export type ToolResponse = CallToolResult;

/**
 * Base class สำหรับ MCP Tools
 * ทุก tool ควรสืบทอดจาก class นี้
 */
export abstract class BaseTool<T = any> {
  /**
   * ชื่อของ tool
   */
  abstract readonly name: string;

  /**
   * คำอธิบายของ tool
   */
  abstract readonly description: string;

  /**
   * Schema สำหรับ input parameters
   */
  abstract readonly inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };

  /**
   * Zod schema สำหรับ validation (optional)
   * ถ้ามี จะใช้แทน validateArgs แบบเก่า
   */
  protected zodSchema?: z.ZodSchema<T>;

  /**
   * ได้ tool definition สำหรับการลงทะเบียน
   */
  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    };
  }

  /**
   * ตรวจสอบความถูกต้องของ arguments ด้วย Zod (ถ้ามี) หรือ fallback validation
   */
  protected validateArgs(args: any): T {
    if (this.zodSchema) {
      return this.validateWithZod(args);
    }
    
    // Fallback validation แบบเก่า
    this.validateArgsLegacy(args);
    return args as T;
  }

  /**
   * ตรวจสอบด้วย Zod schema
   */
  private validateWithZod(args: any): T {
    try {
      console.log(`🔍 ตรวจสอบพารามิเตอร์ด้วย Zod สำหรับ tool: ${this.name}`);
      const result = this.zodSchema!.parse(args);
      console.log(`✅ พารามิเตอร์ผ่านการตรวจสอบ Zod`);
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        console.error(`❌ Zod validation ล้มเหลว: ${errorMessages}`);
        
        throw new McpError(
          ErrorCode.InvalidParams,
          `พารามิเตอร์ไม่ถูกต้อง: ${errorMessages}`
        );
      }
      throw error;
    }
  }

  /**
   * ตรวจสอบความถูกต้องของ arguments แบบเก่า (legacy)
   */
  private validateArgsLegacy(args: any): void {
    if (!args || typeof args !== 'object') {
      throw new McpError(
        ErrorCode.InvalidParams,
        'พารามิเตอร์ต้องเป็น object'
      );
    }

    // ตรวจสอบ required fields
    const required = this.inputSchema.required || [];
    for (const field of required) {
      if (!(field in args)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `ไม่พบพารามิเตอร์ที่จำเป็น: ${field}`
        );
      }
    }

    // ตรวจสอบ type ของแต่ละ property
    const properties = this.inputSchema.properties;
    for (const [key, value] of Object.entries(args)) {
      if (key in properties) {
        const expectedType = properties[key].type;
        const actualType = typeof value;
        
        if (expectedType === 'number' && actualType !== 'number') {
          throw new McpError(
            ErrorCode.InvalidParams,
            `พารามิเตอร์ ${key} ต้องเป็นตัวเลข`
          );
        }
        
        if (expectedType === 'string' && actualType !== 'string') {
          throw new McpError(
            ErrorCode.InvalidParams,
            `พารามิเตอร์ ${key} ต้องเป็น string`
          );
        }
        
        if (expectedType === 'boolean' && actualType !== 'boolean') {
          throw new McpError(
            ErrorCode.InvalidParams,
            `พารามิเตอร์ ${key} ต้องเป็น boolean`
          );
        }

        // ตรวจสอบ enum values
        if (properties[key].enum && !properties[key].enum.includes(value)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `พารามิเตอร์ ${key} ต้องเป็นหนึ่งใน: ${properties[key].enum.join(', ')}`
          );
        }
      }
    }
  }

  /**
   * สร้าง response ในรูปแบบมาตรฐาน
   */
  protected createResponse(text: string): ToolResponse {
    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  }

  /**
   * Method สำหรับการทำงานของ tool
   * ต้อง implement ใน subclass
   */
  abstract execute(args: T): Promise<ToolResponse> | ToolResponse;

  /**
   * Method สำหรับเรียกใช้ tool พร้อมการตรวจสอบ
   */
  async call(args: any): Promise<ToolResponse> {
    try {
      console.log(`🔧 เรียกใช้ tool: ${this.name} พร้อมพารามิเตอร์:`, args);
      
      const validatedArgs = this.validateArgs(args);
      const result = await this.execute(validatedArgs);
      
      console.log(`✅ tool ${this.name} ทำงานสำเร็จ`);
      return result;
      
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดใน tool ${this.name}:`, error);
      
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `เกิดข้อผิดพลาดภายในใน tool ${this.name}: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`
      );
    }
  }
}
