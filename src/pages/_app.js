// src/pages/_app.js
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const publicRoutes = ["/auth/login", "/auth/register"];
    const token =
      localStorage.getItem("token") || localStorage.getItem("auth_token");

    if (!token && !publicRoutes.includes(router.pathname)) {
      if (router.pathname !== "/auth/login") {
        router.replace("/auth/login");
      }
    }

    if (
      token &&
      (publicRoutes.includes(router.pathname) || router.pathname === "/")
    ) {
      if (router.pathname !== "/dashboard") {
        router.replace("/dashboard");
      }
    }
  }, [router.isReady, router.pathname]);

  return (
    <AuthProvider>
      {/* ✅ ใช้ฟอนต์ ig ทั้งเว็บ */}
      <div className="font-ig">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
