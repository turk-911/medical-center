"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  CalendarDays,
  Clock,
  Download,
  FileText,
  Filter,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

// Types based on the actual API responses
interface User {
  id: number
  name: string
  email: string
  image?: string
}

interface Doctor {
  id: number
  name: string
  specialty: string
  bio?: string
  image?: string
  userId: number
  user?: User
  Availability?: Availability[]
  _count?: {
    Appointment: number
  }
  Appointment?: AppointmentWithUser[]
}

interface Availability {
  id: number
  doctorId: number
  day: string
  startTime: string
  endTime: string
}

interface AppointmentWithUser {
  id: number
  date: string
  status: string
  user: {
    name: string
    email: string
  }
}

interface Appointment {
  id: number
  userId: number
  doctorId: number
  date: string
  time?: string
  status: string
  type?: string
  doctor: Doctor
  user: User
}

interface Medicine {
  id: number
  name: string
  description: string
  dosage?: string
  price: number
  stock: number
}

interface PrescriptionMedicine {
  id: number
  prescriptionId: number
  medicineId: number
  dosage: string
  duration: string
  medicine: Medicine
}

interface Prescription {
  id: number
  appointmentId: number
  notes?: string
  createdAt: string
  appointment: Appointment
  medicines: PrescriptionMedicine[]
}

