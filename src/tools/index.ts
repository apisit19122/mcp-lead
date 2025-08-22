import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { BaseTool } from './base-tool.js';

/**
 * Export ทั้งหมดสำหรับ tools module
 * ไฟล์นี้ทำให้ import tools ได้ง่ายขึ้น และ auto import tools จากไฟล์ .tool.ts
 * 
 * วิธีการใช้งาน:
 * 1. สร้างไฟล์ tool ใหม่ชื่อ xxx.tool.ts ใน directory นี้ หรือใน subfolder ใดๆ
 * 2. export class ที่ extend จาก BaseTool
 * 3. ระบบจะ auto detect และ register tool อัตโนมัติ (รองรับ nested folders)
 * 
 * ตัวอย่าง:
 * ```typescript
 * // สามารถใส่ไฟล์ใน:
 * // tools/myTool.tool.ts
 * // tools/category/myTool.tool.ts  
 * // tools/deep/nested/folder/myTool.tool.ts
 * 
 * export class MyNewTool extends BaseTool<MyArgs> {
 *   readonly name = 'myTool';
 *   readonly description = 'คำอธิบาย tool';
 *   // ... implementation
 * }
 * ```
 */

// Base classes และ interfaces
export { BaseTool, type ToolDefinition, type ToolResponse } from './base-tool.js';

// Tool Registry
export { ToolRegistry } from './tool-registry.js';
import { ToolRegistry as ToolRegistryClass } from './tool-registry.js';

// Auto import tools จากไฟล์ .tool.ts
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ฟังก์ชันสำหรับค้นหาไฟล์ .tool.ts ในทุก subfolder
function findToolFiles(dir: string, basePath: string = ''): string[] {
  const toolFiles: string[] = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = basePath ? `${basePath}/${item}` : item;
    
    try {
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // ถ้าเป็น directory ให้ scan เข้าไปใน subfolder
        const subToolFiles = findToolFiles(fullPath, relativePath);
        toolFiles.push(...subToolFiles);
      } else if (stat.isFile() && (item.endsWith('.tool.ts') || item.endsWith('.tool.js'))) {
        // ถ้าเป็นไฟล์ .tool.ts หรือ .tool.js
        toolFiles.push(relativePath);
      }
    } catch (error) {
      console.warn(`⚠️ ไม่สามารถเข้าถึง ${fullPath}:`, error);
    }
  }
  
  return toolFiles;
}

// ฟังก์ชันสำหรับ auto discover และ import tools
async function discoverTools(): Promise<Array<new () => BaseTool>> {
  const toolsDir = __dirname;
  const toolFiles = findToolFiles(toolsDir);
  
  const toolClasses: Array<new () => BaseTool> = [];
  
  for (const file of toolFiles) {
    try {
      // แปลง path สำหรับ import (เปลี่ยน .ts เป็น .js และเพิ่ม ./ ข้างหน้า)
      const modulePath = `./${file.replace('.ts', '.js')}`;
      const module = await import(modulePath);
      
      // หา class ที่ extend จาก BaseTool
      for (const [exportName, exportValue] of Object.entries(module)) {
        if (typeof exportValue === 'function' && 
            exportValue.prototype instanceof BaseTool) {
          toolClasses.push(exportValue as new () => BaseTool);
        }
      }
    } catch (error) {
      console.warn(`⚠️ ไม่สามารถโหลด tool จาก ${file}:`, error);
    }
  }
  
  return toolClasses;
}

// เก็บ tool classes ที่ discover แล้ว
let discoveredToolClasses: Array<new () => BaseTool> | null = null;

// ฟังก์ชันสำหรับดึง tool classes
export async function getDiscoveredToolClasses(): Promise<Array<new () => BaseTool>> {
  if (!discoveredToolClasses) {
    discoveredToolClasses = await discoverTools();
  }
  return discoveredToolClasses;
}

// สร้าง function สำหรับสร้าง registry พร้อม auto-discovered tools
export async function createDefaultToolRegistry(): Promise<ToolRegistryClass> {
  const registry = new ToolRegistryClass();
  await registry.initializeDefaultTools();
  return registry;
}

// Export tool classes เพื่อให้สามารถ import ได้แยก
export async function getAllToolClasses(): Promise<{[key: string]: new () => BaseTool}> {
  const toolClasses = await getDiscoveredToolClasses();
  const result: {[key: string]: new () => BaseTool} = {};
  
  for (const ToolClass of toolClasses) {
    result[ToolClass.name] = ToolClass;
  }
  
  return result;
}
