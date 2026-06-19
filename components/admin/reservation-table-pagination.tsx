import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReservationTablePaginationProps {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
}

export function ReservationTablePagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: ReservationTablePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex-none border-t border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              aria-label="Trang trước"
              className="size-10 rounded-lg bg-card"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1
              return (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? 'default' : 'outline'}
                  size="icon"
                  aria-label={`Trang ${pageNumber}`}
                  className="size-10 rounded-lg"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              aria-label="Trang sau"
              className="size-10 rounded-lg bg-card"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
