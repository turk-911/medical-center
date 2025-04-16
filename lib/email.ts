interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

import nodemailer from "nodemailer"

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: "huddleverify@gmail.com", 
      pass: "cbjyxuublcglegap", 
    },
  })

  try {
    const info = await transporter.sendMail({
      from: 'Health Center',
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