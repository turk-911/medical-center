"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Download,
  FileText,
  Filter,
  Loader2,
  LogOut,
  MoreHorizontal,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DoctorDetail } from "@/components/doctor-detail";

// Types based on the actual API responses
interface User {
  id: number;
  name: string;
  email: string;
  image?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  bio?: string;
  image?: string;
  userId: number;
  user?: User;
  Availability?: Availability[];
  _count?: {
    Appointment: number;
  };
  Appointment?: AppointmentWithUser[];
}

interface Availability {
  id: number;
  doctorId: number;
  day: string;
  startTime: string;
  endTime: string;
}

interface AppointmentWithUser {
  id: number;
  date: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
}

interface Appointment {
  id: number;
  userId: number;
  doctorId: number;
  date: string;
  time?: string;
  status: string;
  type?: string;
  doctor: Doctor;
  user: User;
}

interface Medicine {
  id: number;
  name: string;
  description: string;
  dosage?: string;
  price: number;
  stock: number;
}

interface PrescriptionMedicine {
  id: number;
  prescriptionId: number;
  medicineId: number;
  dosage: string;
  duration: string;
  medicine: Medicine;
}

interface Prescription {
  id: number;
  appointmentId: number;
  notes?: string;
  createdAt: string;
  appointment: Appointment;
  medicines: PrescriptionMedicine[];
}

interface UserBasic {
  email: string;
}

interface Doctor {
  id: number;
  name: string;
  user: UserBasic;
}

interface Leave {
  id: number;
  fromDate: string; // Dates from backend are ISO strings
  toDate: string;
  doctorId: number;
  substituteId: number;
  doctor: Doctor;
  substitute: Doctor;
  status: "pending" | "approved" | "rejected";
}

// Dashboard analytics interface
interface DashboardAnalytics {
  totalResidents: number;
  totalDoctors: number;
  totalAppointments: number;
  totalMedicines: number;
  appointmentsByMonth: {
    name: string;
    count: number;
  }[];
  doctorPerformance: {
    name: string;
    appointments: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    description: string;
    time: string;
  }[];
  appointmentsByStatus: {
    name: string;
    value: number;
  }[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("doctors");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for our data
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [doctorAnalytics, setDoctorAnalytics] = useState<Doctor | null>(null);

  const [status, setStatus] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [password, setPassword] = useState("");
  const [qualification, setQualification] = useState("");
  const [availability, setAvailability] = useState<
    { dayOfWeek: string; startTime: string; endTime: string }[]
  >([{ dayOfWeek: "", startTime: "", endTime: "" }]);



  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Set default active tab to "doctors" instead of "overview"
        setActiveTab("doctors");

        const doctorsRes = await fetch("/api/admin/doctors");
        const doctorsData: Doctor[] = await doctorsRes.json();
        setDoctors(doctorsData);

        if (doctorsData.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(doctorsData[0].id);
        }

        // Fetch doctor analytics data when selectedDoctorId changes
        if (selectedDoctorId) {
          try {
            const analyticsRes = await fetch(
              `/api/admin/analytics/${selectedDoctorId}`
            );
            if (!analyticsRes.ok) {
              throw new Error(
                `Error fetching doctor analytics: ${analyticsRes.statusText}`
              );
            }
            const analyticsData: Doctor = await analyticsRes.json();
            console.log("Doctor analytics data:", analyticsData);
            setDoctorAnalytics(analyticsData);
          } catch (error) {
            console.error("Error fetching doctor analytics:", error);
          }
        }

        const medicines = await fetch("/api/admin/medicines");
        const medicinesData: Medicine[] = await medicines.json();
        setMedicines(medicinesData);

        const appointmentsRes = await fetch("/api/admin/appointments");
        const appointmentsData: Appointment[] = await appointmentsRes.json();
        console.log("Appointment data: ", appointmentsData);
        setAppointments(appointmentsData);

        const prescriptionsRes = await fetch("/api/admin/prescriptions");
        const prescriptionsData: Prescription[] = await prescriptionsRes.json();
        console.log("Prescription data: ", prescriptionsData);
        setPrescriptions(prescriptionsData);

        const uniqueMedicines = new Map<number, Medicine>();
        prescriptionsData.forEach((prescription) => {
          prescription.PrescriptionMedicine.forEach((prescMed) => {
            if (!uniqueMedicines.has(prescMed.medicine.id)) {
              uniqueMedicines.set(prescMed.medicine.id, prescMed.medicine);
            }
          });
        });
        setMedicines(Array.from(uniqueMedicines.values()));

        generateDashboardAnalytics(
          doctorsData,
          appointmentsData,
          uniqueMedicines.size
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDoctorId]);
  
