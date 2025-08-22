import { BaseTool, ToolResponse } from './base-tool.js';
import { ExampleToolArgs, ExampleToolArgsSchema } from '../types.js';

/**
 * ตัวอย่าง Tool ใหม่ - สำหรับใช้เป็น template ในการสร้าง tool
 * ลบไฟล์นี้ออกหรือใช้เป็นแนวทางในการสร้าง tool ใหม่
 */
export class ExampleTool extends BaseTool<ExampleToolArgs> {
  readonly name = 'example';
  readonly description = 'ตัวอย่าง tool สำหรับใช้เป็น template';
  readonly inputSchema = {
    type: 'object' as const,
    properties: {
      message: {
        type: 'string',
        description: 'ข้อความที่ต้องการประมวลผล',
      },
      count: {
        type: 'number',
        description: 'จำนวนครั้งที่ต้องการทำซ้ำ',
        minimum: 1,
        maximum: 10,
      },
    },
    required: ['message'],
  };

  // ใช้ Zod schema สำหรับ validation
  protected zodSchema = ExampleToolArgsSchema;

  /**
   * ทำงานของ Example Tool
   */
  execute(args: ExampleToolArgs): ToolResponse {
    const { message, count = 1 } = args;
    
    console.log(`🔄 ประมวลผลข้อความ "${message}" จำนวน ${count} ครั้ง`);
    
    const results = Array.from({ length: count }, (_, i) => 
      `${i + 1}. ${message}`
    ).join('\n');
    
    return this.createResponse(`ผลลัพธ์:\n${results}`);
  }
}

/*
การใช้งาน tool นี้:

1. เพิ่มใน tool-registry.ts:
   import { ExampleTool } from './example-tool.js';
   
   // ใน registerDefaultTools():
   this.registerTool(new ExampleTool());

2. เพิ่ม export ใน index.ts:
   export { ExampleTool } from './example-tool.js';

3. เพิ่ม type definition ใน types.ts (ถ้าจำเป็น):
   export interface ExampleToolArgs {
     message: string;
     count?: number;
   }
*/
