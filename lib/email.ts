

import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, 
    auth: {
      user: "huddleverify@gmail.com", 
      pass: "cbjyxuublcglegap",
    },
  })

  try {
    console.log("Preparing to send email to:", options.to)

    const info = await transporter.sendMail({
      from: `"Health Center" <${process.env.SMTP_USER}>`, // must be valid for Gmail
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