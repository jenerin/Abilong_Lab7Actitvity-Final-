const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
    // This is the standard SMTP configuration you used on Thursday
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10), // Back to standard 587
        secure: false, // false for port 587
        auth: {
            user: process.env.SMTP_USER, // Your Brevo SMTP email user
            pass: process.env.SMTP_PASS  // Your Brevo master key
        },
        tls: {
            rejectUnauthorized: false // Bypasses local/cloud certificate blocks
        }
    });

    const mailOptions = {
        from: process.env.SMTP_USER, // Brevo requires this to match your authorized user
        to: to,
        subject: subject,
        html: html
    };

    try {
        console.log(`⏳ [Nodemailer] Attempting to send SMTP mail to ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`📩 Email sent successfully to ${to}. Response: ${info.response}`);
    } catch (error) {
        console.error('❌ Brevo SMTP Email failed to send:', error.message);
    }
}

module.exports = sendEmail;
