"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Clock,
  User,
  Pill,
  CalendarIcon,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Settings,
  Bell,
  PlusCircle,
  FileText,
  Activity,
  LogOut,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PrescribeForm from "@/components/prescription-form";

export type Medicine = {
  expiryDate: React.ReactNode;
  id: number;
  name: string;
  quantity: number;
  unit: string;
  addedOn: string;
  updatedOn: string;
};

interface Appointment {
  patientName: React.ReactNode;
  time: React.ReactNode;
  id: number;
  doctorId: number;
  userId: number;
  date: string;
  timeSlot: string;
  status: "upcoming" | "completed" | string;
  description?: string;
  doctor: {
    name: string;
    specialty: string;
  };
}

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    substituteDoctor: "",
  });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isMedicinesLoading, setIsMedicinesLoading] = useState(true);
  const [medicinesError, setMedicinesError] = useState(null);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handlePrescribeClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const [clientDateInfo, setClientDateInfo] = useState<{
    label: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (date) {
      const day = date.getDay();
      setClientDateInfo({
        label: date.toLocaleDateString(),
        status: day === 1 || day === 3 || day === 5 ? "Working day" : "Off day",
      });
    }
  }, [date]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    // fetchAppointments();
    fetchMedicines();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (medicines.length > 0) {
      setFilteredMedicines(
        medicines.filter((med) =>
          med.name.toLowerCase().includes(medicineSearch.toLowerCase())
        )
      );
    }
  }, [medicineSearch, medicines]);

  console.log(user);

  useEffect(() => {
    if (user?.role === "doctor" && user?.Doctor?.id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setIsAppointmentsLoading(true);
    setAppointmentsError(null);

    try {
      const response = await fetch(`/api/appointments/${user.Doctor.id}`);
      console.log("Fetching appointments for doctor ID:", user.Doctor.id);

      if (!response.ok) {
        throw new Error(`Error fetching appointments: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
      setAppointments(data.appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointmentsError(error.message);
    } finally {
      setIsAppointmentsLoading(false);
    }
  };

  const fetchMedicines = async () => {
    setIsMedicinesLoading(true);
    setMedicinesError(null);

    try {
      const response = await fetch("/api/medicine");

      if (!response.ok) {
        throw new Error(`Error fetching medicines: ${response.statusText}`);
      }

      const data = await response.json();
      setMedicines(data);
      setFilteredMedicines(data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      setMedicinesError(error.message);
    } finally {
      setIsMedicinesLoading(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLeave(true);

    try {
      const response = await fetch("/api/doctor/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to submit leave request: ${response.statusText}`
        );
      }

      alert("Leave request submitted successfully");
      setShowLeaveForm(false);
      setLeaveData({
        startDate: "",
        endDate: "",
        reason: "",
        substituteDoctor: "",
      });
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert(`Failed to submit leave request: ${error.message}`);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const handleMedicineSearch = (e) => {
    setMedicineSearch(e.target.value);
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

  // Mock data for doctors
  const doctors = [
    { id: 1, name: "Dr. James Wilson" },
    { id: 2, name: "Dr. Emily Rodriguez" },
    { id: 3, name: "Dr. Michael Chen" },
    { id: 4, name: "Dr. Lisa Patel" },
  ];

  const renderAppointmentList = (status: any) => {
    if (isAppointmentsLoading) {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <Card key={index} className="border-gray-200 shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ));
    }

    if (appointmentsError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading appointments: {appointmentsError}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={fetchAppointments}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    const filteredAppointments =
      status === "all"
        ? appointments
        : appointments.filter((app) => app.status === status);

    console.log(filteredAppointments);

    if (filteredAppointments.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300 flex flex-col items-center">
          <CalendarDays className="h-8 w-8 text-gray-400 mb-2" />
          No {status === "all" ? "" : status} appointments found
          <Button variant="link" size="sm" className="mt-2 text-blue-500">
            + Add Appointment
          </Button>
        </div>
      );
    }

    return filteredAppointments.map((appointment) => (
      <>
        <Card
          key={appointment.id}
          className="border-gray-200 shadow-sm mb-4 hover:shadow-md transition-all"
        >
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-800">
                    {appointment.user.name}
                  </h3>
                </div>
                <Badge
                  variant={
                    appointment.status === "upcoming" ? "default" : "outline"
                  }
                  className={
                    appointment.status === "upcoming"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : ""
                  }
                >
                  {appointment.time}
                </Badge>
              </div>

              <div className="text-sm text-gray-500">
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

              <div className="text-sm text-gray-700">
                <span className="font-medium">Reason: </span>
                {appointment.description}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  View Details
                </Button>
                {appointment.status === "upcoming" && (
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handlePrescribeClick(appointment)}
                  >
                    Prescribe
                  </Button>
                )}
                {showForm && selectedAppointment && (
                  <PrescribeForm
                    appointmentId={appointment.id}
                    onClose={() => setShowForm(false)}
                    medicineList={medicines}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 bg-cover bg-fixed">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-blue-500">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-blue-500 text-white">
                DR
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Doctor Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, Dr. {user ? user.name : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                3
              </span>
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              onClick={() => {
                fetchAppointments();
                fetchMedicines();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-800">
                      Appointments
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Manage your patient appointments
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
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="mb-6 bg-gray-100 p-1">
                    <TabsTrigger
                      value="upcoming"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Upcoming
                    </TabsTrigger>
                    <TabsTrigger
                      value="completed"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      Completed
                    </TabsTrigger>
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      All
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-gray-800 font-medium flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
                          Upcoming Appointments
                        </h3>
                        <Badge className="bg-blue-500">
                          {isAppointmentsLoading
                            ? "..."
                            : appointments.filter(
                                (app) => app.status === "upcoming"
                              ).length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {renderAppointmentList("upcoming")}
                    </div>
                  </TabsContent>

                  <TabsContent value="completed">
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-gray-800 font-medium flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-blue-500" />
                          Completed Appointments
                        </h3>
                        <Badge className="bg-blue-500">
                          {isAppointmentsLoading
                            ? "..."
                            : appointments.filter(
                                (app) => app.status === "completed"
                              ).length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {renderAppointmentList("completed")}
                    </div>
                  </TabsContent>

                  <TabsContent value="all">
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-gray-800 font-medium flex items-center">
                          <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
                          All Appointments
                        </h3>
                        <Badge className="bg-blue-500">
                          {isAppointmentsLoading ? "..." : appointments.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {renderAppointmentList("all")}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-800">
                      Medicine Inventory
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Check availability of medicines in the hospital
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search medicines..."
                        className="pl-8 border-gray-300"
                        value={medicineSearch}
                        onChange={handleMedicineSearch}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setMedicineSearch("")}
                      disabled={medicineSearch === ""}
                      className="border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Clear
                    </Button>
                  </div>

                  {isMedicinesLoading ? (
                    <div className="border rounded-md p-8 flex justify-center">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="mt-2 text-sm text-gray-500">
                          Loading medicines...
                        </p>
                      </div>
                    </div>
                  ) : medicinesError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Error loading medicines: {medicinesError}
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={fetchMedicines}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="border border-gray-200 rounded-md overflow-auto max-h-96 shadow-sm">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr className="border-b border-gray-200">
                            <th className="text-left p-3 text-gray-700 font-medium">
                              Medicine Name
                            </th>
                            <th className="text-left p-3 text-gray-700 font-medium">
                              Quantity
                            </th>
                            <th className="text-left p-3 text-gray-700 font-medium">
                              Expiry Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMedicines.length > 0 ? (
                            filteredMedicines.map((medicine) => (
                              <tr
                                key={medicine.id}
                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                              >
                                <td className="p-3 text-gray-800">
                                  {medicine.name}
                                </td>
                                <td className="p-3">
                                  <Badge
                                    variant={
                                      medicine.quantity < 100
                                        ? "destructive"
                                        : medicine.quantity < 150
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className={
                                      medicine.quantity < 100
                                        ? "bg-red-500"
                                        : medicine.quantity < 150
                                        ? "bg-blue-500"
                                        : ""
                                    }
                                  >
                                    {medicine.quantity}
                                  </Badge>
                                </td>
                                <td className="p-3 text-gray-800">
                                  {medicine.expiryDate}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="p-4 text-center text-gray-500"
                              >
                                No medicines found matching your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4">
                <CardTitle className="text-lg flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Your Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-200">
                  <button
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={() =>
                      setDate(
                        new Date(date.getFullYear(), date.getMonth() - 1, 1)
                      )
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
                    {date.toLocaleDateString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={() =>
                      setDate(
                        new Date(date.getFullYear(), date.getMonth() + 1, 1)
                      )
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
                  selected={date}
                  onSelect={setDate}
                  className="border-none bg-white"
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
                  <h3 className="font-medium mb-3 text-gray-800">
                    Your Schedule:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Monday</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        9:00 AM - 5:00 PM
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Wednesday</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        9:00 AM - 5:00 PM
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Friday</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        9:00 AM - 5:00 PM
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-center">
                    {clientDateInfo && (
                      <p className="text-gray-600">
                        Selected date: {clientDateInfo.label}
                        <span
                          className={`block mt-1 ${
                            clientDateInfo.status === "Working day"
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {clientDateInfo.status}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
                  Apply for Leave
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {showLeaveForm ? (
                  <form onSubmit={handleLeaveSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-gray-700">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={leaveData.startDate}
                        onChange={(e) =>
                          setLeaveData({
                            ...leaveData,
                            startDate: e.target.value,
                          })
                        }
                        className="border-gray-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-gray-700">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={leaveData.endDate}
                        onChange={(e) =>
                          setLeaveData({
                            ...leaveData,
                            endDate: e.target.value,
                          })
                        }
                        className="border-gray-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-gray-700">
                        Reason
                      </Label>
                      <Input
                        id="reason"
                        value={leaveData.reason}
                        onChange={(e) =>
                          setLeaveData({ ...leaveData, reason: e.target.value })
                        }
                        className="border-gray-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="substituteDoctor"
                        className="text-gray-700"
                      >
                        Substitute Doctor
                      </Label>
                      <Select
                        value={leaveData.substituteDoctor}
                        onValueChange={(value) =>
                          setLeaveData({
                            ...leaveData,
                            substituteDoctor: value,
                          })
                        }
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem
                              key={doctor.id}
                              value={doctor.id.toString()}
                            >
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLeaveForm(false)}
                        disabled={isSubmittingLeave}
                        className="border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmittingLeave}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {isSubmittingLeave ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setShowLeaveForm(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Apply for Leave
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        Today's Appointments
                      </span>
                    </div>
                    <Badge className="bg-blue-500">
                      {isAppointmentsLoading
                        ? "..."
                        : appointments.filter(
                            (a) =>
                              new Date(a.date).toDateString() ===
                              new Date().toDateString()
                          ).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-full">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        Total Patients
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      128
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Pill className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        Prescriptions
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      96
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t border-gray-200 p-4 bg-gray-50">
                <Button
                  variant="link"
                  className="ml-auto p-0 h-auto text-xs text-blue-500"
                >
                  View Detailed Reports
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
