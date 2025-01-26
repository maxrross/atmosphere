"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import CLOUDS from "vanta/dist/vanta.clouds.min"
import Link from "next/link"

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

export default function Home() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const [vantaEffect, setVantaEffect] = useState<ReturnType<typeof CLOUDS> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize Vanta effect
  useEffect(() => {
    if (!mounted || !vantaRef.current) return

    window.THREE = THREE;

    if (!vantaEffect) {
      setVantaEffect(
        CLOUDS({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          backgroundColor: 0xffffff,
          skyColor: 0xe8b197,
          cloudColor: 0xadc1de,
          cloudShadowColor: 0x183550,
          sunColor: 0xff9919,
          sunGlareColor: 0xff6633,
          sunlightColor: 0xff9933,
          speed: 1.0
        })
      )
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [mounted, vantaEffect])

  const content = (
    <div className="text-center space-y-4 max-w-4xl mx-auto px-4">
      <h1 className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
        Atmosphere
      </h1>
      <p className="text-xl md:text-2xl font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent max-w-2xl mx-auto">
        Explore air quality and predictions around the world
      </p>
      <div className="pb-24">
        <Link 
          href="/map" 
          className="group relative inline-flex items-center justify-center px-8 py-3.5 text-lg font-medium text-white overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-full transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_8px_25px_-8px_rgba(0,0,0,0.3)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-sky-400/20 before:via-transparent before:to-purple-500/20 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100"
        >
          <span className="relative z-10 flex items-center gap-2">
            Explore Map
            <svg className="w-5 h-5 transition-transform duration-300 ease-out transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  )

  if (!mounted) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div ref={vantaRef} className="relative min-h-screen">
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {content}
      </div>
    </div>
  )
}

