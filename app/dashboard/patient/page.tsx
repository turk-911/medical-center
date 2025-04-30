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
  LogOut,
} from "lucide-react";
import AppointmentList from "@/components/appointment-list";
import BookAppointment from "@/components/book-appointment";
import { format, addMonths, subMonths } from "date-fns";
import PatientPrescription from "@/components/patient-prescription";
import { Appointment, Doctor } from "@/app/types";

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

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState("");

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const [id, setId] = useState("");

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch("/api/doctors");
        const data = await res.json();

        console.log("Fetched doctors", data);

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        setDoctors(data.doctors);
      } catch (error) {
        setError(error as string);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDoctors();
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          console.log("Patient", data.user);
          setUser(data.user);
          console.log("d", data);

          setId(data.user.id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log(user);
        const response = await fetch(`/api/appointments?userId=${id}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Appointments: ", data);
          setAppointments(data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

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

  // const fetchAppointments = async () => {
  //   try {
  //     const response = await fetch(`/api/appointments/${id}`);
  //     if (response.ok) {
  //       const data = await response.json();

  //       setAppointments(data.appointments);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching appointments:", error);
  //   }
  // };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  // const handleBookingComplete = async (appointmentData: any) => {
  //   setShowBooking(false);
  //   setSelectedDoctor(null);

  //   try {
  //     const res = await fetch("/api/appointments", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(appointmentData),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Failed to book appointment");
  //     }

  //     // await fetchAppointments();
  //   } catch (error) {
  //     console.error("Booking error:", error);
  //   }
  // };

  const getDayWithAppointments = (date: Date) => {
    if (!appointments.length) return false;
    const dateString = date.toISOString().split("T")[0];
    return appointments.some((app) => app.date === dateString);
  };

  const selectedDayAppointments = appointments.filter(
    (a) => a.date === format(selectedDate as Date, "yyyy-MM-dd")
  );

  // console.log("User id", user.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 bg-cover bg-fixed">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-blue-500">
              <AvatarImage src={user?.avatarUrl || ""} />
              <AvatarFallback className="bg-blue-500 text-white">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Resident Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || "User"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  {notifications}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-600" />
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

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg text-gray-800">
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
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 border-t border-gray-200 p-4">
              <div className="text-xs text-gray-500">
                Medical Facility Hours
              </div>
              <div className="text-sm text-gray-700">
                Monday - Friday: 8:00 AM - 6:00 PM
                <br />
                Saturday: 9:00 AM - 1:00 PM
              </div>
              <Button variant="link" size="sm" className="text-blue-500 p-0">
                Emergency Contact
              </Button>
            </CardFooter>
          </Card>

          {/* Main panel */}
          <Card className="lg:col-span-2 bg-white border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-200">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-800">
                    Health Dashboard
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Manage your appointments and health records
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="mb-6 bg-gray-100 p-1">
                  <TabsTrigger
                    value="appointments"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    My Appointments
                  </TabsTrigger>
                  <TabsTrigger
                    value="book"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Book Appointment
                  </TabsTrigger>
                  <TabsTrigger
                    value="records"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Health Records
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appointments">
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-gray-800 font-medium">
                        Upcoming Appointments
                      </h3>
                      <Badge className="bg-blue-500 hover:bg-blue-600">
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
                      // onComplete={handleBookingComplete}
                    />
                  ) : (
                    // Doctor Search with Enhanced UI
                    <div className="space-y-6">
                      <div className="bg-gray-100 bg-opacity-70 p-6 rounded-lg border border-gray-200 shadow-md">
                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                          <User className="h-5 w-5 mr-2 text-blue-500" />
                          Find a Specialist
                        </h3>

                        <div className="relative mb-6">
                          <input
                            type="text"
                            placeholder="Search by name, specialty or department..."
                            className="w-full bg-white border border-gray-300 rounded-md p-3 pl-10 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                          <div className="absolute left-3 top-3.5 text-gray-400">
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
                              className="bg-gray-200 hover:bg-blue-500 hover:text-white cursor-pointer transition-colors px-3 py-1.5 text-gray-700"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {doctors && doctors.length > 0 ? (
                          doctors.map((doctor) => (
                            <div
                              key={doctor.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-all shadow-md hover:shadow-blue-100"
                              onClick={() => handleDoctorSelect(doctor)}
                            >
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16 border-2 border-gray-200">
                                  <AvatarImage
                                    src={doctor.image || "/placeholder.svg"}
                                    alt={doctor.name}
                                  />
                                  <AvatarFallback className="bg-blue-500 text-white">
                                    {doctor.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="text-gray-800 font-medium">
                                    {doctor.name}
                                  </h4>
                                  <p className="text-gray-500 text-sm">
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
                                                : "text-gray-300"
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                          </svg>
                                        ))}
                                    </div>
                                    <span className="text-gray-500 text-xs ml-1">
                                      ({doctor.rating})
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Badge
                                    className={`
                                      ${
                                        doctor.availability === "Today"
                                          ? "bg-green-500"
                                          : doctor.availability === "Tomorrow"
                                          ? "bg-blue-500"
                                          : "bg-gray-500"
                                      }
                                    `}
                                  >
                                    {doctor.availability}
                                  </Badge>
                                </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  20+ years experience
                                </span>
                                <Button
                                  size="sm"
                                  className="bg-blue-500 hover:bg-blue-600"
                                >
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No doctors available.</p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="records">
                  <PatientPrescription />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4">
                <CardTitle className="text-lg flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Your Schedule
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {/* Header with month navigation */}
                <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                  <button
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={() =>
                      setCurrentMonth((prev) => subMonths(prev, 1))
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <h3 className="font-medium text-gray-800">
                    {format(currentMonth, "MMMM yyyy")}
                  </h3>
                  <button
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={() =>
                      setCurrentMonth((prev) => addMonths(prev, 1))
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  className="border-none bg-white"
                  modifiers={{
                    hasAppointment: getDayWithAppointments,
                  }}
                  modifiersClassNames={{
                    hasAppointment:
                      "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:bg-green-500 after:rounded-full",
                  }}
                  classNames={{
                    day_today: "bg-blue-100 text-blue-700 font-medium",
                    day_selected:
                      "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                    day: "h-9 w-9 p-0 font-normal hover:bg-gray-100 rounded-full flex items-center justify-center",
                    day_outside: "text-gray-300 opacity-50",
                    day_disabled: "text-gray-300",
                    day_hidden: "invisible",
                    table: "w-full border-collapse",
                    head_cell: "text-gray-500 font-normal text-xs",
                    cell: "p-0 relative focus-within:relative focus-within:z-20",
                  }}
                />

                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
                      {format(selectedDate as Date, "EEEE, MMM d")}
                    </h3>
                    <Badge className="bg-blue-500">
                      {isLoading ? "..." : selectedDayAppointments.length}{" "}
                      events
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {isLoading ? (
                      <div className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
                    ) : selectedDayAppointments.length > 0 ? (
                      selectedDayAppointments.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between text-sm p-3 border-l-4 border-blue-500 border rounded-md bg-white hover:bg-blue-50 shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-gray-800 font-medium">
                                {app.doctor.name}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {app.doctor.specialty}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                            <Clock className="mr-1 h-3 w-3" />
                            {app.timeSlot}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 p-6 text-center bg-gray-50 rounded-md border border-dashed border-gray-300 flex flex-col items-center">
                        <CalendarDays className="h-8 w-8 text-gray-400 mb-2" />
                        No appointments scheduled
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-2 text-blue-500"
                        >
                          + Add Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-200 p-3 bg-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
