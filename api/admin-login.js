import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  if (email === 'admin@vbktrust.org' && password === process.env.VITE_ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.VITE_SUPABASE_ANON_KEY || 'secret', { expiresIn: '8h' });
    return res.status(200).json({ token });
  }
  
  return res.status(403).json({ error: 'Invalid credentials' });
}
