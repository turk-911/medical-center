import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER, // Use env variable
      pass: process.env.SMTP_PASS, // Use env variable
    },
  })

  try {
    console.log("Preparing to send email to:", options.to)
    const mailOptions = {
      from: `"Health Center" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }

    const emailResponse = await transporter.sendMail(mailOptions)
    console.log("Email sent:", emailResponse.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}