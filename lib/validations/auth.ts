import * as z from "zod"

export const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    specialty: z.string().optional(),
    dept: z.string().optional(),
    section: z.string().optional(),
    rollNo: z.string().optional(),
    course: z.string().optional(),
})