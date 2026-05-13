'use client'

import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh md:min-h-screen md:h-screen md:overflow-y-hidden grid-cols-1 md:grid-cols-3 lg:grid-cols-5 p-4 gap-4">
      <div className="col-span-1 flex items-center justify-center bg-neutral-100 p-4 md:p-8 h-full max-h-full md:overflow-y-auto md:col-span-1 lg:col-span-2">
        <div className="w-full max-w-md h-full flex flex-col justify-between">{children}</div>
      </div>
      <div className="relative col-span-2 hidden md:block lg:col-span-3 ">
        <div className="absolute inset-0 h-full w-full bg-cover bg-center grayscale z-40" style={{backgroundImage: `url(/api/assets/home/landscape/competition_11zon.webp)`}}></div>
        <div className=" absolute inset-0 h-full w-full bg-purple-900/40 z-50"></div>
      </div>
    </main>
  );
}
