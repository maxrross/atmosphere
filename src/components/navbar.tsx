"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <nav className={`absolute w-full z-20 ${isHome ? "" : "border-b bg-white"}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className={`text-xl font-black ${
            isHome 
              ? "bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent" 
              : "text-slate-900"
          }`}
        >
          Atmosphere
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/map" 
            className={`text-base font-medium ${
              isHome 
                ? "bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent hover:from-slate-700 hover:to-slate-900" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Map
          </Link>
        </div>
      </div>
    </nav>
  )
}

