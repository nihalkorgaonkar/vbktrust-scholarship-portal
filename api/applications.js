import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    jwt.verify(token, process.env.VITE_SUPABASE_ANON_KEY || 'secret');
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id, status, college_name, application_year, admission_letter_path, income_certificate_path, twelfth_marksheet_path, neet_score_path,
        users ( id, full_name, email, phone_number, mother_tongue, family_occupation, neet_roll_number )
      `);
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);
      
    if (error) return res.status(500).json({ error: error.message });

    // Fetch user details to send email
    const { data: appData, error: fetchError } = await supabase
      .from('applications')
      .select('users(email, full_name)')
      .eq('id', id)
      .single();

    if (!fetchError && appData && appData.users) {
      try {
        let transporter = nodemailer.createTransport({
          host: 'smtp.titan.email',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER || 'admin@vbktrust.org',
            pass: process.env.EMAIL_PASS
          }
        });

        const subject = status === 'Approved' 
          ? "Scholarship Application Approved!" 
          : "Update on your Scholarship Application";

        const text = status === 'Approved'
          ? `Dear ${appData.users.full_name},\n\nCongratulations! Your application for the Vasudeo Korgaonkar Trust MBBS Scholarship has been Approved.\n\nOur team will contact you shortly regarding the next steps for the scholarship disbursement.\n\nRegards,\nVasudeo Korgaonkar Trust`
          : `Dear ${appData.users.full_name},\n\nThank you for applying for the Vasudeo Korgaonkar Trust MBBS Scholarship. After careful review, we regret to inform you that your application was not selected for this cycle.\n\nWe wish you the best in your medical studies and future endeavors.\n\nRegards,\nVasudeo Korgaonkar Trust`;

        await transporter.sendMail({
          from: '"Vasudeo Korgaonkar Trust" <admin@vbktrust.org>',
          to: appData.users.email,
          subject: subject,
          text: text
        });
      } catch (emailError) {
        console.error('Failed to send status email:', emailError);
      }
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { id, userId } = req.body;
    
    // Fetch file paths to delete them from storage
    const { data: appData } = await supabase
      .from('applications')
      .select('admission_letter_path, income_certificate_path, twelfth_marksheet_path, neet_score_path')
      .eq('id', id)
      .single();
      
    if (appData) {
      const filesToRemove = [
        appData.admission_letter_path,
        appData.income_certificate_path,
        appData.twelfth_marksheet_path,
        appData.neet_score_path
      ].filter(Boolean); // Filter out nulls
      
      if (filesToRemove.length > 0) {
        await supabase.storage.from('uploads').remove(filesToRemove);
      }
    }

    // Delete application record
    const { error: appDeleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
      
    if (appDeleteError) return res.status(500).json({ error: appDeleteError.message });

    // Optionally delete the user record as well
    if (userId) {
      await supabase.from('users').delete().eq('id', userId);
    }

    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
