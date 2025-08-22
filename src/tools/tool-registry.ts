import { BaseTool, ToolDefinition, ToolResponse } from './base-tool.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { getDiscoveredToolClasses } from './index.js';

/**
 * Tool Registry - จัดการการลงทะเบียนและเรียกใช้ tools
 * ใช้เป็นจุดกลางในการจัดการ tools ทั้งหมด
 */
export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  /**
   * ลงทะเบียน tools พื้นฐานแบบ auto-discovery
   */
  async initializeDefaultTools(): Promise<void> {
    try {
      const toolClasses = await getDiscoveredToolClasses();
      
      for (const ToolClass of toolClasses) {
        const toolInstance = new ToolClass();
        this.registerTool(toolInstance);
      }
      
      console.log(`✅ ลงทะเบียน tools เสร็จสิ้น (${this.tools.size} tools)`);
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการ auto-discovery tools:', error);
      throw error;
    }
  }

  /**
   * ลงทะเบียน tool ใหม่
   */
  registerTool(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * ยกเลิกการลงทะเบียน tool
   */
  unregisterTool(toolName: string): boolean {
    const success = this.tools.delete(toolName);
    
    if (success) {
      console.log(`➖ ยกเลิกการลงทะเบียน tool: ${toolName}`);
    } else {
      console.warn(`⚠️ ไม่พบ tool ชื่อ: ${toolName}`);
    }
    
    return success;
  }

  /**
   * ดึงรายการ tool definitions ทั้งหมด
   */
  getToolDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(tool => tool.getDefinition());
  }

  /**
   * ดึงรายชื่อ tools ทั้งหมด
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * ตรวจสอบว่ามี tool อยู่หรือไม่
   */
  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  /**
   * ดึง tool ตามชื่อ
   */
  getTool(toolName: string): BaseTool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * เรียกใช้ tool ตามชื่อ
   */
  async callTool(toolName: string, args: any): Promise<ToolResponse> {
    const tool = this.tools.get(toolName);
    
    if (!tool) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `ไม่พบ tool ชื่อ: ${toolName}`
      );
    }

    return await tool.call(args);
  }

  /**
   * แสดงสถิติการใช้งาน tools
   */
  getStats(): {
    totalTools: number;
    toolNames: string[];
    toolDescriptions: Record<string, string>;
  } {
    const toolDescriptions: Record<string, string> = {};
    
    for (const [name, tool] of this.tools.entries()) {
      toolDescriptions[name] = tool.description;
    }

    return {
      totalTools: this.tools.size,
      toolNames: this.getToolNames(),
      toolDescriptions,
    };
  }

  /**
   * ล้าง tools ทั้งหมด
   */
  clear(): void {
    const count = this.tools.size;
    this.tools.clear();
    console.log(`🧹 ล้าง tools ทั้งหมด (${count} tools)`);
  }

  /**
   * โหลด tools จากอาร์เรย์
   */
  loadTools(tools: BaseTool[]): void {
    console.log(`📦 โหลด ${tools.length} tools...`);
    
    for (const tool of tools) {
      this.registerTool(tool);
    }
    
    console.log(`✅ โหลด tools เสร็จสิ้น`);
  }

  /**
   * ส่งออกการตั้งค่า tools สำหรับการบันทึก
   */
  exportConfig(): {
    tools: Array<{
      name: string;
      description: string;
      enabled: boolean;
    }>;
  } {
    return {
      tools: Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        enabled: true,
      })),
    };
  }
}
