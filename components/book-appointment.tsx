"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, CalendarIcon, Clock } from "lucide-react"

interface Doctor {
  id: number
  name: string
  specialization: string
  availableDays: string[]
}

interface BookAppointmentProps {
  doctor: Doctor
  onComplete: () => void
  onCancel: () => void
}

export default function BookAppointment({ doctor, onComplete, onCancel }: BookAppointmentProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dayOfWeek = (date: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[date.getDay()]
  }

  const isDateAvailable = (date: Date) => {
    const day = dayOfWeek(date)
    return doctor.availableDays.includes(day)
  }

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !timeSlot) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both date and time for your appointment.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          date: date.toISOString().split("T")[0],
          timeSlot,
          reason,
        }),
      })

      if (!response.ok) {
        throw new Error("Booking failed")
      }

      toast({
        title: "Appointment Booked",
        description: `Your appointment with ${doctor.name} on ${date.toLocaleDateString()} at ${timeSlot} has been booked.`,
      })

      onComplete()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to book appointment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={onCancel} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="font-medium">Book Appointment with {doctor.name}</h3>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Select Date</h4>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => {
                  // Disable past dates
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)

                  // Disable dates when doctor is not available
                  return date < today || !isDateAvailable(date)
                }}
                className="rounded-md border"
              />
              <div className="text-xs text-muted-foreground">
                <p>Doctor is available on: {doctor.availableDays.join(", ")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Select Time</h4>
              </div>

              <Select disabled={!date} value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Reason for Visit</h4>
                <Textarea
                  placeholder="Briefly describe your symptoms or reason for the appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>

              <Button className="w-full mt-4" disabled={!date || !timeSlot || isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? "Booking..." : "Book Appointment"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
