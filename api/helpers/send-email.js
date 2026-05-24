async function sendEmail({ to, subject, html }) {
    const url = 'https://api.brevo.com/v3/smtp/email';
    
    // Create a timeout controller so the server never hangs indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds limit

    const payload = {
        sender: { 
            // Fixed to point directly to your verified Brevo sender account
            email: 'jennelynabilong22@gmail.com' 
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
                // Uses your Render environment key, or falls back to your master Brevo string
                'api-key': process.env.SMTP_PASS || 'ac07ff001@smtp-brevo.com',
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal // Attaches the timeout clock
        });

        clearTimeout(timeoutId); // Clear timeout if it succeeds on time

        const data = await response.json();

        if (response.ok) {
            console.log(`📩 Email sent via Brevo API successfully to ${to}. MessageId: ${data.messageId}`);
        } else {
            console.error('❌ Brevo API rejected the request:', data.message || data);
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('❌ Brevo API request timed out after 10 seconds! Network is blocked.');
        } else {
            console.error('❌ Failed to connect to Brevo API endpoint:', error.message);
        }
    }
}

module.exports = sendEmail;
