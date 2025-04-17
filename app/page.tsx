"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  ClipboardList,
  User,
  UserCog,
  Clock,
  MapPin,
  Phone,
  ChevronDown,
} from "lucide-react";
import { StarsBackground } from "@/components/ui/stars-background";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { doctors, facilities } from "@/utils/data";

const ScrollReveal = ({
  children,
  className,
}: {
  children: any;
  className: any;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Counter animation component
const CounterAnimation = ({ target, title, symbol = "" }: any) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = (timestamp: any) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, [target]);

  return (
    <div ref={countRef} className="text-center p-6">
      <div className="text-4xl font-bold text-blue-400 mb-2">
        {count}
        {symbol}
      </div>
      <p className="text-gray-300">{title}</p>
    </div>
  );
};

export default function Home() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gray-950">
      {/* Star Background */}
      <StarsBackground className="z-0" />

      {/* Navigation with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo Area */}
            <div className="flex items-center">
              <div className="mr-3">
                <img
                  src="/logo.gif"
                  alt="Medical College Logo"
                  className="h-10 w-auto"
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Health Center</h1>
                <p className="text-blue-400 text-xs">
                  Indian Institute of Information Technology, Allahabad
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              {["Home", "About", "Services", "Doctors", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-gray-300 hover:text-white hover:underline underline-offset-4 decoration-blue-500 transition-all duration-200"
                  >
                    {item}
                  </a>
                )
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" className="text-gray-300">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-screen pt-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Large College Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900/70 p-4 rounded-xl shadow-lg shadow-blue-500/10 backdrop-blur-sm">
              <img
                src="/logo.gif"
                alt="College of Medicine Logo"
                className="h-24 w-auto"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Health Center Doctor's Appointment
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
              Book appointments with doctors, manage prescriptions, and check
              medicine availability.
            </p>
          </div>

          {/* Authentication buttons with improved alignment and styling */}
          <div className="flex justify-center space-x-4 w-full max-w-md mx-auto">
            <Link href="/login" className="w-full max-w-xs">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30"
                size="lg"
              >
                <User className="mr-2 h-5 w-5" />
                Login
              </Button>
            </Link>
            <Link href="/register" className="w-full max-w-xs">
              <Button
                variant="outline"
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/20"
                size="lg"
              >
                <UserCog className="mr-2 h-5 w-5" />
                Register
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="h-8 w-8 text-gray-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Affiliated College Section */}
      <div className="bg-gray-900 py-16 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/3 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Affiliated with{" "}
                  <span className="text-blue-400">United Medicity</span>
                </h2>
                <p className="text-gray-300">
                  Our Health Center is proudly affiliated with the prestigious
                  United Medicity, ensuring the highest standards of healthcare
                  education and practice.
                </p>
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                  Learn About Our College
                </Button>
              </div>

              <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6">
                {facilities.map((facility, i) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <img
                      src={facility.image}
                      alt={facility.title}
                      className="w-full h-32 object-cover rounded"
                    />
                    <h3 className="text-white font-medium mt-3">
                      {facility.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {facility.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="bg-gray-950 py-20 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Our Services
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl mx-auto">
            <ScrollReveal>
              <Card className="bg-gray-900 border-gray-800 text-white overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <CalendarDays className="mr-2 h-5 w-5 text-blue-400" />
                    Book Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Schedule appointments with your preferred doctors at your
                    convenience.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal>
              <Card className="bg-gray-900 border-gray-800 text-white overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <ClipboardList className="mr-2 h-5 w-5 text-blue-400" />
                    Manage Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Access and manage your prescriptions from a single
                    dashboard.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal>
              <Card className="bg-gray-900 border-gray-800 text-white overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <User className="mr-2 h-5 w-5 text-blue-400" />
                    Patient Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Access your complete medical history and test results
                    online.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal>
              <Card className="bg-gray-900 border-gray-800 text-white overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-medium">
                    <UserCog className="mr-2 h-5 w-5 text-blue-400" />
                    Doctor Consultations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Connect with specialists through virtual consultations.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Health Center Image Section */}
      <div className="bg-gray-900 py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <ScrollReveal className="lg:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-xl shadow-blue-500/10">
                <img
                  src="logo.gif"
                  alt="Modern Health Center Facility"
                  className="w-auto h-auto object-cover"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl font-bold text-white">
                State-of-the-Art Medical Facility
              </h2>
              <p className="text-gray-300">
                Our Health Center is equipped with cutting-edge technology and
                modern facilities to provide you with the best healthcare
                experience. Our team of expert doctors and medical professionals
                are committed to delivering high-quality care in a comfortable
                environment.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="bg-blue-500/20 p-3 rounded-full mr-3">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">24/7 Service</h3>
                    <p className="text-gray-400 text-sm">
                      Available round the clock
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-500/20 p-3 rounded-full mr-3">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      Multiple Locations
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Convenient access nationwide
                    </p>
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105">
                Learn More About Our Facility
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-950 py-20 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              Our Impact
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <CounterAnimation target={24} title="Hour Service" />
            <CounterAnimation target={50} symbol="+" title="Specialists" />
            <CounterAnimation
              target={10000}
              symbol="+"
              title="Patients Served"
            />
            <CounterAnimation
              target={98}
              symbol="%"
              title="Satisfaction Rate"
            />
          </div>
        </div>
      </div>

      {/* Doctor Team Preview */}
      <div className="bg-gray-900 py-24 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center text-white mb-4">
              Meet Our Specialists
            </h2>
            <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
              Our team of experienced doctors are ready to provide you with the
              best medical care
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {doctors.map((doctor, i) => (
              <ScrollReveal key={i}>
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={doctor.image}
                      alt={`${doctor.name} - ${doctor.specialization}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-white font-medium text-lg">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-400">{doctor.specialization}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="text-center mt-12">
            <Button className="mx-auto bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300">
              View All Doctors
            </Button>
          </ScrollReveal>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-950 py-24 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-center text-white mb-16">
              What Our Patients Say
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <ScrollReveal key={i}>
                <Card className="bg-gray-900 border-gray-800 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-300 italic mb-6">
                      "The appointment system is so easy to use and saved me so
                      much time. The doctors are professional and caring."
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img
                          src="/api/placeholder/40/40"
                          alt="Patient"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Patient Name</h4>
                        <p className="text-sm text-gray-400">Patient</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Contact & Appointment CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 py-16 relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Book Your Appointment?
              </h2>
              <p className="text-gray-200 mb-8">
                Take the first step towards better healthcare today. Register
                and book your appointment in minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  className="bg-white text-blue-900 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-medium"
                  size="lg"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Book Appointment
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Footer with College Branding */}
      <footer className="bg-gray-950 text-gray-400 py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-gray-800">
            <div className="flex items-center mb-6 md:mb-0">
              <img
                src="/api/placeholder/80/80"
                alt="College of Medicine Logo"
                className="h-16 w-auto mr-4"
              />
              <div>
                <h3 className="text-white text-xl font-bold">Health Center</h3>
                <p className="text-blue-400">College of Medicine</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {["Facebook", "Twitter", "Instagram", "LinkedIn", "YouTube"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {social}
                  </a>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-medium mb-4">About Us</h3>
              <p className="mb-4">
                Providing quality healthcare services for over 20 years,
                affiliated with the prestigious College of Medicine.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons */}
                {["facebook", "twitter", "instagram", "linkedin"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                        </svg>
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-medium mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {["Home", "About Us", "Services", "Doctors", "Contact"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="hover:text-blue-400 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-medium mb-4">Services</h3>
              <ul className="space-y-2">
                {[
                  "Primary Care",
                  "Specialist Consultations",
                  "Diagnostic Services",
                  "Telemedicine",
                  "Emergency Care",
                ].map((service) => (
                  <li key={service}>
                    <a
                      href="#"
                      className="hover:text-blue-400 transition-colors"
                    >
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-medium mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                  <span>
                    123 Health Center Drive, Healthcare City, HC 12345
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-400 mr-2" />
                  <span>(123) 456-7890</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-blue-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>info@medicalcenter.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>
              &copy; {new Date().getFullYear()} Health Center - College of
              Medicine. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
