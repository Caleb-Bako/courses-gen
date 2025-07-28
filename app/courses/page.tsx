"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Filter, BookOpen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/supabaseClient"

interface Course {
  name: string
  day: string
  time?: string
  category: "calculation" | "coding" | "theory"
  intensity: "hard" | "easy" | "mid" | "hard-to-grasp" | "bulky" | "both-hard-bulky"
  University: string
  Level: string
  Department: string
}

export default function CourseSelectionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterUniversity, setFilterUniversity] = useState("All universities")
  const [filterLevel, setFilterLevel] = useState("All levels")
  const [filterDepartment, setFilterDepartment] = useState("All departments")
  const [courses, setCourses] = useState<Course[]>([])
  let steps = ""

useEffect(() => {
  const fetchCourses = async () => {
    const { data, error } = await supabase.from("student_courses").select("Courses")

    if (error) {
      console.error("Error fetching courses:", error)
      return
    }

    if (data && data.length > 0) {
      const allFlatCourses: Course[] = data.flatMap((row) => {
      const dayBasedCourses = row.Courses // { Monday: [...], ... }
      return Object.entries(dayBasedCourses).flatMap(([day, courseList]) =>
        (courseList as any[]).map((course) => ({
          ...course,
          day: day as string,
        }))
      )
    })

    const uniqueCourses = Array.from(
    new Map(allFlatCourses.map(course => [course.name + course.day, course])).values()
  )

  setCourses(uniqueCourses)

      const saved = localStorage.getItem("steps-data")
      if (saved) {
        const{step} = JSON.parse(saved);
        steps = step;
      }
    }
  }

  fetchCourses()
}, [])


const filteredCourses = courses.filter((course) => {
  const matchSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase())

  const matchUniversity =
    filterUniversity === "All universities" || course.University === filterUniversity

  const matchLevel =
    filterLevel === "All levels" || course.Level === filterLevel

  const matchDepartment =
    filterDepartment === "All departments" || course.Department === filterDepartment

  return matchSearch && matchUniversity && matchLevel && matchDepartment

})


  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case "hard":
      case "both-hard-bulky":
        return "destructive"
      case "mid":
      case "hard-to-grasp":
        return "default"
      case "easy":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/dashboard?step=${steps}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">Course Selection</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Courses</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">University</label>
                  <Select value={filterUniversity} onValueChange={setFilterUniversity}>
                    <SelectTrigger>
                      <SelectValue placeholder="All universities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All universities">All Universities</SelectItem>
                      <SelectItem value="Bingham University">Bingham University</SelectItem>
                      <SelectItem value="Veritas University">Veritas University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All levels">All Levels</SelectItem>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All departments">All Departments</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mass Com">Mass Com</SelectItem>
                      <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                      <SelectItem value="Public Health">Public Health</SelectItem>
                      <SelectItem value="Architecture">Architecture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Available Courses</CardTitle>
                <CardDescription>Look through your for assigned courses to University,Department and Levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCourses.map((course, idx) => (
                    <div key={idx} className="flex items-start space-x-4 border-b pb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-lg">{course.name}</h3>
                            <p className="text-sm text-gray-600">{course.Department}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getIntensityColor(course.intensity)}>{course.intensity}</Badge>
                            <Badge variant="outline">{course.category}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Level {course.Level}</span>
                          <span>{course.University}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredCourses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No courses found matching your criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
