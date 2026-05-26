const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {

    try {

        const transporter = nodemailer.createTransport({

            host: process.env.SMTP_HOST,

            port: Number(process.env.SMTP_PORT),

            secure: false,

            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },

            tls: {
                rejectUnauthorized: false
            },

            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000

        });

        console.log('📧 Connecting to SMTP...');

        await transporter.verify();

        console.log('✅ SMTP Connected');

        const info = await transporter.sendMail({

            from: process.env.EMAIL_FROM,

            to,

            subject,

            html

        });

        console.log('✅ EMAIL SENT');
        console.log(info.messageId);

        return true;

    } catch (error) {

        console.error('❌ EMAIL ERROR');
        console.error(error);

        throw error;
    }
}

module.exports = sendEmail;
