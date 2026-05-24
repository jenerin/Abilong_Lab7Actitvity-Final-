const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
    // 1. Create a transporter (Use your real SMTP credentials)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // 2. Log the email content to your Render Logs so you can find the link!
    console.log(`\n--- 📧 EMAIL PREVIEW ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    // This logs the HTML body. If your link is inside the HTML, you will see it here!
    console.log(`Body (HTML): ${html}`); 
    console.log(`--- 📧 END PREVIEW ---\n`);

    // 3. Send the email
    return await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
}

module.exports = sendEmail;
