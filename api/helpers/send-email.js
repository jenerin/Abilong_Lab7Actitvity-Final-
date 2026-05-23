const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // false for port 587
        auth: {
            user: process.env.SMTP_USER, 
            pass: process.env.SMTP_PASS  
        }
    });

    await transporter.sendMail({
        from: process.env.SMTP_USER, // Forces sender email to match your authenticated Brevo account
        to: to,
        subject: subject,
        html: html
    });
}

module.exports = sendEmail;
