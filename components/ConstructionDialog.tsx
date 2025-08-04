'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AlertTriangle, HardHat, Trash2, Info } from 'lucide-react'
import { Button } from './ui/button'
import { useState } from 'react'

interface Course {
  id: number
  name: string
  code: string
  units: number
  category: string
  description: string
}
interface UnderConstructionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: Course[]
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  limit: boolean
}

export function UnderConstructionDialog({
  open,
  onOpenChange,
  courses,
  setCourses,
  limit,
}: UnderConstructionDialogProps) {
  const [showCourses, setShowCourses] = useState(false)

  const removeCourse = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showCourses ? (
        <DialogContent className="sm:max-w-md border border-blue-300">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Info className="h-10 w-10 text-blue-600" />
            </div>
            <DialogTitle className="text-blue-800 text-xl">Current Course List</DialogTitle>
            <DialogDescription className="text-sm text-blue-700 mt-2">
              Here's a summary of your current courses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {courses.map((course, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border rounded-md bg-blue-50 text-blue-800"
              >
                <div>
                  <div className="font-semibold">{course.code}</div>
                  <div className="text-xs">{course.units} unit(s)</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-md border border-green-300">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-green-800 text-xl">
              Credit Unit Limit Exceeded
            </DialogTitle>
            <DialogDescription className="text-sm text-green-700 mt-2">
              You've exceeded the allowed number of credit units. To proceed, remove some courses.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm text-green-800 mb-4">
            <p>
              💡 Tip: Consider removing <strong>1–2 unit courses</strong>. This reduces the total
              faster with less impact on your main academic load. Some elective or skill-based
              courses often carry lower units.
            </p>
          </div>

          <div className="space-y-2">
            {courses.map((course, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-2 border rounded-md ${
                  course.units <= 2
                    ? 'bg-green-100 text-green-900 border-green-300'
                    : 'bg-white text-gray-800 border-gray-200'
                }`}
              >
                <div>
                  <div className="font-semibold">{course.code}</div>
                  <div className="text-xs">{course.units} unit(s)</div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeCourse(course.id)}
                  className="text-red-500 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {!limit && (
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowCourses(true)} className="bg-green-600 hover:bg-green-700 text-white">
                View My Courses
              </Button>
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  )
}
