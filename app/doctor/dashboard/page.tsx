"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CalendarDays, Clock, User, Pill, CalendarIcon } from "lucide-react"

export default function DoctorDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveData, setLeaveData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    substituteDoctor: "",
  })

  useEffect(() => {
    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch("/api/doctor/appointments");
        // const data = await response.json();
        // setAppointments(data.appointments);

        // Mock data for demonstration
        setTimeout(() => {
          setAppointments([
            {
              id: 1,
              patientName: "John Smith",
              date: "2023-06-15",
              time: "10:00 AM",
              reason: "Regular checkup",
              status: "upcoming",
            },
            {
              id: 2,
              patientName: "Emily Johnson",
              date: "2023-06-15",
              time: "11:30 AM",
              reason: "Fever and cough",
              status: "upcoming",
            },
            {
              id: 3,
              patientName: "Michael Brown",
              date: "2023-06-14",
              time: "2:00 PM",
              reason: "Follow-up appointment",
              status: "completed",
            },
            {
              id: 4,
              patientName: "Sarah Wilson",
              date: "2023-06-14",
              time: "3:30 PM",
              reason: "Headache and dizziness",
              status: "completed",
            },
          ])
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, you would submit to your API
      // const response = await fetch("/api/doctor/leave", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(leaveData),
      // });

      // Mock successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("Leave request submitted successfully")
      setShowLeaveForm(false)
      setLeaveData({
        startDate: "",
        endDate: "",
        reason: "",
        substituteDoctor: "",
      })
    } catch (error) {
      console.error("Error submitting leave request:", error)
      alert("Failed to submit leave request")
    }
  }

  // Mock data for doctors
  const doctors = [
    { id: 1, name: "Dr. James Wilson" },
    { id: 2, name: "Dr. Emily Rodriguez" },
    { id: 3, name: "Dr. Michael Chen" },
    { id: 4, name: "Dr. Lisa Patel" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Manage your patient appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                  <div className="space-y-4">
                    {isLoading ? (
                      <p>Loading appointments...</p>
                    ) : appointments.filter((app) => app.status === "upcoming").length > 0 ? (
                      appointments
                        .filter((app) => app.status === "upcoming")
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col space-y-3">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium">{appointment.patientName}</h3>
                                  <Badge>{appointment.time}</Badge>
                                </div>

                                <div className="text-sm text-muted-foreground">
                                  <span className="inline-flex items-center">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    {new Date(appointment.date).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="text-sm">
                                  <span className="font-medium">Reason: </span>
                                  {appointment.reason}
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                  <Button size="sm">Start Consultation</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">No upcoming appointments</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="completed">
                  <div className="space-y-4">
                    {isLoading ? (
                      <p>Loading appointments...</p>
                    ) : appointments.filter((app) => app.status === "completed").length > 0 ? (
                      appointments
                        .filter((app) => app.status === "completed")
                        .map((appointment) => (
                          <Card key={appointment.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col space-y-3">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium">{appointment.patientName}</h3>
                                  <Badge variant="outline">{appointment.time}</Badge>
                                </div>

                                <div className="text-sm text-muted-foreground">
                                  <span className="inline-flex items-center">
                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                    {new Date(appointment.date).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="text-sm">
                                  <span className="font-medium">Reason: </span>
                                  {appointment.reason}
                                </div>

                                <div className="flex justify-end">
                                  <Button variant="outline" size="sm">
                                    View Medical Record
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">No completed appointments</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="all">
                  <div className="space-y-4">
                    {isLoading ? (
                      <p>Loading appointments...</p>
                    ) : appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <Card key={appointment.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{appointment.patientName}</h3>
                                <Badge variant={appointment.status === "upcoming" ? "default" : "outline"}>
                                  {appointment.time}
                                </Badge>
                              </div>

                              <div className="text-sm text-muted-foreground">
                                <span className="inline-flex items-center">
                                  <CalendarIcon className="mr-1 h-3 w-3" />
                                  {new Date(appointment.date).toLocaleDateString()}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="inline-flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {appointment.status}
                                </span>
                              </div>

                              <div className="text-sm">
                                <span className="font-medium">Reason: </span>
                                {appointment.reason}
                              </div>

                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                {appointment.status === "upcoming" && <Button size="sm">Start Consultation</Button>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center py-8 text-muted-foreground">No appointments found</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medicine Inventory</CardTitle>
              <CardDescription>Check availability of medicines in the hospital</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search medicines..." />
                  <Button>Search</Button>
                </div>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Medicine Name</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Paracetamol</td>
                        <td className="p-2">500mg tablets</td>
                        <td className="p-2">250</td>
                        <td className="p-2">2024-12-31</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Amoxicillin</td>
                        <td className="p-2">250mg capsules</td>
                        <td className="p-2">120</td>
                        <td className="p-2">2024-10-15</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Ibuprofen</td>
                        <td className="p-2">400mg tablets</td>
                        <td className="p-2">180</td>
                        <td className="p-2">2024-11-20</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Cetirizine</td>
                        <td className="p-2">10mg tablets</td>
                        <td className="p-2">90</td>
                        <td className="p-2">2024-09-30</td>
                      </tr>
                      <tr>
                        <td className="p-2">Omeprazole</td>
                        <td className="p-2">20mg capsules</td>
                        <td className="p-2">60</td>
                        <td className="p-2">2024-08-25</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">View All Medicines</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              <div className="mt-4">
                <h3 className="font-medium mb-2">Your Schedule:</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monday</span>
                    <Badge variant="outline">9:00 AM - 5:00 PM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Wednesday</span>
                    <Badge variant="outline">9:00 AM - 5:00 PM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Friday</span>
                    <Badge variant="outline">9:00 AM - 5:00 PM</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apply for Leave</CardTitle>
            </CardHeader>
            <CardContent>
              {showLeaveForm ? (
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={leaveData.startDate}
                      onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={leaveData.endDate}
                      onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={leaveData.reason}
                      onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="substituteDoctor">Substitute Doctor</Label>
                    <Select
                      value={leaveData.substituteDoctor}
                      onValueChange={(value) => setLeaveData({ ...leaveData, substituteDoctor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowLeaveForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-center">
                  <Button onClick={() => setShowLeaveForm(true)}>Apply for Leave</Button>
                </div>
              )}
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
                    <span className="text-sm">Today's Appointments</span>
                  </div>
                  <Badge>4</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Patients</span>
                  </div>
                  <Badge variant="outline">128</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Prescriptions</span>
                  </div>
                  <Badge variant="secondary">96</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
