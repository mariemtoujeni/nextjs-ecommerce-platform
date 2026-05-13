"use client"

import { useDictionary } from "~/hooks/use-dictionary"

export function NavbarScrollingText() {
  const { dict, loading } = useDictionary()

  return (
    <div className="bg-black flex justify-center items-center max-w-svw">
      <p className="text-white">
        {loading ? "..." : dict?.navbar.scrollingText || "Texte qui doit défiler"}
      </p>
    </div>
  )
} 