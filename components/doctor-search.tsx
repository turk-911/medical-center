"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Doctor {
  id: number
  name: string
  specialization: string
  qualification: string
  rating: number
  availableDays: string[]
}

interface DoctorSearchProps {
  onDoctorSelect: (doctor: Doctor) => void
}

export default function DoctorSearch({ onDoctorSelect }: DoctorSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch("/api/doctors");
        // const data = await response.json();
        // setDoctors(data.doctors);

        // Mock data for demonstration
        setTimeout(() => {
          setDoctors([
            {
              id: 1,
              name: "Dr. Sarah Johnson",
              specialization: "General Medicine",
              qualification: "MD, Internal Medicine",
              rating: 4.8,
              availableDays: ["Monday", "Wednesday", "Friday"],
            },
            {
              id: 2,
              name: "Dr. Michael Chen",
              specialization: "E.N.T",
              qualification: "MD, Otolaryngology",
              rating: 4.7,
              availableDays: ["Tuesday", "Thursday", "Saturday"],
            },
            {
              id: 3,
              name: "Dr. Emily Rodriguez",
              specialization: "Eye Specialist",
              qualification: "MD, Ophthalmology",
              rating: 4.9,
              availableDays: ["Monday", "Tuesday", "Thursday"],
            },
            {
              id: 4,
              name: "Dr. James Wilson",
              specialization: "Cardiology",
              qualification: "MD, Cardiology",
              rating: 4.6,
              availableDays: ["Wednesday", "Friday"],
            },
            {
              id: 5,
              name: "Dr. Lisa Patel",
              specialization: "Dermatology",
              qualification: "MD, Dermatology",
              rating: 4.5,
              availableDays: ["Monday", "Thursday", "Friday"],
            },
          ])
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = specialization === "" || doctor.specialization === specialization
    return matchesSearch && matchesSpecialization
  })

  return (
    <div className="space-y-6">
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
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              <SelectItem value="General Medicine">General Medicine</SelectItem>
              <SelectItem value="E.N.T">E.N.T</SelectItem>
              <SelectItem value="Eye Specialist">Eye Specialist</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Dermatology">Dermatology</SelectItem>
              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              <SelectItem value="Psychiatry">Psychiatry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Available Doctors</h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No doctors found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{doctor.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">{doctor.rating}</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        {doctor.specialization}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{doctor.qualification}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        <Calendar className="h-3 w-3 mr-1 mt-1" />
                        {doctor.availableDays.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                      </div>

                      <Button size="sm" onClick={() => onDoctorSelect(doctor)}>
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
