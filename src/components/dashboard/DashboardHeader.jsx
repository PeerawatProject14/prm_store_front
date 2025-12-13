import Image from "next/image";

export default function DashboardHeader() {
  return (
    <section className="flex flex-col items-center mt-8 mb-10 px-4">
      {/* Logo Wrapper: เหมือน Profile IG */}
      <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 mb-4">
        <div className="p-[2px] rounded-full bg-white">
            <Image
                src="/logo.png"
                alt="Logo"
                width={130}
                height={130}
                priority
                className="rounded-full object-cover border border-gray-100"
            />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        Piramid Solution Co.,Ltd
      </h1>

      {/* <p className="text-gray-500 mt-1 text-sm font-medium">
        เลือกบริการที่คุณต้องการใช้งาน
      </p> */}
    </section>
  );
}