import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// บอก Next.js ว่าไม่ต้องแปลง Body เอง (เราจะใช้ formidable แปลง)
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // รับเฉพาะ Method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 1. ตรวจสอบโฟลเดอร์ public/uploads ถ้าไม่มีให้สร้าง
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 2. ตั้งค่าการรับไฟล์
        const form = new IncomingForm({
            uploadDir: uploadDir, // เซฟลงโฟลเดอร์นี้
            keepExtensions: true, // เก็บสกุลไฟล์ไว้ (.webp)
            filename: (name, ext, part, form) => {
                return `room-${Date.now()}${ext}`; // ตั้งชื่อไฟล์ใหม่กันซ้ำ
            },
        });

        // 3. เริ่มอ่านไฟล์จาก Request
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve([fields, files]);
            });
        });

        // 4. ดึงข้อมูลไฟล์ที่อัปโหลดเสร็จแล้ว
        // บางเวอร์ชัน files.file อาจเป็น array หรือ object เดียว
        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!uploadedFile) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // 5. ส่ง Path กลับไปหน้าบ้าน
        return res.status(200).json({
            success: true,
            filepath: `/uploads/${uploadedFile.newFilename}`, // ชื่อไฟล์ใหม่ที่ถูกตั้ง
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return res.status(500).json({ success: false, message: 'Server upload error' });
    }
}