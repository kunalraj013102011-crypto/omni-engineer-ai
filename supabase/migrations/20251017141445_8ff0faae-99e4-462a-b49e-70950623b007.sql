-- Create enum for conversation types
CREATE TYPE conversation_type AS ENUM ('chat', 'expert', 'lesson', 'project_analysis');

-- Create enum for expert fields
CREATE TYPE expert_field AS ENUM (
  'software_engineering',
  'electrical_engineering', 
  'mechanical_engineering',
  'civil_engineering',
  'chemical_engineering',
  'data_science',
  'robotics',
  'ai_ml'
);

-- Update conversations table to include type and expert field
ALTER TABLE conversations 
ADD COLUMN conversation_type conversation_type DEFAULT 'chat',
ADD COLUMN expert_field expert_field;

-- Create daily lessons table
CREATE TABLE daily_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  field expert_field NOT NULL,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are viewable by everyone"
ON daily_lessons FOR SELECT
USING (true);

-- Create user lesson progress table
CREATE TABLE user_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES daily_lessons(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
ON user_lesson_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON user_lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert sample daily lessons
INSERT INTO daily_lessons (day_number, title, content, field, difficulty) VALUES
(1, 'Introduction to Software Architecture', 'Learn the fundamentals of software architecture patterns including MVC, MVVM, and clean architecture principles.', 'software_engineering', 'beginner'),
(2, 'Circuit Analysis Basics', 'Understanding Ohm''s Law, Kirchhoff''s Laws, and basic circuit analysis techniques.', 'electrical_engineering', 'beginner'),
(3, 'Thermodynamics Fundamentals', 'Introduction to the laws of thermodynamics and their applications in mechanical systems.', 'mechanical_engineering', 'beginner'),
(4, 'Data Structures: Arrays and Lists', 'Deep dive into arrays, linked lists, and when to use each data structure.', 'software_engineering', 'intermediate'),
(5, 'Machine Learning Basics', 'Introduction to supervised and unsupervised learning, with practical examples.', 'data_science', 'beginner');