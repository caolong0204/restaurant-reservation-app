import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  description, 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy bỏ', 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  // Prevent background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      const activeModals = document.querySelectorAll('.fixed.inset-0')
      if (activeModals.length <= 1) {
        document.body.style.overflow = ''
      }
    }
    return () => {
      const activeModals = document.querySelectorAll('.fixed.inset-0')
      if (activeModals.length <= 1) {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 pt-6 pb-5 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-2">
          {/* Title */}
          <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mt-1 px-2">{description}</p>
        </div>
        
        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-5">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="h-10 px-6 rounded-lg text-sm font-semibold border-border hover:bg-muted text-foreground transition-colors min-w-[130px]"
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm} 
            className="h-10 px-6 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-xs transition-colors min-w-[130px]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
