import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check if caller is admin
  let isAdmin = false;
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      jwt.verify(token, process.env.VITE_SUPABASE_ANON_KEY || 'secret');
      isAdmin = true;
    } catch {
      // not admin token
    }
  }

  // ── GET: fetch records ──
  if (req.method === 'GET') {
    const { student_id, student_email, neet_roll } = req.query;

    // Admin query by student_id or get all
    if (isAdmin) {
      let query = supabase
        .from('annual_records')
        .select(`
          id, student_id, academic_year, year_of_study, semester, examination_details,
          percentage, grade, remarks, marksheet_path, created_at,
          users ( full_name, email, neet_roll_number )
        `)
        .order('created_at', { ascending: false });

      if (student_id) query = query.eq('student_id', student_id);

      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    // Student self-lookup query by email and NEET roll number
    if (!student_email || !neet_roll) {
      return res.status(401).json({ error: 'Please provide both your registered email address and NEET roll number.' });
    }

    // Lookup user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, phone_number, neet_roll_number')
      .ilike('email', student_email.trim())
      .ilike('neet_roll_number', neet_roll.trim())
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'No student found matching this email and NEET roll number. Please ensure you entered the details used during initial registration.' });
    }

    // Lookup application for college name
    const { data: application } = await supabase
      .from('applications')
      .select('college_name, status')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch student's annual records
    const { data: records, error: recordsError } = await supabase
      .from('annual_records')
      .select('id, academic_year, year_of_study, semester, examination_details, percentage, grade, remarks, marksheet_path, created_at')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (recordsError) return res.status(500).json({ error: recordsError.message });

    return res.status(200).json({
      student: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        neet_roll_number: user.neet_roll_number,
        college_name: application?.college_name || 'N/A',
        status: application?.status || 'Pending'
      },
      records: records || []
    });
  }

  // ── POST: add annual record ──
  if (req.method === 'POST') {
    const {
      student_id, student_email, neet_roll,
      academic_year, year_of_study, semester, examination_details,
      percentage, grade, remarks, marksheet_path
    } = req.body;

    let targetStudentId = student_id;

    // If not admin, verify student credentials
    if (!isAdmin) {
      if (!student_email || !neet_roll) {
        return res.status(401).json({ error: 'Authentication required. Provide student email and NEET roll number.' });
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .ilike('email', student_email.trim())
        .ilike('neet_roll_number', neet_roll.trim())
        .single();

      if (userError || !user) {
        return res.status(403).json({ error: 'Invalid student verification credentials.' });
      }

      targetStudentId = user.id;
    }

    if (!targetStudentId || !academic_year || !year_of_study) {
      return res.status(400).json({ error: 'Academic Year and Year of Study are required.' });
    }

    const { data, error } = await supabase
      .from('annual_records')
      .insert([{
        student_id: targetStudentId,
        academic_year,
        year_of_study,
        semester: semester || null,
        examination_details: examination_details || null,
        percentage: percentage ? parseFloat(percentage) : null,
        grade: grade || null,
        remarks: remarks || null,
        marksheet_path: marksheet_path || null
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true, record: data });
  }

  // ── DELETE: admin only ──
  if (req.method === 'DELETE') {
    if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required.' });

    const { id } = req.body;
    const { error } = await supabase.from('annual_records').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
