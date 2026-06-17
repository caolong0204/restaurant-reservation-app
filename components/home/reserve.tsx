'use client'

import { useState } from 'react'
import { BookingForm } from '@/components/booking-form'
import { OCCASIONS, TABLE_LOCATIONS } from '@/lib/restaurant'
import { BookingSummary } from './booking-summary'

export function Reserve() {
  // Wizard state lifted up from BookingForm
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [partySize, setPartySize] = useState<string>('4')
  const [time, setTime] = useState<string>('')

  const [name, setName] = useState('')

  const [phone, setPhone] = useState('')
  const [occasion, setOccasion] = useState(OCCASIONS[0])
  const [tableLocation, setTableLocation] = useState(TABLE_LOCATIONS[0])
  const [notes, setNotes] = useState('')

  // State for custom party size when exceeds 8
  const [isCustomParty, setIsCustomParty] = useState(false)
  const [customPartyValue, setCustomPartyValue] = useState('9')

  // State for navigating the custom calendar month
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const initial = new Date()
    initial.setDate(1)
    return initial
  })

  return (
    <section id="reserve" className="scroll-mt-20 bg-secondary/40 py-6 lg:py-10">
      <div className="mx-auto px-3 sm:px-4 max-w-6xl">
        {step === 5 ? (
          <div className="mx-auto max-w-2xl w-full">
            <BookingForm
              step={step}
              setStep={setStep}
              date={date}
              setDate={setDate}
              partySize={partySize}
              setPartySize={setPartySize}
              time={time}
              setTime={setTime}
              name={name}
              setName={setName}

              phone={phone}
              setPhone={setPhone}
              occasion={occasion}
              setOccasion={setOccasion}
              tableLocation={tableLocation}
              setTableLocation={setTableLocation}
              notes={notes}
              setNotes={setNotes}
              isCustomParty={isCustomParty}
              setIsCustomParty={setIsCustomParty}
              customPartyValue={customPartyValue}
              setCustomPartyValue={setCustomPartyValue}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Interactive Booking Wizard */}
            <div className="lg:col-span-7 w-full">
              <BookingForm
                step={step}
                setStep={setStep}
                date={date}
                setDate={setDate}
                partySize={partySize}
                setPartySize={setPartySize}
                time={time}
                setTime={setTime}
                name={name}
                setName={setName}

                phone={phone}
                setPhone={setPhone}
                occasion={occasion}
                setOccasion={setOccasion}
                tableLocation={tableLocation}
                setTableLocation={setTableLocation}
                notes={notes}
                setNotes={setNotes}
                isCustomParty={isCustomParty}
                setIsCustomParty={setIsCustomParty}
                customPartyValue={customPartyValue}
                setCustomPartyValue={setCustomPartyValue}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
              />
            </div>

            {/* Right Column: Live Booking Selection Summary */}
            <BookingSummary
              date={date}
              partySize={partySize}
              time={time}
              name={name}

              phone={phone}
              occasion={occasion}
              tableLocation={tableLocation}
              notes={notes}
            />
          </div>
        )}
      </div>
    </section>
  )
}
