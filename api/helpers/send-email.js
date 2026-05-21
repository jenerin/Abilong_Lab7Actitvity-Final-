const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
    try {
        console.log('📧 Creating Ethereal presentation test account...');
        // Automatically creates a test inbox instantly
        const testAccount = await nodemailer.createTestAccount();
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        console.log(`📧 Attempting to dispatch email to: ${to}...`);
        const info = await transporter.sendMail({
            from: '"System Admin" <noreply@ipt2026.com>',
            to,
            subject,
            html
        });

        // 🎯 CRITICAL FOR YOUR DEMO: This generates a clickable link to view the email!
        const previewUrl = nodemailer.getTestMessageUrl(info);
        
        console.log(`\n========================================`);
        console.log(`📧 Email sent successfully to: ${to}`);
        console.log(`📧 PRESENTATION PREVIEW LINK: ${previewUrl}`);
        console.log(`========================================\n`);
        
    } catch (err) {
        console.error('❌ Email helper malfunction:', err.message);
    }
}

module.exports = sendEmail;