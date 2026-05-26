const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {

    try {

        // CREATE SMTP TRANSPORT
        const transporter = nodemailer.createTransport({

            host: process.env.SMTP_HOST,

            port: Number(process.env.SMTP_PORT),

            secure: Number(process.env.SMTP_PORT) === 465,

            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },

            tls: {
                rejectUnauthorized: false
            }

        });

        // VERIFY SMTP CONNECTION
        await transporter.verify();

        console.log('✅ SMTP SERVER CONNECTED');

        // EMAIL LOGS
        console.log('\n==========================================');
        console.log('📧 EMAIL DETAILS');
        console.log('TO:', to);
        console.log('SUBJECT:', subject);
        console.log('==========================================\n');

        // SEND EMAIL
        const info = await transporter.sendMail({

            from: process.env.EMAIL_FROM,

            to: to,

            subject: subject,

            html: html

        });

        console.log('✅ EMAIL SENT SUCCESSFULLY');
        console.log('MESSAGE ID:', info.messageId);

        // VERY IMPORTANT
        return {
            success: true
        };

    } catch (error) {

        console.error('❌ EMAIL ERROR');
        console.error(error);

        throw new Error('Email could not be sent');
    }
}

module.exports = sendEmail;
