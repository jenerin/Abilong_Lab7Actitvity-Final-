const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // 👈 MUST be false for port 587! TLS will handle encryption automatically.
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
