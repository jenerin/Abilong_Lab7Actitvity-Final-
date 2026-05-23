const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
    // Create the transport layer using port 587 with secure set to false
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // REQUIRED for port 587. TLS is handled automatically.
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Configure your mail parameters
    const mailOptions = {
        // ⚠️ CRITICAL CHANGE: Change this string to your real Brevo profile registration email!
        from: 'your-actual-brevo-login-email@gmail.com', 
        to: to,
        subject: subject,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📩 Email sent successfully to ${to}. Response: ${info.response}`);
    } catch (error) {
        // Log the exact error to the Render terminal console without crashing the database registration pipeline
        console.error('❌ Brevo SMTP Email failed to send:', error.message);
    }
}

module.exports = sendEmail;
