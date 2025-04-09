// This is a mock email service for demonstration purposes
// In a real application, you would use a proper email service like Nodemailer or a third-party service

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

// emailService.ts
import nodemailer from "nodemailer"

export const sendEmail = async (options: EmailOptions) => {
  // Create a transporter using SMTP (can also use Gmail, Mailgun, etc.)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: "huddleverify@gmail.com", // replace with your SMTP username
      pass: "cbjyxuublcglegap", // replace with your SMTP password
    },
  })

  try {
    const info = await transporter.sendMail({
      from: '"Your Name" <your_email@example.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}