# Quiz Feature Removal Documentation

This document outlines the changes made to remove the quiz feature from the application.

## Removed Components

1. Quiz page components:
   - `app/dashboard/quiz/page.tsx`
   - `app/dashboard/quiz/loading.tsx`

2. Quiz API routes:
   - `app/api/quiz/get-quiz/route.ts`
   - `app/api/quiz/upload/route.ts`
   - `app/api/quiz/generate/route.ts`
   - `app/api/quiz/upload-pdf/route.ts`
   - `app/api/quiz/generate-quiz/route.ts`
   - `app/api/quiz/status/route.ts`

3. Quiz components:
   - `components/quiz/quiz-generator.tsx`
   - `components/quiz/folder-upload-form.tsx`
   - `components/forms/quiz-form.tsx`

4. Quiz utility files:
   - `lib/quiz-utils.ts`
   - `lib/quiz-service.ts`
   - `lib/pdf-utils.ts`
   - `lib/document-processor.ts`

5. Navigation updates:
   - Removed quiz navigation item from `app/dashboard/layout.tsx`
   - Removed quiz tab content from `app/dashboard/page.tsx`

## Database Tables to Remove

The following database tables are no longer needed and can be safely removed:

1. `quiz_documents` - Stores uploaded documents for quiz generation
2. `quizzes` - Stores generated quizzes
3. `quiz_questions` - Stores questions for each quiz
4. `user_quiz_attempts` - Stores user quiz attempt records

## SQL to Remove Tables

If you want to remove these tables from your database, you can use the following SQL:

```sql
-- Drop tables in the correct order to respect foreign key constraints
DROP TABLE IF EXISTS public.quiz_questions;
DROP TABLE IF EXISTS public.user_quiz_attempts;
DROP TABLE IF EXISTS public.quizzes;
DROP TABLE IF EXISTS public.quiz_documents;
```

## Storage Buckets

If you're using Supabase storage, you may also want to remove the following buckets:

1. `quiz-documents` - Stores uploaded documents for quiz generation
2. `documents` - May contain quiz-related documents

## Note

This document is for reference only. The database tables have not been automatically removed as part of the code changes. You'll need to manually remove them if desired.
