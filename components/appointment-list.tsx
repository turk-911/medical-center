"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

// interface Appointment {
//   id: number
//   doctorName: string
//   specialization: string
//   date: string
//   time: string
//   status: string
//   reason?: string
// }


type Appointment = {
  id: number;
  date: string; // ISO string from DateTime
  timeSlot: string; // maps to `timeSlot`
  status: "upcoming" | "completed" | "cancelled"; // explicitly typed
  reason?: string | null; // maps to `description`
  doctor: {
    id: number;
    name: string;
    specialty: string;
    image: string;
    rating: number;
    user: {
      email: string;
    };
  };
  user: {
    id: number;
    name?: string | null;
    email: string;
  };
};

interface AppointmentListProps {
  appointments: Appointment[]
  isLoading: boolean
}

export default function AppointmentList({ appointments, isLoading }: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
console.log(appointments);

  const handleCancelAppointment = async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don't have any appointments yet.</p>
        <Button className="mt-4" variant="outline">
          Book Your First Appointment
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{appointment.doctor.name}</h3>
                <Badge variant={appointment.status === "upcoming" ? "default" : "outline"}>
                  {appointment.status === "upcoming" ? "Upcoming" : "Completed"}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center">
                  <User className="mr-1 h-3 w-3" />
                  {appointment.doctor.specialty}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="space-x-3">
                  <span className="inline-flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(appointment.date)}
                  </span>
                  <span className="inline-flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {appointment.timeSlot}
                  </span>
                </div>

                <div className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Appointment Details</DialogTitle>
                        <DialogDescription>View the details of your appointment</DialogDescription>
                      </DialogHeader>
                      {selectedAppointment && (
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm font-medium">Doctor:</div>
                            <div className="text-sm">{selectedAppointment.doctor.name}</div>

                            <div className="text-sm font-medium">Specialization:</div>
                            <div className="text-sm">{selectedAppointment.doctor.specialty}</div>

                            <div className="text-sm font-medium">Date:</div>
                            <div className="text-sm">{formatDate(selectedAppointment.date)}</div>

                            <div className="text-sm font-medium">Time:</div>
                            <div className="text-sm">{selectedAppointment.timeSlot}</div>

                            <div className="text-sm font-medium">Status:</div>
                            <div className="text-sm">
                              <Badge variant={selectedAppointment.status === "upcoming" ? "default" : "outline"}>
                                {selectedAppointment.status === "upcoming" ? "Upcoming" : "Completed"}
                              </Badge>
                            </div>

                            <div className="text-sm font-medium">Reason:</div>
                            <div className="text-sm">{selectedAppointment.reason || "Not specified"}</div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
{/* 
                  {appointment.status === "upcoming" && (
                    // <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(appointment.id)}>
                    //   Cancel
                    // </Button>
                  )} */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
