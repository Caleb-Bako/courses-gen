// ClientLocalStorageHandler.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClientLocalStorageHandler() {
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem("steps-data")
    if (saved) {
      const parsed = JSON.parse(saved)
      // Redirect to same page with query param (or call API)
      router.replace(`/dashboard?step=${parsed.step}`)
    }
  }, [])

  return null
}
