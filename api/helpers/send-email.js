const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
    let transporter;

    try {
        // 1. Setup the Transport Layer safely
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            // Auto-generate Ethereal test account for development safely
            try {
                console.log('📧 Creating Ethereal test account...');
                const testAccount = await nodemailer.createTestAccount();
                console.log('📧 Ethereal account created:', testAccount.user);
                
                transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
            } catch (etherealErr) {
                console.error('⚠️ Could not connect to Ethereal account generator:', etherealErr.message);
                // Return early so the code doesn't try to send via an undefined transporter
                return; 
            }
        }

        // 2. Dispatch the Mail with a localized try/catch block
        if (transporter) {
            try {
                console.log(`📧 Attempting to dispatch email to: ${to}...`);
                const info = await transporter.sendMail({
                    // ⚠️ FIXED: Added your verified Brevo registration email here
                    from: process.env.EMAIL_FROM || '"System Admin" <jennelynabilong22@gmail.com>',
                    to,
                    subject,
                    html
                });

                // Log preview URL for Ethereal (dev only)
                const previewUrl = nodemailer.getTestMessageUrl(info);
                console.log(`\n========================================`);
                console.log(`📧 Email sent successfully to: ${to}`);
                console.log(`📧 Subject: ${subject}`);
                if (previewUrl) {
                    console.log(`📧 Preview URL: ${previewUrl}`);
                }
                console.log(`========================================\n`);
            } catch (mailSendErr) {
                console.error('❌ Email dispatch failed (Network/Timeout/Authentication):', mailSendErr.message);
            }
        }
        
    } catch (err) {
        console.error('❌ Global email helper malfunction:', err.message);
    }
}

module.exports = sendEmail;