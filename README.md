# MCP Lead Server

Model Context Protocol (MCP) Server พื้นฐานที่สร้างด้วย TypeScript

## คุณสมบัติ

- ✅ MCP Server พื้นฐานพร้อม TypeScript
- ✅ รองรับ Tools: Echo และ Calculator
- ✅ Type Safety ด้วย TypeScript + Zod
- ✅ Runtime Validation ด้วย Zod schemas
- ✅ Error Handling ที่ครบถ้วน
- ✅ Console Logging ภาษาไทย
- ✅ Modular Tool Architecture

## Tools ที่รองรับ

### 1. Echo Tool
ส่งกลับข้อความที่ได้รับ

**พารามิเตอร์:**
- `message` (string): ข้อความที่ต้องการ echo

### 2. Calculate Tool
คำนวณผลลัพธ์ทางคณิตศาสตร์พื้นฐาน

**พารามิเตอร์:**
- `operation` (string): ชนิดของการคำนวณ (add, subtract, multiply, divide)
- `a` (number): ตัวเลขแรก
- `b` (number): ตัวเลขที่สอง

## การติดตั้ง

```bash
# ติดตั้ง dependencies
npm install

# Build โปรเจค
npm run build

# รัน development mode
npm run dev

# รัน production
npm start
```

## การใช้งาน

```bash
# Development mode
npm run dev

# Build และรัน
npm run build
npm start
```

## โครงสร้างโปรเจค

```
mcp-lead/
├── src/
│   ├── index.ts              # Main server file
│   ├── types.ts              # Type definitions
│   └── tools/                # Tools directory
│       ├── index.ts          # Tools exports
│       ├── base-tool.ts      # Base tool class
│       ├── echo-tool.ts      # Echo tool implementation
│       ├── calculate-tool.ts # Calculate tool implementation
│       └── tool-registry.ts  # Tool registry manager
├── dist/                     # Build output
├── package.json
├── tsconfig.json
└── README.md
```

## การพัฒนาต่อ

### เพิ่ม Tool ใหม่

1. สร้างไฟล์ tool ใหม่ใน `src/tools/` โดยสืบทอดจาก `BaseTool`
2. ลงทะเบียน tool ใน `ToolRegistry` (`src/tools/tool-registry.ts`)
3. เพิ่ม export ใน `src/tools/index.ts`
4. เพิ่ม type definitions ใน `src/types.ts` ถ้าจำเป็น

### ตัวอย่างการสร้าง Tool ใหม่

```typescript
// src/tools/my-new-tool.ts
import { BaseTool, ToolResponse } from './base-tool.js';

export class MyNewTool extends BaseTool {
  readonly name = 'my-tool';
  readonly description = 'คำอธิบาย tool ของฉัน';
  readonly inputSchema = {
    type: 'object' as const,
    properties: {
      input: { type: 'string', description: 'พารามิเตอร์อินพุต' }
    },
    required: ['input']
  };

  execute(args: any): ToolResponse {
    return this.createResponse(`ผลลัพธ์: ${args.input}`);
  }
}
```

### Architecture

- **BaseTool**: Base class สำหรับ tools ทั้งหมด พร้อม Zod validation
- **ToolRegistry**: จัดการการลงทะเบียนและเรียกใช้ tools
- **Type Safety**: TypeScript types ที่สร้างจาก Zod schemas
- **Runtime Validation**: ตรวจสอบข้อมูลตอน runtime ด้วย Zod
- **Error Handling**: ข้อความ error ภาษาไทยที่ชัดเจน

## Zod Validation

โปรเจคนี้ใช้ Zod สำหรับ:

### ✨ คุณสมบัติของ Zod
- 🔒 **Type Safety**: TypeScript types ที่สร้างจาก schema
- 🛡️ **Runtime Validation**: ตรวจสอบข้อมูลตอน runtime  
- 📝 **Custom Error Messages**: ข้อความ error ภาษาไทย
- 🔧 **Complex Validation**: การตรวจสอบที่ซับซ้อน (เช่น หารด้วยศูนย์)
- 🚀 **Performance**: รวดเร็วและมีประสิทธิภาพ

### 💡 ตัวอย่างการใช้งาน
```typescript
// สร้าง Zod schema
const MyToolSchema = z.object({
  name: z.string().min(1, 'ชื่อต้องไม่เป็นค่าว่าง'),
  age: z.number().min(0).max(150, 'อายุต้องอยู่ระหว่าง 0-150')
});

// สร้าง TypeScript type จาก schema
type MyToolArgs = z.infer<typeof MyToolSchema>;

// ใช้ในการ validate
const result = MyToolSchema.parse(userInput);
```

## License

MIT