// Dashboard analytics interface
interface DashboardAnalytics {
  totalResidents: number
  totalDoctors: number
  totalAppointments: number
  totalMedicines: number
  appointmentsByMonth: {
    name: string
    count: number
  }[]
  doctorPerformance: {
    name: string
    appointments: number
  }[]
  recentActivity: {
    id: string
    type: string
    description: string
    time: string
  }[]
  appointmentsByStatus: {
    name: string
    value: number
  }[]
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // State for our data
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)
  const [doctorAnalytics, setDoctorAnalytics] = useState<Doctor | null>(null)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch doctors first
        const doctorsRes = await fetch("/api/admin/doctors")
        const doctorsData: Doctor[] = await doctorsRes.json()
        setDoctors(doctorsData)

        // Set the first doctor as selected if available
        if (doctorsData.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(doctorsData[0].id)
        }

        // Fetch doctor analytics
        if (selectedDoctorId) {
          const analyticsRes = await fetch(`/api/admin/analytics/${selectedDoctorId}`)
          const analyticsData: Doctor = await analyticsRes.json()
          setDoctorAnalytics(analyticsData)
        }

        // Fetch appointments
        const appointmentsRes = await fetch("/api/admin/appointments")
        const appointmentsData: Appointment[] = await appointmentsRes.json()
        setAppointments(appointmentsData)

        // Fetch prescriptions
        const prescriptionsRes = await fetch("/api/admin/prescriptions")
        const prescriptionsData: Prescription[] = await prescriptionsRes.json()
        setPrescriptions(prescriptionsData)

        // Extract unique medicines from prescriptions
        const uniqueMedicines = new Map<number, Medicine>()
        prescriptionsData.forEach((prescription) => {
          prescription.medicines.forEach((prescMed) => {
            if (!uniqueMedicines.has(prescMed.medicine.id)) {
              uniqueMedicines.set(prescMed.medicine.id, prescMed.medicine)
            }
          })
        })
        setMedicines(Array.from(uniqueMedicines.values()))

        // Generate dashboard analytics
        generateDashboardAnalytics(doctorsData, appointmentsData, uniqueMedicines.size)
      } catch (error) {
        console.error("Error fetching data:", error)
        // Fallback to mock data if API fails
        setMockData()
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedDoctorId])

  // Function to generate dashboard analytics from fetched data
  const generateDashboardAnalytics = (doctors: Doctor[], appointments: Appointment[], medicinesCount: number) => {
    // Count unique residents (users)
    const uniqueUsers = new Set(appointments.map((app) => app.userId))
    const totalResidents = uniqueUsers.size

    // Count appointments by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const appointmentsByMonth = monthNames.map((month) => ({ name: month, count: 0 }))

    appointments.forEach((app) => {
      const date = new Date(app.date)
      const monthIndex = date.getMonth()
      appointmentsByMonth[monthIndex].count += 1
    })

    // Count appointments by status
    const statusCounts: Record<string, number> = {}
    appointments.forEach((app) => {
      const status = app.status.charAt(0).toUpperCase() + app.status.slice(1)
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    const appointmentsByStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

    // Doctor performance
    const doctorPerformance = doctors.map((doctor) => ({
      name: doctor.name,
      appointments: doctor._count?.Appointment || 0,
    }))

    // Generate recent activity
    const recentActivity = appointments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((app) => ({
        id: app.id.toString(),
        type: "appointment",
        description: `${app.user.name} has an appointment with ${app.doctor.name}`,
        time: getRelativeTime(new Date(app.date)),
      }))

    setAnalytics({
      totalResidents,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      totalMedicines: medicinesCount,
      appointmentsByMonth,
      doctorPerformance,
      recentActivity,
      appointmentsByStatus,
    })
  }

  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      // Fetch doctors
      const doctorsRes = await fetch("/api/admin/doctors")
      const doctorsData: Doctor[] = await doctorsRes.json()
      setDoctors(doctorsData)

      // Fetch doctor analytics
      if (selectedDoctorId) {
        const analyticsRes = await fetch(`/api/admin/analytics/${selectedDoctorId}`)
        const analyticsData: Doctor = await analyticsRes.json()
        setDoctorAnalytics(analyticsData)
      }

      // Fetch appointments
      const appointmentsRes = await fetch("/api/admin/appointments")
      const appointmentsData: Appointment[] = await appointmentsRes.json()
      setAppointments(appointmentsData)

      // Fetch prescriptions
      const prescriptionsRes = await fetch("/api/admin/prescriptions")
      const prescriptionsData: Prescription[] = await prescriptionsRes.json()
      setPrescriptions(prescriptionsData)

      // Extract unique medicines from prescriptions
      const uniqueMedicines = new Map<number, Medicine>()
      prescriptionsData.forEach((prescription) => {
        prescription.medicines.forEach((prescMed) => {
          if (!uniqueMedicines.has(prescMed.medicine.id)) {
            uniqueMedicines.set(prescMed.medicine.id, prescMed.medicine)
          }
        })
      })
      setMedicines(Array.from(uniqueMedicines.values()))

      // Generate dashboard analytics
      generateDashboardAnalytics(doctorsData, appointmentsData, uniqueMedicines.size)
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Helper function to get relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`
    }
    if (diffHours > 0) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`
    }
    if (diffMins > 0) {
      return diffMins === 1 ? "1 min ago" : `${diffMins} mins ago`
    }
    return "Just now"
  }

  // Set mock data if API fails
  const setMockData = () => {
    // Mock doctors data
    const mockDoctors: Doctor[] = [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialty: "General Medicine",
        userId: 1,
        user: {
          id: 1,
          name: "Dr. Sarah Johnson",
          email: "sarah@example.com",
          image: "/placeholder.svg?height=40&width=40",
        },
        _count: {
          Appointment: 45,
        },
      },
      {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "E.N.T",
        userId: 2,
        user: {
          id: 2,
          name: "Dr. Michael Chen",
          email: "michael@example.com",
          image: "/placeholder.svg?height=40&width=40",
        },
        _count: {
          Appointment: 38,
        },
      },
      {
        id: 3,
        name: "Dr. Emily Rodriguez",
        specialty: "Eye Specialist",
        userId: 3,
        user: {
          id: 3,
          name: "Dr. Emily Rodriguez",
          email: "emily@example.com",
          image: "/placeholder.svg?height=40&width=40",
        },
        _count: {
          Appointment: 52,
        },
      },
      {
        id: 4,
        name: "Dr. James Wilson",
        specialty: "Cardiology",
        userId: 4,
        user: {
          id: 4,
          name: "Dr. James Wilson",
          email: "james@example.com",
          image: "/placeholder.svg?height=40&width=40",
        },
        _count: {
          Appointment: 30,
        },
      },
      {
        id: 5,
        name: "Dr. Lisa Patel",
        specialty: "Dermatology",
        userId: 5,
        user: {
          id: 5,
          name: "Dr. Lisa Patel",
          email: "lisa@example.com",
          image: "/placeholder.svg?height=40&width=40",
        },
        _count: {
          Appointment: 43,
        },
      },
    ]
    setDoctors(mockDoctors)

    // Mock appointments data
    const mockAppointments: Appointment[] = [
      {
        id: 1,
        userId: 6,
        doctorId: 1,
        date: "2023-07-15T10:00:00Z",
        time: "10:00 AM",
        status: "scheduled",
        type: "General Checkup",
        doctor: mockDoctors[0],
        user: {
          id: 6,
          name: "John Smith",
          email: "john@example.com",
        },
      },
      {
        id: 2,
        userId: 7,
        doctorId: 2,
        date: "2023-07-16T11:30:00Z",
        time: "11:30 AM",
        status: "completed",
        type: "ENT Consultation",
        doctor: mockDoctors[1],
        user: {
          id: 7,
          name: "Emily Johnson",
          email: "emily.j@example.com",
        },
      },
      {
        id: 3,
        userId: 8,
        doctorId: 3,
        date: "2023-07-17T14:00:00Z",
        time: "2:00 PM",
        status: "cancelled",
        type: "Eye Examination",
        doctor: mockDoctors[2],
        user: {
          id: 8,
          name: "Michael Brown",
          email: "michael.b@example.com",
        },
      },
      {
        id: 4,
        userId: 9,
        doctorId: 4,
        date: "2023-07-18T15:30:00Z",
        time: "3:30 PM",
        status: "scheduled",
        type: "Cardiology Checkup",
        doctor: mockDoctors[3],
        user: {
          id: 9,
          name: "Sarah Wilson",
          email: "sarah.w@example.com",
        },
      },
      {
        id: 5,
        userId: 10,
        doctorId: 5,
        date: "2023-07-19T09:00:00Z",
        time: "9:00 AM",
        status: "scheduled",
        type: "Skin Consultation",
        doctor: mockDoctors[4],
        user: {
          id: 10,
          name: "David Lee",
          email: "david@example.com",
        },
      },
    ]
    setAppointments(mockAppointments)

    // Mock medicines data
    const mockMedicines: Medicine[] = [
      {
        id: 1,
        name: "Paracetamol",
        description: "500mg tablets",
        price: 5.99,
        stock: 250,
      },
      {
        id: 2,
        name: "Amoxicillin",
        description: "250mg capsules",
        price: 8.5,
        stock: 120,
      },
      {
        id: 3,
        name: "Ibuprofen",
        description: "400mg tablets",
        price: 6.75,
        stock: 180,
      },
      {
        id: 4,
        name: "Cetirizine",
        description: "10mg tablets",
        price: 4.25,
        stock: 90,
      },
      {
        id: 5,
        name: "Omeprazole",
        description: "20mg capsules",
        price: 9.99,
        stock: 60,
      },
    ]
    setMedicines(mockMedicines)

    // Mock prescriptions data
    const mockPrescriptions: Prescription[] = [
      {
        id: 1,
        appointmentId: 1,
        notes: "Take with food",
        createdAt: "2023-07-15T11:00:00Z",
        appointment: mockAppointments[0],
        medicines: [
          {
            id: 1,
            prescriptionId: 1,
            medicineId: 1,
            dosage: "500mg twice daily",
            duration: "5 days",
            medicine: mockMedicines[0],
          },
          {
            id: 2,
            prescriptionId: 1,
            medicineId: 4,
            dosage: "1000mg once daily",
            duration: "10 days",
            medicine: mockMedicines[3],
          },
        ],
      },
      {
        id: 2,
        appointmentId: 2,
        notes: "Avoid dairy products",
        createdAt: "2023-07-16T12:30:00Z",
        appointment: mockAppointments[1],
        medicines: [
          {
            id: 3,
            prescriptionId: 2,
            medicineId: 2,
            dosage: "250mg three times daily",
            duration: "7 days",
            medicine: mockMedicines[1],
          },
        ],
      },
      {
        id: 3,
        appointmentId: 4,
        notes: "Use as directed",
        createdAt: "2023-07-18T16:30:00Z",
        appointment: mockAppointments[3],
        medicines: [
          {
            id: 4,
            prescriptionId: 3,
            medicineId: 3,
            dosage: "2 drops four times daily",
            duration: "14 days",
            medicine: mockMedicines[2],
          },
        ],
      },
    ]
    setPrescriptions(mockPrescriptions)

    // Mock analytics data
    setAnalytics({
      totalResidents: 256,
      totalDoctors: mockDoctors.length,
      totalAppointments: mockAppointments.length,
      totalMedicines: mockMedicines.length,
      appointmentsByMonth: [
        { name: "Jan", count: 65 },
        { name: "Feb", count: 59 },
        { name: "Mar", count: 80 },
        { name: "Apr", count: 81 },
        { name: "May", count: 56 },
        { name: "Jun", count: 55 },
        { name: "Jul", count: 40 },
        { name: "Aug", count: 30 },
        { name: "Sep", count: 45 },
        { name: "Oct", count: 58 },
        { name: "Nov", count: 62 },
        { name: "Dec", count: 70 },
      ],
      doctorPerformance: mockDoctors.map((doctor) => ({
        name: doctor.name,
        appointments: doctor._count?.Appointment || 0,
      })),
      recentActivity: [
        {
          id: "1",
          type: "appointment",
          description: "John Smith booked an appointment with Dr. Sarah Johnson",
          time: "5 mins ago",
        },
        {
          id: "2",
          type: "leave",
          description: "Dr. Michael Chen applied for leave from June 20 to June 25",
          time: "1 hour ago",
        },
        {
          id: "3",
          type: "medicine",
          description: "Inventory updated: Added 200 units of Paracetamol",
          time: "3 hours ago",
        },
        {
          id: "4",
          type: "registration",
          description: "New resident registered: Emily Johnson (Faculty)",
          time: "1 day ago",
        },
      ],
      appointmentsByStatus: [
        { name: "Scheduled", value: 65 },
        { name: "Completed", value: 45 },
        { name: "Cancelled", value: 18 },
      ],
    })
  }

  // Filter doctors based on search term and filter type
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "" || doctor.specialty === filterType
    return matchesSearch && matchesFilter
  })

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter((appointment) => {
    return (
      appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter((medicine) => {
    return (
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    return (
      prescription.appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    switch (normalizedStatus) {
      case "active":
      case "scheduled":
        return "success"
      case "on leave":
      case "completed":
        return "secondary"
      case "unavailable":
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Get doctor status based on availability
  const getDoctorStatus = (doctor: Doctor): "active" | "on leave" | "unavailable" => {
    if (!doctor.Availability || doctor.Availability.length === 0) {
      return "unavailable"
    }

    // Check if doctor has availability for today
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    const hasAvailabilityToday = doctor.Availability.some((avail) => avail.day.toLowerCase() === today)

    return hasAvailabilityToday ? "active" : "on leave"
  }

  // Format date and time
  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString)
    const formattedDate = date.toLocaleDateString()

    if (timeString) {
      return { date: formattedDate, time: timeString }
    }

    // If no separate time string, extract time from date
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes.toString().padStart(2, "0")
    const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`

    return { date: formattedDate, time: formattedTime }
  }

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading dashboard data...</h2>
      </div>
    )
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your healthcare facility</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh Data
            </Button>
            <Button size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Residents</p>
                <h2 className="text-3xl font-bold">{analytics?.totalResidents || 0}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 font-medium">↑ 12%</span> from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctors</p>
                <h2 className="text-3xl font-bold">{analytics?.totalDoctors || 0}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 font-medium">↑ 5%</span> from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                <h2 className="text-3xl font-bold">{analytics?.totalAppointments || 0}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-emerald-500 font-medium">↑ 8%</span> from last month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medicines</p>
                <h2 className="text-3xl font-bold">{analytics?.totalMedicines || 0}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-rose-500 font-medium">↓ 3%</span> from last month
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white rounded-lg p-2 mb-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <span className="hidden md:inline">Doctors</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden md:inline">Appointments</span>
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Prescriptions</span>
              </TabsTrigger>
              <TabsTrigger value="medicines" className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                <span className="hidden md:inline">Medicines</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white">
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
                        <LineChart data={analytics?.appointmentsByMonth || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: "#e0e0e0" }}
                          />
                          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e0e0e0" }} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-background border rounded-md shadow-sm p-2">
                                    <p className="font-medium">{payload[0].payload.name}</p>
                                    <p className="text-sm">
                                      Appointments: <span className="font-medium">{payload[0].value}</span>
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="var(--color-count)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Appointment Status</CardTitle>
                  <CardDescription>Distribution by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.appointmentsByStatus || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics?.appointmentsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background border rounded-md shadow-sm p-2">
                                  <p className="font-medium">{payload[0].name}</p>
                                  <p className="text-sm">
                                    Count: <span className="font-medium">{payload[0].value}</span>
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white">
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
                        <BarChart data={analytics?.doctorPerformance || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-background border rounded-md shadow-sm p-2">
                                    <p className="font-medium">{payload[0].payload.name}</p>
                                    <p className="text-sm">
                                      Appointments: <span className="font-medium">{payload[0].value}</span>
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar
                            dataKey="appointments"
                            fill="var(--color-appointments)"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system activities</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Activity className="h-4 w-4" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 pr-4">
                    <div className="space-y-6">
                      {analytics?.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div className="bg-muted p-2 rounded-full">
                            {activity.type === "appointment" && <CalendarDays className="h-4 w-4" />}
                            {activity.type === "leave" && <Clock className="h-4 w-4" />}
                            {activity.type === "medicine" && <Pill className="h-4 w-4" />}
                            {activity.type === "registration" && <Users className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{activity.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {activity.time}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Doctors</CardTitle>
                  <CardDescription>View and manage doctor information</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add Doctor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Doctor</DialogTitle>
                      <DialogDescription>Enter the details of the new doctor</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input placeholder="Enter doctor's name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input type="email" placeholder="Enter doctor's email" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
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
                          <label className="text-sm font-medium">Phone</label>
                          <Input placeholder="Enter phone number" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Qualification</label>
                        <Input placeholder="Enter doctor's qualification" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Add Doctor</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                    <div className="flex gap-2">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Filter by specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Specializations</SelectItem>
                          {Array.from(new Set(doctors.map((doctor) => doctor.specialty))).map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-3 font-medium">Doctor</th>
                            <th className="text-left p-3 font-medium">Specialization</th>
                            <th className="text-left p-3 font-medium">Patients</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredDoctors.map((doctor) => (
                            <tr key={doctor.id} className="hover:bg-muted/30">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={doctor.user?.image || "/placeholder.svg?height=40&width=40"}
                                      alt={doctor.name}
                                    />
                                    <AvatarFallback>{doctor.name.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{doctor.name}</p>
                                    <p className="text-sm text-muted-foreground">{doctor.user?.email || "No email"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">{doctor.specialty}</td>
                              <td className="p-3">{doctor._count?.Appointment || 0}</td>
                              <td className="p-3">
                                <Badge variant={getStatusBadge(getDoctorStatus(doctor))}>
                                  {getDoctorStatus(doctor)}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => setSelectedDoctorId(doctor.id)}>
                                    View
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                      <DropdownMenuItem>View Schedule</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredDoctors.length} of {doctors.length} doctors
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Manage Appointments</CardTitle>
                <CardDescription>View and manage appointment information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search appointments"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Status</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-3 font-medium">Patient</th>
                            <th className="text-left p-3 font-medium">Doctor</th>
                            <th className="text-left p-3 font-medium">Date & Time</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredAppointments.map((appointment) => {
                            const { date, time } = formatDateTime(appointment.date, appointment.time)
                            return (
                              <tr key={appointment.id} className="hover:bg-muted/30">
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage
                                        src={appointment.user.image || "/placeholder.svg?height=40&width=40"}
                                        alt={appointment.user.name}
                                      />
                                      <AvatarFallback>{appointment.user.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{appointment.user.name}</p>
                                      <p className="text-sm text-muted-foreground">{appointment.user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">{appointment.doctor.name}</td>
                                <td className="p-3">
                                  <div>
                                    <p className="font-medium">{date}</p>
                                    <p className="text-sm text-muted-foreground">{time}</p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge variant={getStatusBadge(appointment.status)}>{appointment.status}</Badge>
                                </td>
                                <td className="p-3">
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                          Cancel Appointment
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredAppointments.length} of {appointments.length} appointments
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Manage Prescriptions</CardTitle>
                <CardDescription>View and manage prescription information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search prescriptions"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {filteredPrescriptions.map((prescription) => (
                      <Card key={prescription.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{prescription.appointment.user.name}</CardTitle>
                              <CardDescription>{prescription.appointment.doctor.name}</CardDescription>
                            </div>
                            <Badge variant="outline">{new Date(prescription.createdAt).toLocaleDateString()}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <h4 className="text-sm font-medium mb-2">Prescribed Medicines</h4>
                          <ul className="space-y-2">
                            {prescription.medicines.map((prescMed) => (
                              <li key={prescMed.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                                <div className="flex justify-between">
                                  <span className="font-medium">{prescMed.medicine.name}</span>
                                  <span className="text-muted-foreground">{prescMed.duration}</span>
                                </div>
                                <p className="text-muted-foreground">{prescMed.dosage}</p>
                              </li>
                            ))}
                          </ul>
                          {prescription.notes && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-1">Notes</h4>
                              <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="bg-muted/20 flex justify-end gap-2 py-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm">Print</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medicines" className="space-y-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Medicines</CardTitle>
                  <CardDescription>View and manage medicine inventory</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add Medicine
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Medicine</DialogTitle>
                      <DialogDescription>Enter the details of the new medicine</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input placeholder="Enter medicine name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Price</label>
                          <Input type="number" placeholder="Enter price" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input placeholder="Enter medicine description" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Stock</label>
                          <Input type="number" placeholder="Enter stock quantity" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Dosage</label>
                          <Input placeholder="Enter standard dosage" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Add Medicine</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search medicines by name"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="stock">Stock</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-3 font-medium">Medicine Name</th>
                            <th className="text-left p-3 font-medium">Description</th>
                            <th className="text-left p-3 font-medium">Stock</th>
                            <th className="text-left p-3 font-medium">Price</th>
                            <th className="text-left p-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredMedicines.map((medicine) => (
                            <tr key={medicine.id} className="hover:bg-muted/30">
                              <td className="p-3 font-medium">{medicine.name}</td>
                              <td className="p-3">{medicine.description}</td>
                              <td className="p-3">
                                <div className="flex items-center">
                                  {medicine.stock}
                                  {medicine.stock < 100 && (
                                    <Badge variant="destructive" className="ml-2">
                                      Low Stock
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">${medicine.price.toFixed(2)}</td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                      <DropdownMenuItem>Update Stock</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive">Remove Item</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredMedicines.length} of {medicines.length} medicines
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
