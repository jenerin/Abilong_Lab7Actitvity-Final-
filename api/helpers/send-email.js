async function sendEmail({ to, subject, html }) {
    const url = 'https://api.brevo.com/v3/smtp/email';
    
    // 10-second safety cutoff to stop the server from hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); 

    const payload = {
        sender: { 
            email: 'jennelynabilong22@gmail.com' // Your verified Brevo sender email
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
    };

    try {
        console.log(`⏳ Attempting to send API email to ${to}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                // Dynamically pulls your master API Key safely from your Render settings
                'api-key': process.env.SMTP_PASS, 
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal 
        });

        clearTimeout(timeoutId); 

        const data = await response.json();

        if (response.ok) {
            console.log(`📩 Email sent via Brevo API successfully to ${to}. MessageId: ${data.messageId}`);
        } else {
            console.error('❌ Brevo API rejected the request:', data.message || data);
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('❌ Brevo API request timed out after 10 seconds!');
        } else {
            console.error('❌ Failed to connect to Brevo API endpoint:', error.message);
        }
    }
}

module.exports = sendEmail;
