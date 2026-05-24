const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: 465, // Switch from 587 to 465
    secure: true, // Must be TRUE for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    connectionTimeout: parseInt(process.env.SMTP_TIMEOUT || '10000', 10), // Stop the 5-minute freeze
    tls: {
        rejectUnauthorized: false
    }
});

    // Configure your mail parameters
    const mailOptions = {
        // 🚀 AUTOMATED FIX: Dynamically uses your authenticated Brevo user email
        from: process.env.SMTP_USER, 
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
