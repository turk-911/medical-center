"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "lucide-react";

function StarryBackground() {
  useEffect(() => {
    const createStars = () => {
      const stars = document.getElementById("stars");
      if (!stars) return;

      stars.innerHTML = "";
      const count = 150;

      for (let i = 0; i < count; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${3 + Math.random() * 7}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        stars.appendChild(star);
      }
    };

    createStars();
  }, []);

  return (
    <div
      id="stars-container"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <div id="stars" className="absolute inset-0" />
    </div>
  );
}

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    role: "resident",
    email: "",
    name: "",
    password: "",
    address: "",
    phone: "",
    specialty: "",
    dept: "",
    section: "",
    rollNo: "",
    course: "",
    dateOfBirth: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      alert("Registration successful!");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 text-gray-800 relative px-4 py-12">
      <style jsx global>{`
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background-color: #6366f1;
          border-radius: 50%;
          opacity: 0;
          animation-name: twinkle;
          animation-iteration-count: infinite;
        }

        @keyframes twinkle {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>

      <StarryBackground />

      <div className="w-full max-w-2xl p-8 rounded-xl shadow-lg bg-white border border-gray-200 backdrop-blur-sm z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse mr-1"></div>
          <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse mr-1"></div>
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          User Registration
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Create your account to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700">Select User Type</Label>
            <div className="p-4 rounded-lg bg-gray-50">
              <RadioGroup
                defaultValue="resident"
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                {["resident", "faculty", "staff", "student"].map((role) => (
                  <div
                    key={role}
                    className="flex items-center space-x-2 bg-white p-2 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <RadioGroupItem
                      value={role}
                      id={role}
                      className="text-indigo-600"
                    />
                    <Label
                      htmlFor={role}
                      className="text-gray-700 capitalize cursor-pointer"
                    >
                      {role}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Fields for Resident */}
          {formData.role === "resident" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-700">
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="bg-gray-50 border-gray-200 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Fields for Faculty */}
          {formData.role === "faculty" && (
            <div className="space-y-2">
              <Label htmlFor="dept" className="text-gray-700">
                Department
              </Label>
              <Input
                id="dept"
                name="dept"
                placeholder="Enter your department"
                value={formData.dept}
                onChange={handleChange}
                required
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Fields for Staff */}
          {formData.role === "staff" && (
            <div className="space-y-2">
              <Label htmlFor="section" className="text-gray-700">
                Section
              </Label>
              <Input
                id="section"
                name="section"
                placeholder="Enter your section"
                value={formData.section}
                onChange={handleChange}
                required
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Fields for Student */}
          {formData.role === "student" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rollNo" className="text-gray-700">
                    Roll No.
                  </Label>
                  <Input
                    id="rollNo"
                    name="rollNo"
                    placeholder="Enter your roll number"
                    value={formData.rollNo}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-gray-700">
                    Course
                  </Label>
                  <Input
                    id="course"
                    name="course"
                    placeholder="Enter your course"
                    value={formData.course}
                    onChange={handleChange}
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full mt-6">
            Register
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
