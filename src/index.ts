#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createDefaultToolRegistry, ToolRegistry } from './tools/index.js';

/**
 * MCP Server พื้นฐานด้วย TypeScript
 * รองรับการสร้าง tools และ resources สำหรับ Model Context Protocol
 */
class MCPLeadServer {
  private server: Server;
  private toolRegistry: ToolRegistry | null = null;

  constructor() {
    console.log('🚀 เริ่มต้น MCP Lead Server...');
    
    this.server = new Server(
      {
        name: 'mcp-lead-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * เริ่มต้น tool registry (async)
   */
  private async initializeToolRegistry(): Promise<void> {
    this.toolRegistry = await createDefaultToolRegistry();
  }

  /**
   * ตั้งค่า handlers สำหรับ MCP server
   */
  private setupHandlers(): void {
    // Handler สำหรับการแสดงรายการ tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.log('📋 รับคำขอแสดงรายการ tools');
      
      if (!this.toolRegistry) {
        throw new Error('Tool registry ยังไม่ได้เริ่มต้น');
      }
      
      const tools = this.toolRegistry.getToolDefinitions();
      console.log(`📋 ส่งกลับรายการ tools จำนวน ${tools.length} รายการ`);
      
      return { tools };
    });

    // Handler สำหรับการเรียกใช้ tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (!this.toolRegistry) {
        throw new Error('Tool registry ยังไม่ได้เริ่มต้น');
      }
      
      // ใช้ tool registry เรียกใช้ tool
      const result = await this.toolRegistry.callTool(name, args);
      return result;
    });
  }

  /**
   * ดึงสถิติของ tools ที่ลงทะเบียน
   */
  getToolsStats() {
    if (!this.toolRegistry) {
      throw new Error('Tool registry ยังไม่ได้เริ่มต้น');
    }
    return this.toolRegistry.getStats();
  }

  /**
   * เริ่มต้น server
   */
  async start(): Promise<void> {
    // เริ่มต้น tool registry ก่อน
    await this.initializeToolRegistry();
    
    const transport = new StdioServerTransport();
    
    console.log('🔌 เชื่อมต่อ transport...');
    await this.server.connect(transport);
    
    // Handle graceful shutdown
    const shutdown = async () => {
      try {
        await this.server.close();
      } catch (error) {
        console.error('ข้อผิดพลาดในการปิด server:', error);
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    console.log('🔄 Server กำลังทำงาน... กด Ctrl+C เพื่อปิด');
  }
}

// เริ่มต้น server
async function main() {
  try {
    const server = new MCPLeadServer();
    await server.start();
    
    // Keep the process running
    return new Promise<void>((resolve) => {
      process.on('SIGINT', () => {
        console.log('👋 ปิด server...');
        resolve();
      });
      
      process.on('SIGTERM', () => {
        console.log('👋 ปิด server...');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('💥 ไม่สามารถเริ่มต้น server ได้:', error);
    process.exit(1);
  }
}

// เรียกใช้ main function หากไฟล์นี้ถูกเรียกใช้โดยตรง
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
