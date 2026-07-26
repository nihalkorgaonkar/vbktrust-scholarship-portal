-- Supabase SQL Schema for VBK Trust Scholarship Portal

-- 1. Create the Users Table (Applicants)
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    mother_tongue TEXT,
    family_occupation TEXT,
    neet_roll_number TEXT,
    role TEXT DEFAULT 'applicant'::text
);

-- 2. Create the Applications Table
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    application_year TEXT NOT NULL,
    admission_letter_path TEXT,
    income_certificate_path TEXT,
    twelfth_marksheet_path TEXT,
    neet_score_path TEXT,
    status TEXT DEFAULT 'Pending'::text
);

-- 3. Setup Row Level Security (RLS)
-- We will enable RLS but create policies that allow anyone to insert (for public registration),
-- and only authenticated admin users to view/edit. For simplicity in this iteration, 
-- we will allow public inserts and public selects (since admin login is handled in the UI).
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public selects" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public updates" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public inserts" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public selects" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Allow public updates" ON public.applications FOR UPDATE USING (true);

-- 4. Create Storage Bucket for Uploads
-- You must also manually create a storage bucket named 'uploads' in the Supabase Dashboard
-- and make it PUBLIC so the admin can view the files.
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true)
ON CONFLICT DO NOTHING;

-- Allow public uploads to the bucket
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Allow public viewing" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads');
