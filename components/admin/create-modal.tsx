import { Loader2 } from 'lucide-react'

import { AdminCustomerInfoFields } from '@/components/admin/admin-customer-info-fields'
import { AdminSchedulingFields } from '@/components/admin/admin-scheduling-fields'
import {
  CreateModalFooter,
  CreateModalHeader,
  CreateNotesField,
} from '@/components/admin/create-modal-chrome'
import { CreateTableAssignmentSection } from '@/components/admin/create-table-assignment-section'
import { useCreateReservationModal } from '@/lib/hooks/use-create-reservation-modal'
import type { ActionResult, ReservationInput, RestaurantTable, RestaurantWeeklyHour } from '@/lib/reservation-types'
import { cn } from '@/lib/utils'

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReservationInput) => Promise<boolean>
  tables: RestaurantTable[]
  weeklyHours: RestaurantWeeklyHour[]
  getAvailableTables: (
    date: string,
    time: string,
    partySize: number,
  ) => Promise<ActionResult<RestaurantTable[]>>
}

export function CreateModal({ isOpen, onClose, onSubmit, tables, weeklyHours, getAvailableTables }: CreateModalProps) {
  const form = useCreateReservationModal({
    isOpen,
    onSubmit,
    tables,
    weeklyHours,
    getAvailableTables,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/55 p-3 backdrop-blur-xs duration-200 fade-in">
      <div className="relative flex max-h-[90dvh] w-full max-w-[720px] animate-in flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl duration-200 scale-in">
        {form.isSubmitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
        <div className="absolute left-0 right-0 top-0 h-1 shrink-0 bg-primary" />

        <CreateModalHeader onClose={onClose} />

        <form onSubmit={form.handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div
            className={cn(
              'no-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3',
              (form.isTimeOpen || form.isCalendarOpen) && 'overflow-hidden',
            )}
          >
            <AdminCustomerInfoFields
              name={form.cName}
              onNameChange={form.setCName}
              phone={form.cPhone}
              onPhoneChange={form.setCPhone}
              isPhoneValid={form.isCPhoneValid}
              email={form.cEmail}
              onEmailChange={form.setCEmail}
              isEmailValid={form.isCEmailValid}
            />

            <AdminSchedulingFields
              date={form.cDate}
              onDateChange={form.setCDate}
              isCalendarOpen={form.isCalendarOpen}
              setIsCalendarOpen={form.setIsCalendarOpen}
              minDate={new Date()}
              time={form.cTime}
              onTimeChange={form.setCTime}
              isTimeOpen={form.isTimeOpen}
              setIsTimeOpen={form.setIsTimeOpen}
              availableTimeSlots={form.availableTimeSlots}
              partySize={form.cPartySize}
              onPartySizeChange={form.setCPartySize}
              occasion={form.cOccasion}
              onOccasionChange={form.setCOccasion}
            />

            <CreateTableAssignmentSection
              cTableId={form.cTableId}
              cSecondaryTableIds={form.cSecondaryTableIds}
              cIsManualArrangement={form.cIsManualArrangement}
              availableTables={form.availableTables}
              availableTableIds={form.availableTableIds}
              groupedTables={form.groupedTables}
              isLoadingTables={form.isLoadingTables}
              tableError={form.tableError}
              hasSchedulingFields={form.hasSchedulingFields}
              hasUnresolvedCapacityWarning={form.hasUnresolvedCapacityWarning}
              fittingTableCount={form.fittingTableCount}
              partySize={form.partySize}
              totalCapacity={form.totalCapacity}
              isCapacityInsufficient={form.isCapacityInsufficient}
              isCapacityExcessive={form.isCapacityExcessive}
              showLargePartyTip={form.showLargePartyTip}
              onToggleTable={form.handleTableToggle}
              setCIsManualArrangement={form.setCIsManualArrangement}
              setCSecondaryTableIds={form.setCSecondaryTableIds}
            />

            <CreateNotesField notes={form.cNotes} onNotesChange={form.setCNotes} />
          </div>

          <CreateModalFooter
            bookingSummary={form.bookingSummary}
            isSubmitting={form.isSubmitting}
            isCreateValid={form.isCreateValid}
            onClose={onClose}
          />
        </form>
      </div>
    </div>
  )
}
