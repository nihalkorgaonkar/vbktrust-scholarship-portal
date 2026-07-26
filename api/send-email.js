import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, fullName, collegeName } = req.body;

  if (!email || !fullName || !collegeName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'admin@vbktrust.org',
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.sendMail({
      from: '"Vasudeo Korgaonkar Trust" <admin@vbktrust.org>',
      to: email,
      subject: "Scholarship Application Received",
      text: `Dear ${fullName},\n\nYour application for the Vasudeo Korgaonkar Trust Scholarship has been received successfully.\n\nCollege: ${collegeName}\n\nWe will review your documents and contact you regarding the next steps.\n\nRegards,\nVasudeo Korgaonkar Trust`
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
