

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, fullName, collegeName } = req.body;

  if (!email || !fullName || !collegeName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Vasudeo Korgaonkar Trust <admin@vbktrust.org>',
        to: [email],
        subject: "Scholarship Application Received",
        text: `Dear ${fullName},\n\nYour application for the Vasudeo Korgaonkar Trust Scholarship has been received successfully.\n\nCollege: ${collegeName}\n\nWe will review your documents and contact you regarding the next steps.\n\nRegards,\nVasudeo Korgaonkar Trust`
      })
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      throw new Error(errorData.message || 'Resend API rejected the email');
    }

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
