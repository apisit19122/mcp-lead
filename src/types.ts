/**
 * Type definitions สำหรับ MCP Lead Server
 */

import { z } from 'zod';

// ============================================================================
// Zod Schemas สำหรับ validation
// ============================================================================

/**
 * Schema สำหรับ Echo Tool arguments
 */
export const EchoToolArgsSchema = z.object({
  message: z.string().min(1, 'ข้อความต้องไม่เป็นค่าว่าง'),
});

/**
 * Schema สำหรับ Calculate Tool arguments
 */
export const CalculateToolArgsSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide'], {
    errorMap: () => ({ message: 'operation ต้องเป็น add, subtract, multiply, หรือ divide' }),
  }),
  a: z.number({
    required_error: 'ตัวเลขแรก (a) จำเป็นต้องระบุ',
    invalid_type_error: 'ตัวเลขแรก (a) ต้องเป็นตัวเลข',
  }),
  b: z.number({
    required_error: 'ตัวเลขที่สอง (b) จำเป็นต้องระบุ',
    invalid_type_error: 'ตัวเลขที่สอง (b) ต้องเป็นตัวเลข',
  }),
}).refine(
  (data: { operation: string; b: number }) => !(data.operation === 'divide' && data.b === 0),
  {
    message: 'ไม่สามารถหารด้วยศูนย์ได้',
    path: ['b'],
  }
);

/**
 * Schema สำหรับ Example Tool arguments
 */
export const ExampleToolArgsSchema = z.object({
  message: z.string().min(1, 'ข้อความต้องไม่เป็นค่าว่าง'),
  count: z.number().int().min(1).max(10).optional().default(1),
});

// ============================================================================
// Type definitions จาก Zod schemas
// ============================================================================

/**
 * Interface สำหรับ tool arguments ของ echo tool
 */
export type EchoToolArgs = z.infer<typeof EchoToolArgsSchema>;

/**
 * Interface สำหรับ tool arguments ของ calculate tool
 */
export type CalculateToolArgs = z.infer<typeof CalculateToolArgsSchema>;

/**
 * Interface สำหรับ tool arguments ของ example tool
 */
export type ExampleToolArgs = z.infer<typeof ExampleToolArgsSchema>;

/**
 * Union type สำหรับ tool arguments ทั้งหมด
 */
export type ToolArgs = EchoToolArgs | CalculateToolArgs | ExampleToolArgs;

/**
 * Interface สำหรับ server configuration
 */
export interface ServerConfig {
  name: string;
  version: string;
  description?: string;
}

/**
 * Interface สำหรับ tool definition
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
 * Interface สำหรับ tool response
 */
export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

/**
 * Enum สำหรับ operation types
 */
export enum MathOperation {
  ADD = 'add',
  SUBTRACT = 'subtract',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide',
}

/**
 * Interface สำหรับ calculation result
 */
export interface CalculationResult {
  operation: MathOperation;
  operandA: number;
  operandB: number;
  result: number;
  expression: string;
}
