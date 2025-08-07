"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Search, Filter, BookOpen } from "lucide-react"
import LoadingThreeDotsJumping from "@/components/animations/loading"
import { retrieveResults } from "@/components/SupabaseFunctions/Retrieve/retrieveUserData"

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
  const [duplicateCourses, setDuplicateCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAndDetectDuplicates = async () => {
      setLoading(true)
      const data = await retrieveResults()
      if (!data || data.length === 0) {
        setLoading(false)
        return
      }

      // 1. Flatten all courses (including duplicates)
      const allFlat: Course[] = data.flatMap(row => {
        const dayBased = row.Courses as Record<string, any[]>
        return Object.entries(dayBased).flatMap(([day, list]) =>
          list.map(c => ({ ...c, day }))
        )
      })
      setCourses(allFlat)

      // 2. Count occurrences by normalized name
      const nameCount = new Map<string, number>()
      allFlat.forEach(c => {
        const key = c.name.trim().toLowerCase()
        nameCount.set(key, (nameCount.get(key) || 0) + 1)
      })

      // 3. Gather names that appear >1
      const dupNames = new Set<string>()
      for (const [n, cnt] of nameCount.entries()) {
        if (cnt > 1) dupNames.add(n)
      }

      // 4. Filter allFlat to only those duplicate names
      const onlyDups = allFlat.filter(c =>
        dupNames.has(c.name.trim().toLowerCase())
      )

      // 5. Dedupe that by name so each name appears once
      const uniqueDups = Array.from(
        new Map(
          onlyDups.map(c => [
            c.name.trim().toLowerCase(),
            c,
          ])
        ).values()
      )
      setDuplicateCourses(uniqueDups)
      setLoading(false)
    }

    fetchAndDetectDuplicates()
  }, [])

  // Now apply your search & other filters on the duplicate list
  const filtered = duplicateCourses.filter(course => {
    const nameNorm = course.name.trim().toLowerCase()
    const matchSearch = nameNorm.includes(searchTerm.toLowerCase())
    const matchUni =
      filterUniversity === "All universities" ||
      course.University === filterUniversity
    const matchLevel =
      filterLevel === "All levels" || course.Level === filterLevel
    const matchDept =
      filterDepartment === "All departments" ||
      course.Department === filterDepartment

    return matchSearch && matchUni && matchLevel && matchDept
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <LoadingThreeDotsJumping color="#b123e5ff" />
      ) : (
        <div>
          {/* Header */}
          <header className="bg-white border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/dashboard">
                <Button onClick={()=>setLoading(true)} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">
                  Course Selection
                </span>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Filter className="h-5 w-5" />
                      <span>Filters</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Search Courses
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name or code..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    {/* University */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">University</label>
                      <Select
                        value={filterUniversity}
                        onValueChange={setFilterUniversity}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All universities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All universities">
                            All Universities
                          </SelectItem>
                          <SelectItem value="Bingham University">
                            Bingham University
                          </SelectItem>
                          <SelectItem value="Veritas University">
                            Veritas University
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Level */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Level</label>
                      <Select
                        value={filterLevel}
                        onValueChange={setFilterLevel}
                      >
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
                    {/* Department */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Department
                      </label>
                      <Select
                        value={filterDepartment}
                        onValueChange={setFilterDepartment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All departments">
                            All Departments
                          </SelectItem>
                          <SelectItem value="Computer Science">
                            Computer Science
                          </SelectItem>
                          <SelectItem value="Mass Com">Mass Com</SelectItem>
                          <SelectItem value="Cyber Security">
                            Cyber Security
                          </SelectItem>
                          <SelectItem value="Public Health">
                            Public Health
                          </SelectItem>
                          <SelectItem value="Architecture">
                            Architecture
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Duplicate Courses</CardTitle>
                    <CardDescription>
                      These course names appear more than once in the data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filtered.length > 0 ? (
                        filtered.map((course, idx) => (
                          <div
                            key={idx}
                            className="flex items-start space-x-4 border-b pb-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-medium text-lg">
                                    {course.name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {course.Department}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge>{course.time}</Badge>
                                  <Badge variant="outline">
                                    {course.category}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Level {course.Level}</span>
                                <span>{course.University}</span>
                                <span>{course.day}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No duplicate courses found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
