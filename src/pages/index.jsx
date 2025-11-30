import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // เมื่อเข้ามาหน้านี้ ให้ย้ายไป /dashboard ทันที
    router.replace('/dashboard');
  }, [router]);

  // ระหว่างรอเปลี่ยนหน้า ไม่ต้องแสดงอะไร (หรือใส่ Loading spinner ก็ได้)
  return null; 
}