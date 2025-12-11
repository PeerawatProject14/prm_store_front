/**
 * แปลงไฟล์ (File Object) เป็น Base64 String
 * @param {File} file - ไฟล์ที่ได้จาก <input type="file">
 * @returns {Promise<string>} - Base64 String ที่พร้อมแสดงผลหรือส่งเข้า DB
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // อ่านไฟล์และแปลงเป็น Data URL (เช่น data:image/png;base64,xxxx...)
        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};