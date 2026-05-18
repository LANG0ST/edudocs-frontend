import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f4efef] px-5 py-5">
      <div className="grid min-h-[calc(100vh-40px)] grid-cols-1 lg:grid-cols-[1.1fr_1.2fr] gap-10">

        <section className="flex flex-col pt-10 md:pl-20  items-stretch h-full">
          <div className="max-w-[520px] mt-10 flex flex-col gap-5 justify-center   h-full">
            <h1 className="text-[40px] leading-[0.95] font-bold tracking-[-2px] text-[#102447]">
              Accedez a votre compte
            </h1>

            <div className="mt-10 max-w-[460px]">
              <LoginForm hideHeader />
            </div>



          </div>

          <div className="mt-auto text-sm font-bold text-gray-500 max-w-[460px] pb-4">
            2025 EDUDOCS — All rights reserved
          </div>

        </section>



        <section className="relative overflow-hidden rounded-[38px]">

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/login/bg-login.png')",
            }}
          />

          <div className="relative z-10 flex h-full flex-col p-8 md:p-15">

            <div className="max-w-[620px]">
              <h2 className="text-[56px] font-extrabold leading-none text-white">
                EduDocs
              </h2>

              <p className="mt-5 text-[24px] leading-[1.45] text-white/90">
                Portail officiel de l'université Cadi Ayyad pour le retrait des documents officiels et vérifiables.
              </p>
            </div>

            <div className="max-w-[800px] justify-center items-center hidden relative sm:flex sm:flex-1 mt-8 mb-8 ml-5">
              <Image
                src="/images/login/obj-login.png"
                alt="folder"
                fill
                priority
                className="
                object-contain
                object-bottom-left
                animate-[floatTilt_5s_ease-in-out_infinite]
                "
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}