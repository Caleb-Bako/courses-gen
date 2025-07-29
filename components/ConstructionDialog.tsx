'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AlertTriangle, HardHat } from 'lucide-react'

interface UnderConstructionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnderConstructionDialog({
  open,
  onOpenChange,
}: UnderConstructionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-yellow-300">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <HardHat className="h-10 w-10 text-yellow-600" />
          </div>
          <DialogTitle className="text-yellow-800 text-xl">Page Under Construction</DialogTitle>
          <DialogDescription className="text-sm text-yellow-700 mt-2">
            🚧 We’re still working on this page. Check back soon!
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center gap-4 mt-4 text-yellow-600">
          <AlertTriangle className="h-6 w-6" />
          <span className="text-sm">We appreciate your patience 🙏</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
