"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut" },
}

interface AnimatedWrapperProps {
  children: ReactNode
  variant?: "fadeInUp" | "slideInLeft" | "scaleIn" | "staggerContainer"
  className?: string
  delay?: number
}

export function AnimatedWrapper({ children, variant = "fadeInUp", className, delay = 0 }: AnimatedWrapperProps) {
  const variants = {
    fadeInUp,
    slideInLeft,
    scaleIn,
    staggerContainer,
  }

  const selectedVariant = variants[variant]

  // Handle transition properly with type checking
  let transition: any = { delay }

  if (variant !== "staggerContainer" && "transition" in selectedVariant) {
    transition = { ...selectedVariant.transition, delay }
  }

  return (
    <motion.div
      className={className}
      variants={selectedVariant}
      initial="initial"
      animate="animate"
      transition={transition}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
      {children}
    </motion.div>
  )
}

export function AnimatedButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={className}>
      {children}
    </motion.div>
  )
}

export function AnimatedCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={scaleIn}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className="relative">
      <div className={`h-2 bg-gray-200 rounded-full ${className}`} />
      <motion.div
        className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      />
    </div>
  )
}
