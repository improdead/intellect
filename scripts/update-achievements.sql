-- Insert default achievements for all users if they don't already exist

-- Early Bird achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Early Bird' as name,
  'Log in before 7am' as description,
  0 as progress,
  FALSE as completed,
  'Sunrise' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Early Bird'
);

-- Night Owl achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Night Owl' as name,
  'Study after 10pm for 3 days' as description,
  0 as progress,
  FALSE as completed,
  'Moon' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Night Owl'
);

-- Weekend Warrior achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Weekend Warrior' as name,
  'Study for 3 hours on a weekend' as description,
  0 as progress,
  FALSE as completed,
  'Dumbbell' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Weekend Warrior'
);

-- Lunch Break Learner achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Lunch Break Learner' as name,
  'Study between 12pm and 1pm for 5 days' as description,
  0 as progress,
  FALSE as completed,
  'Utensils' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Lunch Break Learner'
);

-- Consistent Learner achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Consistent Learner' as name,
  'Study for 7 days in a row' as description,
  0 as progress,
  FALSE as completed,
  'Calendar' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Consistent Learner'
);

-- Monthly Master achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Monthly Master' as name,
  'Study for 20 days in a month' as description,
  0 as progress,
  FALSE as completed,
  'CalendarDays' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Monthly Master'
);

-- Quarterly Quest achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Quarterly Quest' as name,
  'Complete 50 study sessions in 3 months' as description,
  0 as progress,
  FALSE as completed,
  'CalendarRange' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Quarterly Quest'
);

-- Comeback Kid achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Comeback Kid' as name,
  'Return after 14+ days of inactivity' as description,
  0 as progress,
  FALSE as completed,
  'Undo2' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Comeback Kid'
);

-- Topic Starter achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Topic Starter' as name,
  'Learn your first 10 topics' as description,
  0 as progress,
  FALSE as completed,
  'Flag' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Topic Starter'
);

-- Topic Explorer achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Topic Explorer' as name,
  'Learn 50 different topics' as description,
  0 as progress,
  FALSE as completed,
  'Compass' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Topic Explorer'
);

-- Topic Master achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Topic Master' as name,
  'Learn 100 different topics' as description,
  0 as progress,
  FALSE as completed,
  'BookOpen' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Topic Master'
);

-- Subject Specialist achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Subject Specialist' as name,
  'Complete all topics in a subject' as description,
  0 as progress,
  FALSE as completed,
  'GraduationCap' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Subject Specialist'
);

-- Quiz Taker achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Quiz Taker' as name,
  'Complete your first quiz' as description,
  0 as progress,
  FALSE as completed,
  'ListChecks' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Quiz Taker'
);

-- Quiz Whiz achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Quiz Whiz' as name,
  'Score 80%+ on 10 quizzes' as description,
  0 as progress,
  FALSE as completed,
  'Zap' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Quiz Whiz'
);

-- Quiz Champion achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Quiz Champion' as name,
  'Score 100% on 5 quizzes' as description,
  0 as progress,
  FALSE as completed,
  'CheckCircle2' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Quiz Champion'
);

-- Speed Demon achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Speed Demon' as name,
  'Complete a quiz in under 2 minutes with 90%+ score' as description,
  0 as progress,
  FALSE as completed,
  'Timer' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Speed Demon'
);

-- Study Sprint achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Study Sprint' as name,
  'Study for 2 hours without breaks' as description,
  0 as progress,
  FALSE as completed,
  'Gauge' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Study Sprint'
);

-- Study Marathon achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Study Marathon' as name,
  'Study for 5 hours in a single day' as description,
  0 as progress,
  FALSE as completed,
  'Clock' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Study Marathon'
);

-- Knowledge Seeker achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Knowledge Seeker' as name,
  'Spend 50 total hours studying' as description,
  0 as progress,
  FALSE as completed,
  'Lightbulb' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Knowledge Seeker'
);

-- Grand Master achievement
INSERT INTO public.user_achievements (id, user_id, name, description, progress, completed, icon, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  id as user_id,
  'Grand Master' as name,
  'Unlock 15 other achievements' as description,
  0 as progress,
  FALSE as completed,
  'Award' as icon,
  NOW() as created_at,
  NOW() as updated_at
FROM public.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_achievements 
  WHERE user_achievements.user_id = users.id AND user_achievements.name = 'Grand Master'
);
