// utils/mailer.js
import nodemailer from "nodemailer";

export const sendInviteEmail = async (to, groupName, inviterName) => {
  try {
    // ✅ Create reusable transporter object using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // your Gmail App Password
      },
    });

    // ✅ Prepare email content
    const mailOptions = {
      from: `"TravelSync" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🚗 You're invited to join ${groupName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2 style="color:#2563eb;">Hi there!</h2>
          <p><b>${inviterName}</b> has invited you to join their travel group <b>"${groupName}"</b>.</p>
          <p>Login to your TravelSync account to accept the invite and start planning your trip together!</p>
          <br/>
          <a href="http://localhost:5173/invites" style="background:#2563eb; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none;">
            View Invites
          </a>
          <br/><br/>
          <p>Happy travels, <br/>The TravelSync Team 🌍</p>
        </div>
      `,
    };

    // ✅ Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Invite email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};