  const generateDashboardAnalytics = (
    doctors: Doctor[],
    appointments: Appointment[],
    medicinesCount: number
  ) => {
    const uniqueUsers = new Set(appointments.map((app) => app.userId));
    const totalResidents = uniqueUsers.size;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const appointmentsByMonth = monthNames.map((month) => ({
      name: month,
      count: 0,
    }));

    appointments.forEach((app) => {
      const date = new Date(app.date);
      const monthIndex = date.getMonth();
      appointmentsByMonth[monthIndex].count += 1;
    });

    const statusCounts: Record<string, number> = {};
    appointments.forEach((app) => {
      const status = app.status.charAt(0).toUpperCase() + app.status.slice(1);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const appointmentsByStatus = Object.entries(statusCounts).map(
      ([name, value]) => ({ name, value })
    );

    const doctorPerformance = doctors.map((doctor) => ({
      name: doctor.name,
      appointments: doctor._count?.Appointment || 0,
    }));

    const recentActivity = appointments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((app) => ({
        id: app.id.toString(),
        type: "appointment",
        description: `${app.user.name} has an appointment with ${app.doctor.name}`,
        time: getRelativeTime(new Date(app.date)),
      }));

    setAnalytics({
      totalResidents,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      totalMedicines: medicinesCount,
      appointmentsByMonth,
      doctorPerformance,
      recentActivity,
      appointmentsByStatus,
    });
  };

  // Update the refreshData function to also refresh doctor analytics
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const doctorsRes = await fetch("/api/admin/doctors");
      const doctorsData: Doctor[] = await doctorsRes.json();
      setDoctors(doctorsData);

      if (selectedDoctorId) {
        try {
          const analyticsRes = await fetch(
            `/api/admin/analytics/${selectedDoctorId}`
          );
          if (!analyticsRes.ok) {
            throw new Error(
              `Error refreshing doctor analytics: ${analyticsRes.statusText}`
            );
          }
          const analyticsData: Doctor = await analyticsRes.json();
          setDoctorAnalytics(analyticsData);
        } catch (error) {
          console.error("Error refreshing doctor analytics:", error);
        }
      }

      const appointmentsRes = await fetch("/api/admin/appointments");
      const appointmentsData: Appointment[] = await appointmentsRes.json();
      setAppointments(appointmentsData);

      const prescriptionsRes = await fetch("/api/admin/prescriptions");
      const prescriptionsData: Prescription[] = await prescriptionsRes.json();
      setPrescriptions(prescriptionsData);

      const uniqueMedicines = new Map<number, Medicine>();
      prescriptionsData.forEach((prescription) => {
        prescription.PrescriptionMedicine.forEach((prescMed) => {
          if (!uniqueMedicines.has(prescMed.medicine.id)) {
            uniqueMedicines.set(prescMed.medicine.id, prescMed.medicine);
          }
        });
      });
      setMedicines(Array.from(uniqueMedicines.values()));

      generateDashboardAnalytics(
        doctorsData,
        appointmentsData,
        uniqueMedicines.size
      );
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    }
    if (diffHours > 0) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    }
    if (diffMins > 0) {
      return diffMins === 1 ? "1 min ago" : `${diffMins} mins ago`;
    }
    return "Just now";
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "" || doctor.specialty === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredAppointments = appointments.filter((appointment) => {
    return (
      appointment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredMedicines = medicines.filter((medicine) => {
    return (
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    console.log("Prescription: ", prescription);
    return (
      prescription.appointment.user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.appointment.doctor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "active":
      case "scheduled":
        return "success";
      case "on leave":
      case "completed":
        return "secondary";
      case "unavailable":
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const [leaves, setLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await fetch("/api/leave");
        const data: Leave[] = await response.json();
        setLeaves(data);
      } catch (error) {
        console.error("Failed to fetch leaves", error);
      }
    };

    console.log(leaves);

    fetchLeaves();
  }, []);

  const getDoctorStatus = (
    doctor: Doctor
  ): "active" | "on leave" | "unavailable" => {
    if (!doctor.Availability || doctor.Availability.length === 0) {
      return "unavailable";
    }

    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const hasAvailabilityToday = doctor.Availability.some(
      (avail) => avail.dayOfWeek.toLowerCase() === today
    );

    return hasAvailabilityToday ? "active" : "on leave";
  };

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      const response = await fetch("/api/logout", {
        method: "GET",
      });
      if (response.ok) {
        window.location.href = "/";
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  function updateAvailability(index: number, field: string, value: string) {
    const updated: any = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  }

  const resetForm = () => {
    setName("");
    setEmail("");
    setSpecialty("");
    setQualification("");
    setPassword("");
    setAvailability([{ dayOfWeek: "", startTime: "", endTime: "" }]);
  };

  const handleAddDoctor = async () => {
    const payload = {
      name,
      email,
      specialty,
      qualification,
      password,
      availability,
    };

    console.log("Payload is: ", payload);

    try {
      const res = await fetch("/api/admin/add-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to add doctor");

      alert("Doctor added successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while adding the doctor");
    }
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString();

    if (timeString) {
      return { date: formattedDate, time: timeString };
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

    return { date: formattedDate, time: formattedTime };
  };

  const handleLeaveAction = async (
    leaveId: number,
    action: "approved" | "rejected"
  ) => {
    try {
      const response = await fetch(`/api/leave/${leaveId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        setLeaves(
          leaves.map((leave) =>
            leave.id === leaveId ? { ...leave, status: action } : leave
          )
        );
      } else {
        console.error("Failed to update leave status");
      }
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  };

  const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444"];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-medium text-slate-800">
            Loading dashboard data...
          </h2>
          <p className="text-slate-500 max-w-sm">
            Please wait while we fetch the latest information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your healthcare facility with ease
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Data
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-1 bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg p-2 mb-6 shadow-sm">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <TabsTrigger
                value="doctors"
                className="flex items-center gap-2 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700"
              >
                <Stethoscope className="h-4 w-4" />
                <span className="hidden md:inline">Doctors</span>
              </TabsTrigger>
              <TabsTrigger
                value="appointments"
                className="flex items-center gap-2 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden md:inline">Appointments</span>
              </TabsTrigger>
              <TabsTrigger
                value="prescriptions"
                className="flex items-center gap-2 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden md:inline">Prescriptions</span>
              </TabsTrigger>
              <TabsTrigger
                value="medicines"
                className="flex items-center gap-2 data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700"
              >
                <Pill className="h-4 w-4" />
                <span className="hidden md:inline">Medicines</span>
              </TabsTrigger>
              <TabsTrigger
                value="leaves"
                className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden md:inline">Leaves</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-full">
                <UserCog className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome to the Healthcare Admin Panel
                </h2>
                <p className="text-slate-600 max-w-2xl">
                  Manage doctors, appointments, prescriptions, and medicines all
                  in one place. Use the tabs above to navigate between different
                  sections.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card className="bg-cyan-50 border-none">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Stethoscope className="h-8 w-8 text-cyan-600 mb-2" />
                  <h3 className="font-medium text-slate-900">Manage Doctors</h3>
                  <p className="text-sm text-slate-600">
                    Add, edit, and view doctor profiles
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 border-none">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <CalendarDays className="h-8 w-8 text-amber-600 mb-2" />
                  <h3 className="font-medium text-slate-900">
                    Track Appointments
                  </h3>
                  <p className="text-sm text-slate-600">
                    Schedule and manage patient visits
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 border-none">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <FileText className="h-8 w-8 text-emerald-600 mb-2" />
                  <h3 className="font-medium text-slate-900">
                    Issue Prescriptions
                  </h3>
                  <p className="text-sm text-slate-600">
                    Create and manage patient prescriptions
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-rose-50 border-none">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Pill className="h-8 w-8 text-rose-600 mb-2" />
                  <h3 className="font-medium text-slate-900">
                    Inventory Control
                  </h3>
                  <p className="text-sm text-slate-600">
                    Monitor and manage medicine stock
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <TabsContent value="doctors" className="space-y-6">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-slate-800">
                    Manage Doctors
                  </CardTitle>
                  <CardDescription>
                    View and manage doctor information
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-1 bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="h-4 w-4" />
                      Add Doctor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Doctor</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new doctor
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Name
                          </label>
                          <Input
                            placeholder="Enter doctor's name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Email
                          </label>
                          <Input
                            type="email"
                            placeholder="Enter doctor's email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Specialization
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter specialization"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Password
                          </label>
                          <Input
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Qualification
                        </label>
                        <Input
                          placeholder="Enter doctor's qualification"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Availability
                        </label>

                        {availability.map((slot, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2">
                            <Input
                              placeholder="Day (e.g., Monday)"
                              value={slot.dayOfWeek}
                              onChange={(e) =>
                                updateAvailability(
                                  index,
                                  "dayOfWeek",
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="Start time (e.g., 09:00)"
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateAvailability(
                                  index,
                                  "startTime",
                                  e.target.value
                                )
                              }
                            />
                            <Input
                              placeholder="End time (e.g., 17:00)"
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateAvailability(
                                  index,
                                  "endTime",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          className="text-sm text-cyan-600 hover:underline mt-1"
                          onClick={() =>
                            setAvailability([
                              ...availability,
                              { dayOfWeek: "", startTime: "", endTime: "" },
                            ])
                          }
                        >
                          + Add more availability
                        </button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="text-slate-700">
                        Cancel
                      </Button>
                      <Button
                        className="bg-cyan-600 hover:bg-cyan-700"
                        onClick={handleAddDoctor}
                      >
                        Add Doctor
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search doctors by name"
                        className="pl-8 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[200px] border-slate-200 focus:border-cyan-500 focus:ring-cyan-500">
                          <SelectValue placeholder="Filter by specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All Specializations
                          </SelectItem>
                          {Array.from(
                            new Set(doctors.map((doctor) => doctor.specialty))
                          ).map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left p-3 font-medium text-slate-700">
                              Doctor
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Specialization
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Patients
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Status
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredDoctors.map((doctor) => (
                            <tr
                              key={doctor.id}
                              className="hover:bg-slate-50 transition-colors duration-150"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        doctor.user?.image ||
                                        "/placeholder.svg?height=40&width=40" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt={doctor.name}
                                    />
                                    <AvatarFallback className="bg-cyan-100 text-cyan-700">
                                      {doctor.name.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {doctor.name}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {doctor.user?.email || "No email"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-slate-700">
                                {doctor.specialty}
                              </td>
                              <td className="p-3 text-slate-700">
                                {doctor._count?.Appointment || 0}
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant={getStatusBadge(
                                    getDoctorStatus(doctor)
                                  )}
                                >
                                  {getDoctorStatus(doctor)}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedDoctorId(doctor.id)
                                    }
                                    className="text-cyan-600 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                                  >
                                    View
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem>
                                        Edit Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        View Schedule
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-rose-600">
                                        Deactivate
                                      </DropdownMenuItem>
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
              <CardFooter className="flex justify-between border-t p-4 text-slate-600">
                <div className="text-sm">
                  Showing {filteredDoctors.length} of {doctors.length} doctors
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-slate-700"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-700 hover:bg-slate-100"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
            {selectedDoctorId && (
              <div className="mt-6">
                <DoctorDetail doctorId={selectedDoctorId} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800">
                  Manage Appointments
                </CardTitle>
                <CardDescription>
                  View and manage appointment information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search appointments"
                        className="pl-8 border-slate-200 focus:border-amber-500 focus:ring-amber-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full sm:w-[200px] border-slate-200 focus:border-amber-500 focus:ring-amber-500">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-slate-700 hover:bg-slate-100"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left p-3 font-medium text-slate-700">
                              Patient
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Doctor
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Date & Time
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Status
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredAppointments.map((appointment) => {
                            const { date, time } = formatDateTime(
                              appointment.date,
                              appointment.time
                            );
                            return (
                              <tr
                                key={appointment.id}
                                className="hover:bg-slate-50 transition-colors duration-150"
                              >
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          appointment.user.image ||
                                          "/placeholder.svg?height=40&width=40" ||
                                          "/placeholder.svg" ||
                                          "/placeholder.svg" ||
                                          "/placeholder.svg" ||
                                          "/placeholder.svg"
                                        }
                                        alt={appointment.user.name}
                                      />
                                      <AvatarFallback className="bg-amber-100 text-amber-700">
                                        {appointment.user.name.substring(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-slate-800">
                                        {appointment.user.name}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {appointment.user.email}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-700">
                                  {appointment.doctor.name}
                                </td>
                                <td className="p-3">
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {date}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {time}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge
                                    variant={getStatusBadge(appointment.status)}
                                  >
                                    {appointment.status}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                    >
                                      View
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-slate-500 hover:text-slate-700"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem>
                                          Reschedule
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          Send Reminder
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-rose-600">
                                          Cancel Appointment
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 text-slate-600">
                <div className="text-sm">
                  Showing {filteredAppointments.length} of {appointments.length}{" "}
                  appointments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-slate-700"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-700 hover:bg-slate-100"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800">
                  Manage Prescriptions
                </CardTitle>
                <CardDescription>
                  View and manage prescription information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search prescriptions"
                        className="pl-8 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-slate-700 hover:bg-slate-100"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {filteredPrescriptions.map((prescription) => (
                      <Card
                        key={prescription.id}
                        className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <CardHeader className="bg-emerald-50 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base text-slate-800">
                                {prescription.appointment?.user?.name ??
                                  "Unknown User"}
                              </CardTitle>
                              <CardDescription>
                                {prescription.appointment?.doctor?.name ??
                                  "Unknown Doctor"}
                              </CardDescription>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-white text-slate-700"
                            >
                              {new Date(
                                prescription.createdAt ?? Date.now()
                              ).toLocaleDateString()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <h4 className="text-sm font-medium mb-2 text-slate-700">
                            Prescribed Medicines
                          </h4>
                          <ul className="space-y-2">
                            {prescription.PrescriptionMedicine?.map((item) => (
                              <li
                                key={item.id}
                                className="text-sm border-b pb-2 last:border-0 last:pb-0"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium text-slate-800">
                                    {item.medicine?.name}
                                  </span>
                                  <span className="text-slate-500">
                                    {item.quantity} {item.medicine?.unit}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-slate-700">
                                Dosage
                              </h4>
                              <p className="text-sm text-slate-500">
                                {prescription.dosage}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-slate-700">
                                Duration
                              </h4>
                              <p className="text-sm text-slate-500">
                                {prescription.duration}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-slate-700">
                                Frequency
                              </h4>
                              <p className="text-sm text-slate-500">
                                {prescription.frequency}
                              </p>
                            </div>
                          </div>

                          {prescription.description && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-1 text-slate-700">
                                Notes
                              </h4>
                              <p className="text-sm text-slate-500">
                                {prescription.description}
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="bg-slate-50 flex justify-end gap-2 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Print
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medicines" className="space-y-6">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-slate-800">
                    Manage Medicines
                  </CardTitle>
                  <CardDescription>
                    View and manage medicine inventory
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-1 bg-rose-600 hover:bg-rose-700">
                      <Plus className="h-4 w-4" />
                      Add Medicine
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Medicine</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new medicine
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Name
                          </label>
                          <Input placeholder="Enter medicine name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Price
                          </label>
                          <Input type="number" placeholder="Enter price" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          Description
                        </label>
                        <Input placeholder="Enter medicine description" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Stock
                          </label>
                          <Input
                            type="number"
                            placeholder="Enter stock quantity"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">
                            Dosage
                          </label>
                          <Input placeholder="Enter standard dosage" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="text-slate-700">
                        Cancel
                      </Button>
                      <Button className="bg-rose-600 hover:bg-rose-700">
                        Add Medicine
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search medicines by name"
                        className="pl-8 border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-full sm:w-[200px] border-slate-200 focus:border-rose-500 focus:ring-rose-500">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="stock">Stock</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-slate-700 hover:bg-slate-100"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="w-full">
                          <tr className="bg-slate-50">
                            <th className="text-left p-3 font-medium text-slate-700">
                              Medicine Name
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Stock
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredMedicines.map((medicine) => (
                            <tr
                              key={medicine.id}
                              className="hover:bg-slate-50 transition-colors duration-150"
                            >
                              <td className="p-3 font-medium text-slate-800">
                                {medicine.name}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center">
                                  <span className="text-slate-700">
                                    {medicine.quantity}
                                  </span>
                                  {medicine.quantity < 100 && (
                                    <Badge
                                      variant="destructive"
                                      className="ml-2 bg-rose-100 text-rose-700 hover:bg-rose-200"
                                    >
                                      Low Stock
                                    </Badge>
                                  )}
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
              <CardFooter className="flex justify-between border-t p-4 text-slate-600">
                <div className="text-sm">
                  Showing {filteredMedicines.length} of {medicines.length}{" "}
                  medicines
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-slate-700"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-700 hover:bg-slate-100"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="leaves" className="space-y-6">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800">
                  Manage Leave Requests
                </CardTitle>
                <CardDescription>
                  Approve or reject leave requests from doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search leave requests"
                        className="pl-8 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full sm:w-[200px] border-slate-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left p-3 font-medium text-slate-700">
                              Doctor
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Substitute
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Duration
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Reason
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Status
                            </th>
                            <th className="text-left p-3 font-medium text-slate-700">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {leaves.map((leave) => {
                            const startDate = new Date(
                              leave.startDate
                            ).toLocaleDateString();
                            const endDate = new Date(
                              leave.endDate
                            ).toLocaleDateString();
                            return (
                              <tr
                                key={leave.id}
                                className="hover:bg-slate-50 transition-colors duration-150"
                              >
                                <td className="p-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          leave.doctor.user?.image ||
                                          "/placeholder.svg?height=40&width=40"
                                        }
                                        alt={leave.doctor.name}
                                      />
                                      <AvatarFallback className="bg-purple-100 text-purple-700">
                                        {leave.doctor.name.substring(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-slate-800">
                                        {leave.doctor.name}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {leave.doctor.specialty}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-700">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage
                                        src={
                                          leave.substitute.user?.image ||
                                          "/placeholder.svg?height=40&width=40"
                                        }
                                        alt={leave.substitute.name}
                                      />
                                      <AvatarFallback className="bg-purple-100 text-purple-700">
                                        {leave.substitute.name.substring(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-slate-800">
                                        {leave.substitute.name}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {leave.substitute.specialty}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {startDate}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      to {endDate}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-700">
                                  {leave.reason}
                                </td>
                                <td className="p-3">
                                  <Badge
                                    variant={
                                      leave.status === "approved"
                                        ? "success"
                                        : leave.status === "rejected"
                                        ? "destructive"
                                        : "outline"
                                    }
                                  >
                                    {leave.status.charAt(0).toUpperCase() +
                                      leave.status.slice(1)}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  {leave.status === "pending" ? (
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleLeaveAction(
                                            leave.id,
                                            "approved"
                                          )
                                        }
                                        className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleLeaveAction(
                                            leave.id,
                                            "rejected"
                                          )
                                        }
                                        className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                      >
                                        Reject
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 text-sm">
                                      {leave.status === "approved"
                                        ? "Approved"
                                        : "Rejected"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 text-slate-600">
                <div className="text-sm">
                  Showing {filteredLeaves.length} of {leaves.length} leave
                  requests
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-slate-700"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-700 hover:bg-slate-100"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
