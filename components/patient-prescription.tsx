"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  Pill,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";

type Medicine = {
  id: number;
  name: string;
  description: string;
};

type PrescriptionMedicine = {
  id: number;
  medicineId: number;
  prescriptionId: number;
  medicine: Medicine;
};

type Prescription = {
  id: number;
  appointmentId: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  appointment: {
    date: string;
    timeSlot: string;
    doctor: {
      name: string;
      specialization: string;
    };
  };
  dosage: string;
  frequency: string;
  duration: string;
  description: string;
  PrescriptionMedicine: PrescriptionMedicine[];
};

export default function PatientPrescription() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);

          // After getting user data, fetch prescriptions
          if (data.user?.id) {
            await fetchPrescriptions(data.user.id);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchPrescriptions = async (userId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/prescription/user/${userId}`);

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      console.log(data);

      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setError("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  // Filter prescriptions based on active tab
  const filteredPrescriptions =
    activeTab === "all"
      ? prescriptions
      : prescriptions.filter((p) => {
          const prescriptionDate = new Date(p.appointment.date);
          const today = new Date();

          if (activeTab === "recent") {
            // Last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return prescriptionDate >= thirtyDaysAgo;
          }

          return false;
        });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gray-50 animate-pulse">
            <CardHeader className="h-20"></CardHeader>
            <CardContent className="h-40"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Error Loading Prescriptions
        </h3>
        <p className="text-red-600">{error}</p>
        <Button
          variant="outline"
          className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
          onClick={() => user?.id && fetchPrescriptions(user.id)}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          No Prescriptions Found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          You don't have any prescriptions yet. They will appear here after your
          doctor visits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              All Prescriptions
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              Recent (30 days)
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" className="text-gray-600">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <Card
                key={prescription.id}
                className="overflow-hidden border-gray-200 hover:border-blue-300 transition-colors"
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-800 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-500" />
                        Dr. {prescription.appointment.doctor.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {prescription.appointment.doctor.specialization}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-gray-600 text-sm mb-1">
                        <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                        {format(
                          new Date(prescription.appointment.date),
                          "MMM dd, yyyy"
                        )}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        {prescription.appointment.timeSlot}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  {/* <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Diagnosis
                    </h4>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-100">
                      {prescription.diagnosis}
                    </p>
                  </div> */}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Medications ({prescription.PrescriptionMedicine.length})
                    </h4>
                    <Accordion
                      type="single"
                      collapsible
                      className="border rounded-md"
                    >
                      {prescription.PrescriptionMedicine.map((med) => (
                        <AccordionItem key={med.id} value={`med-${med.id}`}>
                          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex items-center">
                              <Pill className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="font-medium">
                                {med.medicine.name}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Dosage</p>
                                <p className="font-medium">
                                  {prescription.dosage}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Frequency</p>
                                <p className="font-medium">
                                  {prescription.frequency}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Duration</p>
                                <p className="font-medium">
                                  {prescription.duration}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-gray-500 mb-1">Diagnosis</p>
                              <p className="text-gray-700">
                                {prescription.description}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  {prescription.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Doctor's Notes
                      </h4>
                      <p className="text-gray-700 italic bg-yellow-50 p-3 rounded-md border border-yellow-100">
                        {prescription.notes}
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between">
                  {/* <Button variant="ghost" size="sm" className="text-gray-600">
                     <FileText className="h-4 w-4 mr-2" />
                     View Full Details
                  </Button> */}
                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button> */}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <div className="space-y-4">
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => (
                <Card
                  key={prescription.id}
                  className="overflow-hidden border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-gray-800 flex items-center">
                          <User className="h-5 w-5 mr-2 text-blue-500" />
                          Dr. {prescription.appointment.doctor.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {prescription.appointment.doctor.specialization}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-600 text-sm mb-1">
                          <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                          {format(
                            new Date(prescription.appointment.date),
                            "MMM dd, yyyy"
                          )}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="h-4 w-4 mr-1 text-blue-500" />
                          {prescription.appointment.timeSlot}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Diagnosis
                      </h4>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-100">
                        {prescription.diagnosis}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Medications ({prescription.PrescriptionMedicine.length})
                      </h4>
                      <Accordion
                        type="single"
                        collapsible
                        className="border rounded-md"
                      >
                        {prescription.PrescriptionMedicine.map((med) => (
                          <AccordionItem key={med.id} value={`med-${med.id}`}>
                            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                              <div className="flex items-center">
                                <Pill className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="font-medium">
                                  {med.medicine.name}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-500 mb-1">Dosage</p>
                                  <p className="font-medium">{med.dosage}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">
                                    Frequency
                                  </p>
                                  <p className="font-medium">{med.frequency}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Duration</p>
                                  <p className="font-medium">{med.duration}</p>
                                </div>
                              </div>
                              {med.instructions && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <p className="text-gray-500 mb-1">
                                    Instructions
                                  </p>
                                  <p className="text-gray-700">
                                    {med.instructions}
                                  </p>
                                </div>
                              )}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-gray-500 mb-1">
                                  Description
                                </p>
                                <p className="text-gray-700">
                                  {med.medicine.description}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>

                    {prescription.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Doctor's Notes
                        </h4>
                        <p className="text-gray-700 italic bg-yellow-50 p-3 rounded-md border border-yellow-100">
                          {prescription.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No Recent Prescriptions
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  You don't have any prescriptions from the last 30 days.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
