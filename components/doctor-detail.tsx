"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays } from "lucide-react";

interface DoctorDetailProps {
  doctorId: number;
}

interface DoctorAnalytics {
  id: number;
  name: string;
  specialty: string;
  _count: {
    Appointment: number;
  };
  Appointment: {
    id: number;
    date: string;
    status: string;
    user: {
      name: string;
      email: string;
    };
  }[];
}

export function DoctorDetail({ doctorId }: DoctorDetailProps) {
  const [doctor, setDoctor] = useState<DoctorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics/${doctorId}`);
        if (!response.ok) {
          throw new Error(`Error fetching doctor data: ${response.statusText}`);
        }
        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-slate-500">Loading doctor details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!doctor) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-slate-500">No doctor details available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor Details</CardTitle>
        <CardDescription>
          Detailed information about {doctor.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src="/placeholder.svg?height=64&width=64"
                alt={doctor.name}
              />
              <AvatarFallback className="bg-cyan-100 text-cyan-700 text-lg">
                {doctor.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {doctor.name}
              </h3>
              <p className="text-slate-600">{doctor.specialty}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="bg-cyan-50 text-cyan-700 border-cyan-200"
                >
                  {doctor._count.Appointment} Appointments
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              Recent Appointments
            </h4>
            <div className="space-y-3">
              {doctor.Appointment.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start gap-3 p-3 rounded-md bg-slate-50"
                >
                  <div className="mt-1">
                    <CalendarDays className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {appointment.user.name}
                      </span>
                      <Badge
                        variant={
                          appointment.status.toLowerCase() === "completed"
                            ? "secondary"
                            : appointment.status.toLowerCase() === "scheduled"
                            ? "success"
                            : "destructive"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {appointment.user.email}
                    </p>
                  </div>
                </div>
              ))}

              {doctor.Appointment.length === 0 && (
                <div className="flex items-center justify-center h-20 bg-slate-50 rounded-md">
                  <p className="text-slate-500">No recent appointments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
