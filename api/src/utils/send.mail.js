import nodemailer from 'nodemailer';
import ApiError from "./error.js";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendEmail = async (to, subject, text, html = null) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("Email configuration is missing, skipping actual send logic.");
        return;
    }

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html || text
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw ApiError.internal("Failed to send email");
    }
};

export default sendEmail;
