/**
 * ตัวอย่างการใช้งาน Zod validation
 * ไฟล์นี้แสดงวิธีการใช้งาน Zod schemas ที่สร้างไว้
 * 
 * หลังจากรัน npm install แล้ว สามารถนำ code นี้ไปใช้ได้
 */

// import { EchoToolArgsSchema, CalculateToolArgsSchema } from './types.js';

/**
 * ตัวอย่างการ validate Echo Tool arguments
 */
export function validateEchoArgs(args: unknown) {
  // const result = EchoToolArgsSchema.parse(args);
  // console.log('Validated Echo args:', result);
  // return result;
  
  // Placeholder สำหรับการทดสอบก่อนติดตั้ง Zod
  console.log('Echo args validation placeholder:', args);
  return args;
}

/**
 * ตัวอย่างการ validate Calculate Tool arguments
 */
export function validateCalculateArgs(args: unknown) {
  // const result = CalculateToolArgsSchema.parse(args);
  // console.log('Validated Calculate args:', result);
  // return result;
  
  // Placeholder สำหรับการทดสอบก่อนติดตั้ง Zod
  console.log('Calculate args validation placeholder:', args);
  return args;
}

/**
 * ตัวอย่างการใช้งาน safeParse สำหรับการ validate ที่ปลอดภัย
 */
export function safeValidateArgs(args: unknown) {
  // const result = EchoToolArgsSchema.safeParse(args);
  // 
  // if (result.success) {
  //   console.log('✅ Validation สำเร็จ:', result.data);
  //   return { success: true, data: result.data };
  // } else {
  //   console.log('❌ Validation ล้มเหลว:', result.error.errors);
  //   return { success: false, errors: result.error.errors };
  // }
  
  // Placeholder
  console.log('Safe validation placeholder:', args);
  return { success: true, data: args };
}

/**
 * ตัวอย่าง error messages ที่ Zod จะส่งกลับ
 */
export const zodValidationExamples = {
  echoTool: {
    valid: { message: "สวัสดี" },
    invalid: [
      {}, // ไม่มี message
      { message: "" }, // message ว่าง
      { message: 123 }, // message ไม่ใช่ string
    ]
  },
  
  calculateTool: {
    valid: { operation: "add", a: 5, b: 3 },
    invalid: [
      { operation: "add", a: 5 }, // ไม่มี b
      { operation: "invalid", a: 5, b: 3 }, // operation ไม่ถูกต้อง
      { operation: "divide", a: 5, b: 0 }, // หารด้วยศูนย์
      { operation: "add", a: "5", b: 3 }, // a ไม่ใช่ number
    ]
  }
};

/**
 * ข้อดีของการใช้ Zod:
 * 
 * 1. 🔒 Type Safety: TypeScript types ที่สร้างจาก schema
 * 2. 🛡️ Runtime Validation: ตรวจสอบข้อมูลตอน runtime
 * 3. 📝 Custom Error Messages: ข้อความ error ภาษาไทยที่ชัดเจน
 * 4. 🔧 Complex Validation: refine() สำหรับการตรวจสอบที่ซับซ้อน
 * 5. 🚀 Performance: รวดเร็วและมีประสิทธิภาพ
 * 6. 🔄 Transform: แปลงข้อมูลระหว่างการ validate
 * 7. 🧪 Parsing: safeParse() สำหรับการจัดการ error อย่างปลอดภัย
 */
