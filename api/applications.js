import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

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
        users ( full_name, email, phone_number, mother_tongue, family_occupation, neet_roll_number )
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
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
