const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html, from = process.env.SMTP_USER }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // e.g., ac07ff001@smtp-brevo.com
            pass: process.env.SMTP_PASS  // Your long master Brevo key
        }
    });

    await transporter.sendMail({ from, to, subject, html });
}

module.exports = sendEmail;