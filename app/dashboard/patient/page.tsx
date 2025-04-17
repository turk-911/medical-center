"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Clock,
  User,
  Activity,
  Bell,
  FileText,
  Settings,
  PlusCircle,
} from "lucide-react";
import AppointmentList from "@/components/appointment-list";
import DoctorSearch from "@/components/doctor-search";
import BookAppointment from "@/components/book-appointment";

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
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [notifications, setNotifications] = useState<number>(3);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments");
        if (response.ok) {
          const data = await response.json();
          setAppointments(data.appointments);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  const handleBookingComplete = async (appointmentData: any) => {
    setShowBooking(false);
    setSelectedDoctor(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!res.ok) {
        throw new Error("Failed to book appointment");
      }

      await fetchAppointments(); // Ensure appointments are reloaded
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  const getDayWithAppointments = (date: Date) => {
    if (!appointments.length) return false;
    const dateString = date.toISOString().split("T")[0];
    return appointments.some((app) => app.date === dateString);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 bg-cover bg-fixed">
      <div className="container mx-auto px-4 py-8">
        {/* Header with avatar and notifications */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-blue-500">
              <AvatarImage src={user?.avatarUrl || ""} />
              <AvatarFallback className="bg-blue-600 text-white">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Resident Dashboard
              </h1>
              <p className="text-slate-300">
                Welcome back, {user?.name || "User"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-300" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {notifications}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-slate-300" />
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <Card className="bg-slate-900 bg-opacity-90 border-slate-700 shadow-lg">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-lg text-white">
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {[
                  {
                    icon: <User className="mr-2 h-4 w-4" />,
                    label: "Profile",
                    active: false,
                  },
                  {
                    icon: <CalendarDays className="mr-2 h-4 w-4" />,
                    label: "Appointments",
                    active: true,
                  },
                  {
                    icon: <Activity className="mr-2 h-4 w-4" />,
                    label: "Health Records",
                    active: false,
                  },
                  {
                    icon: <FileText className="mr-2 h-4 w-4" />,
                    label: "Documents",
                    active: false,
                  },
                  {
                    icon: <Settings className="mr-2 h-4 w-4" />,
                    label: "Settings",
                    active: false,
                  },
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant={item.active ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      item.active
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 border-t border-slate-700 p-4">
              <div className="text-xs text-slate-400">
                Medical Facility Hours
              </div>
              <div className="text-sm text-slate-300">
                Monday - Friday: 8:00 AM - 6:00 PM
                <br />
                Saturday: 9:00 AM - 1:00 PM
              </div>
              <Button variant="link" size="sm" className="text-blue-400 p-0">
                Emergency Contact
              </Button>
            </CardFooter>
          </Card>

          {/* Main panel */}
          <Card className="lg:col-span-2 bg-slate-900 bg-opacity-90 border-slate-700 shadow-lg">
            <CardHeader className="border-b border-slate-700">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-xl text-white">
                    Health Dashboard
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage your appointments and health records
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="mb-6 bg-slate-800 p-1">
                  <TabsTrigger
                    value="appointments"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    My Appointments
                  </TabsTrigger>
                  <TabsTrigger
                    value="book"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Book Appointment
                  </TabsTrigger>
                  <TabsTrigger
                    value="records"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Health Records
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appointments">
                  <div className="bg-slate-800 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-medium">
                        Upcoming Appointments
                      </h3>
                      <Badge className="bg-blue-600 hover:bg-blue-700">
                        {isLoading
                          ? "..."
                          : appointments.filter(
                              (app) => app.status === "upcoming"
                            ).length}
                      </Badge>
                    </div>
                  </div>
                  <AppointmentList
                    appointments={appointments}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="book">
                  {showBooking ? (
                    // Booking Form
                    <BookAppointment
                      doctor={selectedDoctor}
                      onComplete={handleBookingComplete}
                      onCancel={() => setShowBooking(false)}
                    />
                  ) : (
                    // Doctor Search with Enhanced UI
                    <div className="space-y-6">
                      <div className="bg-slate-800 bg-opacity-70 p-6 rounded-lg border border-slate-700 shadow-md">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                          <User className="h-5 w-5 mr-2 text-blue-400" />
                          Find a Specialist
                        </h3>

                        <div className="relative mb-6">
                          <input
                            type="text"
                            placeholder="Search by name, specialty or department..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 pl-10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                          />
                          <div className="absolute left-3 top-3.5 text-slate-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="11" cy="11" r="8"></circle>
                              <path d="m21 21-4.3-4.3"></path>
                            </svg>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {[
                            "Cardiology",
                            "Neurology",
                            "Pediatrics",
                            "Dermatology",
                            "Oncology",
                          ].map((specialty) => (
                            <Badge
                              key={specialty}
                              className="bg-slate-700 hover:bg-blue-600 cursor-pointer transition-colors px-3 py-1.5"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sample doctors - this would be replaced by DoctorSearch component results */}
                        {[
                          {
                            id: 1,
                            name: "Dr. Sarah Johnson",
                            specialty: "Cardiology",
                            rating: 4.8,
                            availability: "Today",
                            image: "/api/placeholder/64/64",
                          },
                          {
                            id: 2,
                            name: "Dr. Michael Chen",
                            specialty: "Neurology",
                            rating: 4.9,
                            availability: "Tomorrow",
                            image: "/api/placeholder/64/64",
                          },
                          {
                            id: 3,
                            name: "Dr. Lisa Williams",
                            specialty: "Dermatology",
                            rating: 4.7,
                            availability: "Today",
                            image: "/api/placeholder/64/64",
                          },
                          {
                            id: 4,
                            name: "Dr. Robert Miller",
                            specialty: "Pediatrics",
                            rating: 4.9,
                            availability: "Next Week",
                            image: "/api/placeholder/64/64",
                          },
                        ].map((doctor) => (
                          <div
                            key={doctor.id}
                            className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-all shadow-md hover:shadow-blue-900/20"
                            onClick={() => handleDoctorSelect(doctor)}
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-16 w-16 border-2 border-slate-700">
                                <AvatarImage
                                  src={doctor.image}
                                  alt={doctor.name}
                                />
                                <AvatarFallback className="bg-blue-600 text-white">
                                  {doctor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="text-white font-medium">
                                  {doctor.name}
                                </h4>
                                <p className="text-slate-400 text-sm">
                                  {doctor.specialty}
                                </p>
                                <div className="flex items-center mt-1">
                                  <div className="flex">
                                    {Array(5)
                                      .fill(0)
                                      .map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`w-3.5 h-3.5 ${
                                            i < Math.floor(doctor.rating)
                                              ? "text-yellow-400"
                                              : "text-slate-600"
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                        </svg>
                                      ))}
                                  </div>
                                  <span className="text-slate-400 text-xs ml-1">
                                    ({doctor.rating})
                                  </span>
                                </div>
                              </div>
                              <div>
                                <Badge
                                  className={`
                  ${
                    doctor.availability === "Today"
                      ? "bg-green-600"
                      : doctor.availability === "Tomorrow"
                      ? "bg-blue-600"
                      : "bg-slate-600"
                  }
                `}
                                >
                                  {doctor.availability}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                              <span className="text-xs text-slate-400">
                                20+ years experience
                              </span>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Book Now
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="records">
                  <div className="bg-slate-800 p-6 rounded-lg text-center">
                    <FileText className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                    <h3 className="text-white font-medium mb-2">
                      Medical Records
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Access and manage your medical history and test results
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      View Records
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-900 bg-opacity-90 border-slate-700 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg text-white">Calendar</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border border-slate-700 bg-slate-800"
                  classNames={{
                    day_today: "bg-blue-600 text-white",
                    day_selected: "bg-blue-700 text-slate-50",
                    day: "hover:bg-slate-700 focus:bg-slate-700 focus:text-slate-50",
                    day_outside: "text-slate-500 opacity-50",
                    day_disabled: "text-slate-500",
                    day_hidden: "invisible",
                    day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_range_end:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_range_start:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  }}
                  modifiers={{
                    hasAppointment: (date) => getDayWithAppointments(date),
                  }}
                  modifiersClassNames={{
                    hasAppointment: "border-2 border-green-500",
                  }}
                />
                <Separator className="my-4 bg-slate-700" />
                <div>
                  <h3 className="font-medium mb-3 text-white">
                    {selectedDate?.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="h-24 bg-slate-800 animate-pulse rounded-md"></div>
                    ) : appointments.filter(
                        (app) =>
                          app.date === selectedDate?.toISOString().split("T")[0]
                      ).length > 0 ? (
                      appointments
                        .filter(
                          (app) =>
                            app.date ===
                            selectedDate?.toISOString().split("T")[0]
                        )
                        .map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between text-sm p-3 border border-slate-700 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-600 rounded-full">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {app.doctorName}
                                </div>
                                <div className="text-slate-400 text-xs">
                                  {app.specialization}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center text-slate-300">
                              <Clock className="mr-1 h-3 w-3" />
                              {app.time}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-sm text-slate-400 p-4 text-center bg-slate-800 rounded-md">
                        No appointments on this date
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 bg-opacity-90 border-slate-700 shadow-lg">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg text-white">
                  Health Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-md border border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 rounded-full">
                        <CalendarDays className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-white">
                        Upcoming Appointments
                      </span>
                    </div>
                    <Badge className="bg-blue-600">
                      {isLoading
                        ? "..."
                        : appointments.filter(
                            (app) => app.status === "upcoming"
                          ).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-md border border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-600 rounded-full">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-white">
                        Past Appointments
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-500"
                    >
                      {isLoading
                        ? "..."
                        : appointments.filter(
                            (app) => app.status === "completed"
                          ).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-md border border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-600 rounded-full">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm text-white">
                        Preferred Doctors
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-purple-600 text-white"
                    >
                      {isLoading ? "..." : "3"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-slate-700 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-600 text-slate-300 hover:text-white"
                >
                  View Health Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
