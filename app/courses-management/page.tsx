"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {ArrowLeft,Save,Plus,Trash2,GraduationCap,AlertCircle,CheckCircle2,BookOpen,Calculator,Code,Wrench,FolderOpen,Settings} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { UnderConstructionDialog } from "@/components/ConstructionDialog"
import LoadingThreeDotsJumping from "@/components/animations/loading"

interface Course {
  id: number
  name: string
  code: string
  units: number
  category: string
  description: string
}

export default function CarryOverPage() {
  const [totalCreditLimit, setTotalCreditLimit] = useState(24)
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      name: "Advanced Mathematics",
      code: "MTH 301",
      units: 3,
      category: "calculation",
      description: "Advanced calculus and mathematical analysis",
    },
  ])
  const [open, setOpen] = useState(false);
  const currentCredits = courses.reduce((total, course) => total + course.units, 0)
  const remainingCredits = totalCreditLimit - currentCredits
  const progressPercentage = (currentCredits / totalCreditLimit) * 100
   const [loading, setLoading] = useState(false)

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now(),
      name: "",
      code: "",
      units: 0,
      category: "",
      description: "",
    }
    setCourses([...courses, newCourse])
  }

  const removeCourse = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  const updateCourse = (id: number, field: keyof Course, value: string | number) => {
    setCourses(courses.map((course) => (course.id === id ? { ...course, [field]: value } : course)))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "calculation":
        return <Calculator className="h-4 w-4" />
      case "coding":
        return <Code className="h-4 w-4" />
      case "practical":
        return <Wrench className="h-4 w-4" />
      case "project":
        return <FolderOpen className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "calculation":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "coding":
        return "bg-green-100 text-green-800 border-green-200"
      case "practical":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "project":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isOverLimit = currentCredits > totalCreditLimit

  // function showCoursesList(){
  //   if(isOverLimit){
  //       setOpen(true);
  //   }else{
       
  //   }
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     {loading ? (
        <LoadingThreeDotsJumping color="#25f52fff" />
      ) : (
      <div>
      <UnderConstructionDialog courses={courses} setCourses={setCourses} open={open} onOpenChange={setOpen} limit={isOverLimit}/>
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button onClick={()=>setLoading(true)} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Carry-over Course Management</span>
            </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Credit Limit Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mb-8 border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  <span>Credit Unit Configuration</span>
                </CardTitle>
                <CardDescription>Set your maximum credit unit limit for this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="creditLimit">Total Credit Unit Limit</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        value={totalCreditLimit}
                        onChange={(e) => setTotalCreditLimit(Number(e.target.value))}
                        className="text-lg font-semibold"
                        min="1"
                        max="30"
                      />
                      <p className="text-sm text-gray-600">Typically ranges from 18-24 credit units per semester</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Credit Usage</span>
                        <span className={`text-sm font-bold ${isOverLimit ? "text-red-600" : "text-green-600"}`}>
                          {currentCredits}/{totalCreditLimit} units
                        </span>
                      </div>
                      <Progress value={progressPercentage} className={`h-3 ${isOverLimit ? "bg-red-100" : ""}`} />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {remainingCredits >= 0
                            ? `${remainingCredits} units remaining`
                            : `${Math.abs(remainingCredits)} units over limit`}
                        </span>
                        {isOverLimit && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs">Over limit</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Categories Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Course Categories</CardTitle>
                <CardDescription>Understanding different course types for better planning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Calculator, title: "Calculation", desc: "Math-heavy courses", color: "blue" },
                    { icon: Code, title: "Coding", desc: "Programming courses", color: "green" },
                    { icon: Wrench, title: "Practical", desc: "Lab-based courses", color: "purple" },
                    { icon: FolderOpen, title: "Project", desc: "Project-based courses", color: "orange" },
                  ].map((category, index) => (
                    <motion.div
                      key={category.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`flex items-center space-x-3 p-3 bg-${category.color}-50 rounded-lg border border-${category.color}-200 cursor-pointer`}
                    >
                      <category.icon className={`h-5 w-5 text-${category.color}-600`} />
                      <div>
                        <h4 className={`font-medium text-${category.color}-800`}>{category.title}</h4>
                        <p className={`text-xs text-${category.color}-600`}>{category.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Courses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Semester Courses</span>
                    </CardTitle>
                    <CardDescription>Add and manage your courses for this semester</CardDescription>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={addCourse} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="popLayout">
                  <div className="space-y-6">
                    {courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        layout
                        className="group"
                      >
                        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                          <Card className="border-2 border-gray-200 hover:border-green-300 transition-colors duration-200 hover:shadow-lg">
                            <CardHeader className="pb-4">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Course {index + 1}</CardTitle>
                                {courses.length > 1 && (
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCourse(course.id)}
                                      className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`name-${course.id}`}>Course Name *</Label>
                                    <Input
                                      id={`name-${course.id}`}
                                      placeholder="e.g., Advanced Mathematics"
                                      value={course.name}
                                      onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                                      className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor={`code-${course.id}`}>Course Code *</Label>
                                    <Input
                                      id={`code-${course.id}`}
                                      placeholder="e.g., MTH 301"
                                      value={course.code}
                                      onChange={(e) => updateCourse(course.id, "code", e.target.value)}
                                      className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor={`description-${course.id}`}>Description (Optional)</Label>
                                    <Input
                                      id={`description-${course.id}`}
                                      placeholder="Brief course description..."
                                      value={course.description}
                                      onChange={(e) => updateCourse(course.id, "description", e.target.value)}
                                      className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                                    />
                                  </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`units-${course.id}`}>Credit Units *</Label>
                                    <Select
                                      value={course.units.toString()}
                                      onValueChange={(value) => updateCourse(course.id, "units", Number(value))}
                                    >
                                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-green-500">
                                        <SelectValue placeholder="Select credit units" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 Unit</SelectItem>
                                        <SelectItem value="2">2 Units</SelectItem>
                                        <SelectItem value="3">3 Units</SelectItem>
                                        <SelectItem value="4">4 Units</SelectItem>
                                        <SelectItem value="5">5 Units</SelectItem>
                                        <SelectItem value="6">6 Units</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor={`category-${course.id}`}>Course Category *</Label>
                                    <Select
                                      value={course.category}
                                      onValueChange={(value) => updateCourse(course.id, "category", value)}
                                    >
                                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-green-500">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="calculation">
                                          <div className="flex items-center space-x-2">
                                            <Calculator className="h-4 w-4" />
                                            <span>Calculation</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="coding">
                                          <div className="flex items-center space-x-2">
                                            <Code className="h-4 w-4" />
                                            <span>Coding</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="practical">
                                          <div className="flex items-center space-x-2">
                                            <Wrench className="h-4 w-4" />
                                            <span>Practical</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="project">
                                          <div className="flex items-center space-x-2">
                                            <FolderOpen className="h-4 w-4" />
                                            <span>Project</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Course Preview */}
                                  {course.name && course.category && (
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          {getCategoryIcon(course.category)}
                                          <span className="text-sm font-medium">{course.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge className={getCategoryColor(course.category)}>{course.category}</Badge>
                                          <Badge variant="secondary">{course.units} units</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>

                <Separator className="my-6" />

                {/* Summary Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gray-50 rounded-lg p-6"
                >
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="text-lg font-semibold mb-4 flex items-center space-x-2"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>Semester Summary</span>
                  </motion.h3>

                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { value: courses.length, label: "Total Courses" },
                      {
                        value: currentCredits,
                        label: "Credit Units",
                        color: isOverLimit ? "text-red-600" : "text-green-600",
                      },
                      {
                        value: remainingCredits,
                        label: "Units Remaining",
                        color: remainingCredits < 0 ? "text-red-600" : "text-blue-600",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="text-center"
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                          className={`text-2xl font-bold ${stat.color || "text-gray-900"}`}
                        >
                          {stat.value}
                        </motion.div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Category Breakdown */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Course Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {["calculation", "coding", "practical", "project"].map((category) => {
                        const count = courses.filter((course) => course.category === category).length
                        if (count === 0) return null

                        return (
                          <Badge key={category} className={getCategoryColor(category)}>
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(category)}
                              <span>
                                {category} ({count})
                              </span>
                            </div>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="mt-6">
                  <div className="space-x-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={()=>setOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        Get Courses List
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      </div>
      )}
    </div>
  )
}
//ASK WHICH COURSE is the the carryover knowing that will identify --> Ask if it was due to the course being difficult or for some other reason the caryover manifested that ok that this person is not really good in this category 