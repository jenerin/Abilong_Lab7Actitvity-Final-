const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
    // Create a transporter using your Render SMTP environment variables
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true, // true for port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.SMTP_USER, // Uses your authorized Brevo login email as the sender
        to: to,
        subject: subject,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📩 Email sent successfully to ${to}. Response: ${info.response}`);
    } catch (error) {
        console.error('❌ Brevo SMTP Email failed to send:', error.message);
        // Do not throw an error here so your backend registration doesn't crash if email limits are reached
    }
}

module.exports = sendEmail;
