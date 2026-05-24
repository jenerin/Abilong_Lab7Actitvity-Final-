async function sendEmail({ to, subject, html }) {
    const url = 'https://api.brevo.com/v3/smtp/email';
    
    const payload = {
        sender: { 
            // This automatically pulls your authenticated email from Render env
            email: process.env.SMTP_USER 
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.SMTP_PASS, // Uses your master Brevo secret key
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`📩 Email sent via Brevo API successfully to ${to}. MessageId: ${data.messageId}`);
        } else {
            console.error('❌ Brevo API rejected the request:', data.message || data);
        }
    } catch (error) {
        console.error('❌ Failed to connect to Brevo API endpoint:', error.message);
    }
}

module.exports = sendEmail;
