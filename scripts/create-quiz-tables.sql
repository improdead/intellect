-- Create quiz_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quiz_documents (
    id UUID PRIMARY KEY,
    file_name TEXT NOT NULL,
    original_file_name TEXT,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    question_count INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'uploaded',
    error_message TEXT,
    content_preview TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quizzes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES public.quiz_documents(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    error_message TEXT,
    question_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quiz_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    type TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    document_reference JSONB,
    difficulty TEXT DEFAULT 'medium',
    learning_objective TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_documents_status ON public.quiz_documents(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_document_id ON public.quizzes(document_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON public.quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);

-- Add RLS policies
ALTER TABLE public.quiz_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view all quiz documents
DROP POLICY IF EXISTS quiz_documents_select_policy ON public.quiz_documents;
CREATE POLICY quiz_documents_select_policy ON public.quiz_documents
    FOR SELECT
    USING (true);

-- Policy for authenticated users to insert quiz documents
DROP POLICY IF EXISTS quiz_documents_insert_policy ON public.quiz_documents;
CREATE POLICY quiz_documents_insert_policy ON public.quiz_documents
    FOR INSERT
    WITH CHECK (true);

-- Policy for authenticated users to update quiz documents
DROP POLICY IF EXISTS quiz_documents_update_policy ON public.quiz_documents;
CREATE POLICY quiz_documents_update_policy ON public.quiz_documents
    FOR UPDATE
    USING (true);

-- Policy for authenticated users to view all quizzes
DROP POLICY IF EXISTS quizzes_select_policy ON public.quizzes;
CREATE POLICY quizzes_select_policy ON public.quizzes
    FOR SELECT
    USING (true);

-- Policy for authenticated users to insert quizzes
DROP POLICY IF EXISTS quizzes_insert_policy ON public.quizzes;
CREATE POLICY quizzes_insert_policy ON public.quizzes
    FOR INSERT
    WITH CHECK (true);

-- Policy for authenticated users to update quizzes
DROP POLICY IF EXISTS quizzes_update_policy ON public.quizzes;
CREATE POLICY quizzes_update_policy ON public.quizzes
    FOR UPDATE
    USING (true);

-- Policy for authenticated users to view all quiz questions
DROP POLICY IF EXISTS quiz_questions_select_policy ON public.quiz_questions;
CREATE POLICY quiz_questions_select_policy ON public.quiz_questions
    FOR SELECT
    USING (true);

-- Policy for authenticated users to insert quiz questions
DROP POLICY IF EXISTS quiz_questions_insert_policy ON public.quiz_questions;
CREATE POLICY quiz_questions_insert_policy ON public.quiz_questions
    FOR INSERT
    WITH CHECK (true);

-- Policy for authenticated users to update quiz questions
DROP POLICY IF EXISTS quiz_questions_update_policy ON public.quiz_questions;
CREATE POLICY quiz_questions_update_policy ON public.quiz_questions
    FOR UPDATE
    USING (true);
