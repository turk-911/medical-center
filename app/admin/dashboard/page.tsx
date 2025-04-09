"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { CalendarDays, UserCog, Pill, Users, Search } from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // Mock data for charts
  const appointmentData = [
    { name: "Jan", count: 65 },
    { name: "Feb", count: 59 },
    { name: "Mar", count: 80 },
    { name: "Apr", count: 81 },
    { name: "May", count: 56 },
    { name: "Jun", count: 55 },
    { name: "Jul", count: 40 },
  ]

  const doctorAppointmentData = [
    { name: "Dr. Sarah", appointments: 45 },
    { name: "Dr. Michael", appointments: 38 },
    { name: "Dr. Emily", appointments: 52 },
    { name: "Dr. James", appointments: 30 },
    { name: "Dr. Lisa", appointments: 43 },
  ]

  // Mock data for doctors
  const doctors = [
    { id: 1, name: "Dr. Sarah Johnson", specialization: "General Medicine", patients: 45, rating: 4.8 },
    { id: 2, name: "Dr. Michael Chen", specialization: "E.N.T", patients: 38, rating: 4.7 },
    { id: 3, name: "Dr. Emily Rodriguez", specialization: "Eye Specialist", patients: 52, rating: 4.9 },
    { id: 4, name: "Dr. James Wilson", specialization: "Cardiology", patients: 30, rating: 4.6 },
    { id: 5, name: "Dr. Lisa Patel", specialization: "Dermatology", patients: 43, rating: 4.5 },
  ]

  // Mock data for residents
  const residents = [
    { id: 1, name: "John Smith", type: "Student", appointments: 5 },
    { id: 2, name: "Emily Johnson", type: "Faculty", appointments: 3 },
    { id: 3, name: "Michael Brown", type: "Staff", appointments: 7 },
    { id: 4, name: "Sarah Wilson", type: "Student", appointments: 2 },
    { id: 5, name: "David Lee", type: "Family", appointments: 4 },
  ]

  // Filter doctors based on search term and filter type
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "" || doctor.specialization === filterType
    return matchesSearch && matchesFilter
  })

  // Filter residents based on search term and filter type
  const filteredResidents = residents.filter((resident) => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "" || resident.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Users className="h-8 w-8 text-primary mb-2" />
            <h2 className="text-2xl font-bold">256</h2>
            <p className="text-sm text-muted-foreground">Total Residents</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <UserCog className="h-8 w-8 text-primary mb-2" />
            <h2 className="text-2xl font-bold">12</h2>
            <p className="text-sm text-muted-foreground">Doctors</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <CalendarDays className="h-8 w-8 text-primary mb-2" />
            <h2 className="text-2xl font-bold">128</h2>
            <p className="text-sm text-muted-foreground">Appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Pill className="h-8 w-8 text-primary mb-2" />
            <h2 className="text-2xl font-bold">512</h2>
            <p className="text-sm text-muted-foreground">Medicines</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="medicines">Medicines</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointments Over Time</CardTitle>
                <CardDescription>Monthly appointment statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Appointments",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="var(--color-count)" name="Appointments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Doctor Performance</CardTitle>
                <CardDescription>Number of patients seen by each doctor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ChartContainer
                    config={{
                      appointments: {
                        label: "Appointments",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={doctorAppointmentData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="appointments" fill="var(--color-appointments)" name="Appointments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">New Appointment</p>
                      <p className="text-sm text-muted-foreground">
                        John Smith booked an appointment with Dr. Sarah Johnson
                      </p>
                    </div>
                    <Badge variant="outline">5 mins ago</Badge>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Doctor Leave</p>
                      <p className="text-sm text-muted-foreground">
                        Dr. Michael Chen applied for leave from June 20 to June 25
                      </p>
                    </div>
                    <Badge variant="outline">1 hour ago</Badge>
                  </div>

                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Medicine Update</p>
                      <p className="text-sm text-muted-foreground">Inventory updated: Added 200 units of Paracetamol</p>
                    </div>
                    <Badge variant="outline">3 hours ago</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Registration</p>
                      <p className="text-sm text-muted-foreground">New resident registered: Emily Johnson (Faculty)</p>
                    </div>
                    <Badge variant="outline">1 day ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="doctors">
          <Card>
            <CardHeader>
              <CardTitle>Manage Doctors</CardTitle>
              <CardDescription>View and manage doctor information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search doctors by name"
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specializations</SelectItem>
                      <SelectItem value="General Medicine">General Medicine</SelectItem>
                      <SelectItem value="E.N.T">E.N.T</SelectItem>
                      <SelectItem value="Eye Specialist">Eye Specialist</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Add Doctor</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Doctor</DialogTitle>
                        <DialogDescription>Enter the details of the new doctor</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input placeholder="Enter doctor's name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input type="email" placeholder="Enter doctor's email" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Specialization</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Medicine</SelectItem>
                              <SelectItem value="ent">E.N.T</SelectItem>
                              <SelectItem value="eye">Eye Specialist</SelectItem>
                              <SelectItem value="cardiology">Cardiology</SelectItem>
                              <SelectItem value="dermatology">Dermatology</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Qualification</label>
                          <Input placeholder="Enter doctor's qualification" />
                        </div>
                        <Button className="w-full">Add Doctor</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Specialization</th>
                        <th className="text-left p-2">Patients</th>
                        <th className="text-left p-2">Rating</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="border-b">
                          <td className="p-2">{doctor.name}</td>
                          <td className="p-2">{doctor.specialization}</td>
                          <td className="p-2">{doctor.patients}</td>
                          <td className="p-2">{doctor.rating}</td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residents">
          <Card>
            <CardHeader>
              <CardTitle>Manage Residents</CardTitle>
              <CardDescription>View and manage resident information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search residents by name"
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Faculty">Faculty</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Appointments</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResidents.map((resident) => (
                        <tr key={resident.id} className="border-b">
                          <td className="p-2">{resident.name}</td>
                          <td className="p-2">{resident.type}</td>
                          <td className="p-2">{resident.appointments}</td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicines">
          <Card>
            <CardHeader>
              <CardTitle>Manage Medicines</CardTitle>
              <CardDescription>View and manage medicine inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Search medicines by name" className="pl-8" />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Add Medicine</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Medicine</DialogTitle>
                        <DialogDescription>Enter the details of the new medicine</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input placeholder="Enter medicine name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Input placeholder="Enter medicine description" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Quantity</label>
                          <Input type="number" placeholder="Enter quantity" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Expiry Date</label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Price</label>
                          <Input type="number" placeholder="Enter price" />
                        </div>
                        <Button className="w-full">Add Medicine</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Medicine Name</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Expiry Date</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Paracetamol</td>
                        <td className="p-2">500mg tablets</td>
                        <td className="p-2">250</td>
                        <td className="p-2">2024-12-31</td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Amoxicillin</td>
                        <td className="p-2">250mg capsules</td>
                        <td className="p-2">120</td>
                        <td className="p-2">2024-10-15</td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Ibuprofen</td>
                        <td className="p-2">400mg tablets</td>
                        <td className="p-2">180</td>
                        <td className="p-2">2024-11-20</td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Cetirizine</td>
                        <td className="p-2">10mg tablets</td>
                        <td className="p-2">90</td>
                        <td className="p-2">2024-09-30</td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2">Omeprazole</td>
                        <td className="p-2">20mg capsules</td>
                        <td className="p-2">60</td>
                        <td className="p-2">2024-08-25</td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline">Export Inventory</Button>
                  <Button variant="outline">View Low Stock</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
