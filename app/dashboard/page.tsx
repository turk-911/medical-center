"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, User } from "lucide-react"
import AppointmentList from "@/components/appointment-list"
import DoctorSearch from "@/components/doctor-search"
import BookAppointment from "@/components/book-appointment"

type Appointment = {
  id: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
};

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showBooking, setShowBooking] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  console.log("Current user state:", user)

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched user profile:", data.user)
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments")
        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments)
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments")
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    }
  }

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    setShowBooking(true)
  }

  const handleBookingComplete = async (appointmentData: any) => {
    setShowBooking(false)
    setSelectedDoctor(null)

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!res.ok) {
        throw new Error("Failed to book appointment")
      }

      await fetchAppointments() // Ensure appointments are reloaded
    } catch (error) {
      console.error("Booking error:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resident Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Welcome, {user?.name || "User"}</CardTitle>
            <CardDescription>Manage your appointments and health records</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="appointments">
              <TabsList className="mb-4">
                <TabsTrigger value="appointments">My Appointments</TabsTrigger>
                <TabsTrigger value="book">Book Appointment</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <AppointmentList appointments={appointments} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="book">
                {showBooking ? (
                  <BookAppointment
                    doctor={selectedDoctor}
                    onComplete={handleBookingComplete}
                    onCancel={() => setShowBooking(false)}
                  />
                ) : (
                  <DoctorSearch onDoctorSelect={handleDoctorSelect} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <div className="mt-4">
                <h3 className="font-medium mb-2">Appointments on selected date:</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading appointments...</p>
                  ) : appointments.filter((app) => app.date === selectedDate?.toISOString().split("T")[0]).length >
                    0 ? (
                    appointments
                      .filter((app) => app.date === selectedDate?.toISOString().split("T")[0])
                      .map((app) => (
                        <div key={app.id} className="flex items-center justify-between text-sm p-2 border rounded-md">
                          <span>{app.doctorName}</span>
                          <span>{app.time}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No appointments on this date</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Upcoming Appointments</span>
                  </div>
                  <Badge>{isLoading ? "..." : appointments.filter((app) => app.status === "upcoming").length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Past Appointments</span>
                  </div>
                  <Badge variant="outline">
                    {isLoading ? "..." : appointments.filter((app) => app.status === "completed").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Preferred Doctors</span>
                  </div>
                  <Badge variant="secondary">{isLoading ? "..." : "3"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
