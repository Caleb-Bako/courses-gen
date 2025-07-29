"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Clock, Brain, ArrowRight, GraduationCap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import LoadingThreeDotsJumping from "@/components/animations/loading"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
}

export default function Home() {
  const [loading,setLoading] = useState<Boolean>(false)

  function isLoading(){
    setLoading(true)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      {loading ? <LoadingThreeDotsJumping/>:(
      <div>
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div className="max-w-4xl mx-auto" initial="initial" animate="animate" variants={staggerContainer}>
          <motion.h1 className="text-5xl font-bold text-gray-900 mb-6" variants={fadeInUp}>
            AI-Powered Study Planning for
            <motion.span
              className="text-blue-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {" "}
              Smart Students
            </motion.span>
          </motion.h1>

          <motion.p className="text-xl text-gray-600 mb-8 leading-relaxed" variants={fadeInUp}>
            Generate personalized timetables and manage carry-over courses with intelligent AI assistance. Optimize your
            study schedule based on course intensity and learning patterns.
          </motion.p>

          <motion.div className="flex flex-col gap-6 md:flex-row justify-center space-x-4" variants={fadeInUp}>
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                onClick={isLoading}
                size="lg" className="px-8 py-3">
                  Start Demo Now
                </Button>
              </motion.div>
            </Link>
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                  View Documentation
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Features - Two Sectors */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Two Powerful Tools for Academic Success</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the right tool for your academic needs - whether you need a personalized study timetable or help
            managing carry-over courses.
          </p>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto"
          initial="initial"
          whileInView="animate"
          variants={staggerContainer}
          viewport={{ once: true }}
        >
          {/* Timetable Generator Sector */}
          <motion.div variants={scaleIn}>
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 bg-gradient-to-br from-blue-50 to-blue-100 group">
              <CardHeader className="text-center pb-8">
                <motion.div
                  className="mx-auto mb-6 p-4 bg-blue-600 rounded-full w-20 h-20 flex items-center justify-center"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Calendar className="h-10 w-10 text-white" />
                </motion.div>
                <CardTitle className="text-2xl mb-4">Timetable Generator</CardTitle>
                <CardDescription className="text-base">
                  Create AI-optimized study schedules in 3 simple steps
                </CardDescription>
              </CardHeader>

              {/* 3-Step Process */}
              <motion.div className="space-y-6 mb-8" variants={staggerContainer}>
                {[
                  { step: 1, title: "Input Courses", desc: "Add courses with intensity and category" },
                  { step: 2, title: "Chat with AI", desc: "Get personalized study time recommendations" },
                  { step: 3, title: "Generate Timetable", desc: "Get your optimized weekly schedule" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-4"
                    variants={slideInLeft}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                      whileHover={{ scale: 1.2 }}
                    >
                      {item.step}
                    </motion.div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <Link href="/timetable-generator" className="block">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                  onClick={isLoading}
                  className="w-full group-hover:bg-blue-700 transition-colors" size="lg">
                    Create Timetable
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </Card>
          </motion.div>

          {/* Carry-over Course Management Sector */}
          <motion.div variants={scaleIn}>
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 bg-gradient-to-br from-green-50 to-green-100 group">
              <CardHeader className="text-center pb-8">
                <motion.div
                  className="mx-auto mb-6 p-4 bg-green-600 rounded-full w-20 h-20 flex items-center justify-center"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <GraduationCap className="h-10 w-10 text-white" />
                </motion.div>
                <CardTitle className="text-2xl mb-4">Carry-over Management</CardTitle>
                <CardDescription className="text-base">
                  Smart course selection within credit unit limits
                </CardDescription>
              </CardHeader>

              {/* Features */}
              <motion.div className="space-y-4 mb-8" variants={staggerContainer}>
                {[
                  "Credit unit tracking and limits",
                  "Course prerequisite validation",
                  "AI-powered course recommendations",
                  "Semester planning optimization",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    variants={slideInLeft}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-green-600 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: index * 0.2 }}
                    />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              <Link href="/course-management" className="block">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 group-hover:bg-green-700 transition-colors"
                    size="lg"
                  >
                    Manage Courses
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Additional Features */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Powered by Advanced AI</h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial="initial"
          whileInView="animate"
          variants={staggerContainer}
          viewport={{ once: true }}
        >
          {[
            {
              icon: Brain,
              color: "blue",
              title: "Smart Scheduling",
              desc: "AI analyzes course difficulty and your learning patterns to create optimal study schedules.",
            },
            {
              icon: MessageSquare,
              color: "green",
              title: "Interactive Chat",
              desc: "Collaborate with AI to fine-tune your schedule and get personalized study recommendations.",
            },
            {
              icon: Clock,
              color: "purple",
              title: "Time Optimization",
              desc: "Maximize productivity by scheduling intensive courses during your peak focus hours.",
            },
          ].map((feature, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6 group">
                <motion.div whileHover={{ y: -10, rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                  <feature.icon className={`h-12 w-12 text-${feature.color}-600 mx-auto mb-4`} />
                </motion.div>
                <CardTitle className="mb-2">{feature.title}</CardTitle>
                <CardDescription>{feature.desc}</CardDescription>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="bg-blue-600 text-white py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Study Schedule?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-blue-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Join thousands of students who have improved their academic performance with StudyPlan AI.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={isLoading}
                  size="lg" variant="secondary" className="px-8 py-3">
                  Get Started Free
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-gray-900 text-white py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div className="flex items-center justify-center space-x-2 mb-4" whileHover={{ scale: 1.05 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Calendar className="h-6 w-6" />
            </motion.div>
            <span className="text-xl font-bold">StudyPlan AI</span>
          </motion.div>
          <p className="text-gray-400">© 2024 StudyPlan AI. All rights reserved.</p>
        </div>
      </motion.footer>
      </div>
    )}
    </div>
  )
}
