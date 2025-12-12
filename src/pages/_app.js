// src/pages/_app.js
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head"; // 1. เพิ่มบรรทัดนี้

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // ... (ส่วน Logic useEffect ของคุณเหมือนเดิม ไม่ต้องแก้) ...
  useEffect(() => {
    if (!router.isReady) return;
    const publicRoutes = ["/auth/login", "/auth/register"];
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");

    if (!token && !publicRoutes.includes(router.pathname)) {
      if (router.pathname !== "/auth/login") {
        router.replace("/auth/login");
      }
    }

    if (token && (publicRoutes.includes(router.pathname) || router.pathname === "/")) {
      if (router.pathname !== "/dashboard") {
        router.replace("/dashboard");
      }
    }
  }, [router.isReady, router.pathname]);

  return (
    <AuthProvider>
      <Head>
        <title>Piramid Services</title>
        <link rel="icon" href="/logo-2.png?v=2" />
      </Head>

      <div className="font-ig">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}