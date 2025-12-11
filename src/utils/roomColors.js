export const ROOM_COLORS = [
    // 1. Blue (โทนเย็น - ฟ้าเข้ม)
    { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', dot: 'bg-blue-500', badge: 'bg-blue-100' },

    // 2. Orange (โทนร้อน - ตัดกับฟ้าชัดเจน)
    { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', dot: 'bg-orange-500', badge: 'bg-orange-100' },

    // 3. Purple (โทนเย็น - ม่วง)
    { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', dot: 'bg-purple-500', badge: 'bg-purple-100' },

    // 4. Emerald (โทนเย็น - เขียวธรรมชาติ ตัดกับม่วง)
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500', badge: 'bg-emerald-100' },

    // 5. Red (โทนร้อน - แดง ตัดกับเขียว)
    { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500', badge: 'bg-red-100' },

    // 6. Cyan (โทนเย็น - ฟ้าสว่าง ตัดกับแดง)
    { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', dot: 'bg-cyan-500', badge: 'bg-cyan-100' },

    // 7. Amber (โทนร้อน - เหลืองอมส้ม ตัดกับฟ้าสว่าง)
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', dot: 'bg-amber-500', badge: 'bg-amber-100' },

    // 8. Fuchsia (โทนเย็น - บานเย็น ตัดกับเหลือง และไม่ซ้ำกับฟ้าตัวแรก)
    { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-800', dot: 'bg-fuchsia-500', badge: 'bg-fuchsia-100' },
];

export const getRoomColor = (roomId) => {
    let numericId = 0;

    if (typeof roomId === 'number') {
        numericId = roomId;
    } else if (typeof roomId === 'string') {
        // ถ้า ID เป็น string ให้แปลงเป็นผลรวมตัวเลข ascii
        for (let i = 0; i < roomId.length; i++) {
            numericId += roomId.charCodeAt(i);
        }
    }

    // ใช้ ID คำนวณหา index สี
    return ROOM_COLORS[numericId % ROOM_COLORS.length] || ROOM_COLORS[0];
};