export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export type Role = "resident" | "doctor" | "faculty" | "staff" | "student" | "admin";

export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    userId: number;
    availability: string;
    status: string;
    image: string;
    rating: number;
    user?: User;
    Availability?: Availability[];
    Appointment?: Appointment[];
    _count?: {
        Appointment: number;
    };
}

export interface Availability {
    id: number;
    doctorId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
}

export interface Appointment {
    id: number;
    date: string; // ISO string
    timeSlot: string;
    status: string;
    description?: string;
    doctorId: number;
    userId: number;
    doctor: Doctor;
    user: User;
    prescription?: Prescription[];
}

export interface Medicine {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    addedOn: string;   // ISO string
    updatedOn: string; // ISO string
}

export interface PrescriptionMedicine {
    id: number;
    prescriptionId: number;
    medicineId: number;
    quantity: number;
    prescription: Prescription;
    medicine: Medicine;
}

export interface Prescription {
    id: number;
    appointmentId: number;
    description?: string;
    dosage?: string;
    duration?: string;
    frequency?: string;
    appointment: Appointment;
    PrescriptionMedicine: PrescriptionMedicine[];
}

export interface Leave {
    id: number;
    fromDate: string; // ISO string
    toDate: string;   // ISO string
    doctorId: number;
    substituteId: number;
    status: string;
    doctor: Doctor;
    substitute: Doctor;
    reason?: string;
}

export interface DashboardAnalytics {
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