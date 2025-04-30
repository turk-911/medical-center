"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface BookAppointmentProps {
  doctor: Doctor;
}

export default function BookAppointment({
  doctor,
}: BookAppointmentProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [availableDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);

  useEffect(() => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailableSlots = async () => {
      setIsLoadingSlots(true);
      setFetchError(null);
      setAvailableSlots([]);

      try {
        const formattedDate = format(date, "yyyy-MM-dd");

        // ✅ Correct API path
        const response = await fetch(
          `/api/doctors/${doctor.id}/available_slots?date=${formattedDate}`
        );

        if (!response.ok) throw new Error("Failed to fetch available slots");

        const data = await response.json();

        if (data.success) {
          setAvailableSlots(data.availableSlots || []);
          if (data.message) setFetchError(data.message);
        } else {
          setFetchError(data.message || "Failed to load available slots");
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setFetchError("Failed to load available time slots");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [date, doctor.id]);

  const isDateAvailable = (date: Date | undefined) => {
    if (!date) return false;
    const day = format(date, "EEEE");
    return availableDays.includes(day);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both date and time for your appointment.",
      });
      return;
    }

    // setIsSubmitting(true);
    const formattedDate = format(date, "yyyy-MM-dd");

    try {

      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          doctorId: doctor.id,
          date: formattedDate,
          timeSlot,
          description: reason,
        }),
      });
      console.log(response)
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message);
        throw new Error(errorData.message || "Booking failed");
      }

      toast({
        title: "Appointment Booked",
        description: `Your appointment with Dr. ${doctor.name} on ${format(
          date,
          "MMMM d, yyyy"
        )} at ${timeSlot} has been booked.`,
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to book appointment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h3 className="font-medium">
          Book Appointment with Dr. {doctor?.name || "Doctor"}
        </h3>
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
                onSelect={(newDate) => {
                  setDate(newDate);
                  setTimeSlot("");
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || !isDateAvailable(date);
                }}
                className="rounded-md border"
              />
              <div className="text-xs text-muted-foreground">
                <p>Doctor is available on: {availableDays.join(", ")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Select Time</h4>
              </div>

              {isLoadingSlots ? (
                <div className="text-sm text-muted-foreground">
                  Loading available slots...
                </div>
              ) : (
                <Select
                  disabled={!date || availableSlots.length === 0}
                  value={timeSlot}
                  onValueChange={setTimeSlot}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        availableSlots.length === 0
                          ? "No available slots"
                          : "Select time slot"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot, index) => (
                      <SelectItem key={index} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {fetchError && (
                <div className="text-xs text-destructive">{fetchError}</div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Reason for Visit</h4>
                <Textarea
                  placeholder="Briefly describe your symptoms or reason for the appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full mt-4"
                disabled={!date || !timeSlot || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Booking..." : "Book Appointment"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
