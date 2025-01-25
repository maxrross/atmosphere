"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import CLOUDS from "vanta/dist/vanta.clouds.min"

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

export default function Home() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const [vantaEffect, setVantaEffect] = useState<any>(null)
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
          mouseControls: true,
          touchControls: true,
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
  }, [mounted])

  const content = (
    <div className="text-center space-y-2 max-w-4xl mx-auto px-4">
      <h1 className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 bg-clip-text text-transparent">
        Atmosphere
      </h1>
      <p className="text-xl md:text-2xl font-medium bg-gradient-to-t from-slate-600 to-slate-900 bg-clip-text text-transparent max-w-2xl mx-auto">
        Explore air quality and predictions around the world
      </p>
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

