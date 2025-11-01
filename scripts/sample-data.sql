-- =============================================
-- QuizSpark Sample Data Generator
-- =============================================
-- This creates sample data for testing the application
-- Run this AFTER you have at least one user registered
-- =============================================

-- =============================================
-- IMPORTANT: Get Your User ID First
-- =============================================
-- Before running this script, you need to know your user ID
-- Run this query first to get your user ID:
-- SELECT id, email FROM auth.users;
-- Then replace 'YOUR_USER_ID_HERE' below with your actual UUID

-- Set your user ID here (replace with your actual user ID from auth.users)
-- Example: DO $$ DECLARE user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

DO $$
DECLARE
  -- 👇 CHANGE THIS TO YOUR USER ID! 👇
  current_user_id UUID;
  
  -- Variables for counting created records
  student_count INTEGER := 0;
  question_count INTEGER := 0;
  task_count INTEGER := 0;
  
BEGIN
  -- Get the first user's ID (or you can hardcode it)
  SELECT id INTO current_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found! Please register a user first.';
  END IF;
  
  RAISE NOTICE '📝 Creating sample data for user: %', current_user_id;
  
  -- =============================================
  -- SAMPLE STUDENTS (20 students)
  -- =============================================
  RAISE NOTICE '👥 Creating sample students...';
  
  INSERT INTO students (user_id, name, email, group_name, score, participation, metadata, last_active_at, created_by, updated_by)
  VALUES
    -- Group A (8 students)
    (current_user_id, 'Alice Johnson', 'alice.j@school.edu', 'Group A', 85, 12, '{"favorite_subject": "Math", "grade": "A"}', NOW() - INTERVAL '2 days', current_user_id, current_user_id),
    (current_user_id, 'Bob Smith', 'bob.s@school.edu', 'Group A', 92, 15, '{"favorite_subject": "Science", "grade": "A+"}', NOW() - INTERVAL '1 day', current_user_id, current_user_id),
    (current_user_id, 'Carol White', 'carol.w@school.edu', 'Group A', 78, 10, '{"favorite_subject": "English", "grade": "B+"}', NOW() - INTERVAL '3 days', current_user_id, current_user_id),
    (current_user_id, 'David Brown', 'david.b@school.edu', 'Group A', 88, 13, '{"favorite_subject": "History", "grade": "A-"}', NOW() - INTERVAL '1 day', current_user_id, current_user_id),
    (current_user_id, 'Emma Davis', 'emma.d@school.edu', 'Group A', 95, 18, '{"favorite_subject": "Math", "grade": "A+"}', NOW(), current_user_id, current_user_id),
    (current_user_id, 'Frank Miller', 'frank.m@school.edu', 'Group A', 72, 8, '{"favorite_subject": "Art", "grade": "B"}', NOW() - INTERVAL '4 days', current_user_id, current_user_id),
    (current_user_id, 'Grace Wilson', 'grace.w@school.edu', 'Group A', 90, 16, '{"favorite_subject": "Science", "grade": "A"}', NOW() - INTERVAL '1 day', current_user_id, current_user_id),
    (current_user_id, 'Henry Taylor', 'henry.t@school.edu', 'Group A', 82, 11, '{"favorite_subject": "Math", "grade": "B+"}', NOW() - INTERVAL '2 days', current_user_id, current_user_id),
    
    -- Group B (7 students)
    (current_user_id, 'Ivy Anderson', 'ivy.a@school.edu', 'Group B', 87, 14, '{"favorite_subject": "English", "grade": "A-"}', NOW() - INTERVAL '2 days', current_user_id, current_user_id),
    (current_user_id, 'Jack Thomas', 'jack.t@school.edu', 'Group B', 75, 9, '{"favorite_subject": "PE", "grade": "B"}', NOW() - INTERVAL '5 days', current_user_id, current_user_id),
    (current_user_id, 'Kate Martinez', 'kate.m@school.edu', 'Group B', 93, 17, '{"favorite_subject": "Science", "grade": "A+"}', NOW(), current_user_id, current_user_id),
    (current_user_id, 'Liam Garcia', 'liam.g@school.edu', 'Group B', 80, 12, '{"favorite_subject": "History", "grade": "B+"}', NOW() - INTERVAL '3 days', current_user_id, current_user_id),
    (current_user_id, 'Mia Rodriguez', 'mia.r@school.edu', 'Group B', 91, 15, '{"favorite_subject": "Math", "grade": "A"}', NOW() - INTERVAL '1 day', current_user_id, current_user_id),
    (current_user_id, 'Noah Lee', 'noah.l@school.edu', 'Group B', 77, 10, '{"favorite_subject": "Music", "grade": "B"}', NOW() - INTERVAL '4 days', current_user_id, current_user_id),
    (current_user_id, 'Olivia Harris', 'olivia.h@school.edu', 'Group B', 89, 13, '{"favorite_subject": "English", "grade": "A-"}', NOW() - INTERVAL '2 days', current_user_id, current_user_id),
    
    -- Group C (5 students)
    (current_user_id, 'Peter Clark', 'peter.c@school.edu', 'Group C', 84, 11, '{"favorite_subject": "Science", "grade": "B+"}', NOW() - INTERVAL '3 days', current_user_id, current_user_id),
    (current_user_id, 'Quinn Lewis', 'quinn.l@school.edu', 'Group C', 79, 9, '{"favorite_subject": "Art", "grade": "B"}', NOW() - INTERVAL '6 days', current_user_id, current_user_id),
    (current_user_id, 'Ruby Walker', 'ruby.w@school.edu', 'Group C', 94, 19, '{"favorite_subject": "Math", "grade": "A+"}', NOW(), current_user_id, current_user_id),
    (current_user_id, 'Sam Young', 'sam.y@school.edu', 'Group C', 86, 14, '{"favorite_subject": "History", "grade": "A-"}', NOW() - INTERVAL '1 day', current_user_id, current_user_id);
  
  GET DIAGNOSTICS student_count = ROW_COUNT;
  RAISE NOTICE '✅ Created % students', student_count;
  
  -- =============================================
  -- SAMPLE QUESTIONS (30 questions)
  -- =============================================
  RAISE NOTICE '❓ Creating sample questions...';
  
  -- Math Questions (10)
  INSERT INTO questions (user_id, question, options, correct_option, topic, difficulty, tags, explanation, time_limit, points, metadata, created_by, updated_by)
  VALUES
    (current_user_id, 'What is 15 × 8?', '{"1": "100", "2": "110", "3": "120", "4": "130"}'::jsonb, 3, 'Math', 'easy', ARRAY['arithmetic', 'multiplication'], 'Multiply 15 by 8 to get 120', 30, 1, '{"category": "basic_math"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the square root of 144?', '{"1": "10", "2": "11", "3": "12", "4": "13"}'::jsonb, 3, 'Math', 'easy', ARRAY['square_root', 'algebra'], '√144 = 12', 30, 1, '{"category": "algebra"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'Solve: 2x + 5 = 13. What is x?', '{"1": "2", "2": "3", "3": "4", "4": "5"}'::jsonb, 3, 'Math', 'normal', ARRAY['algebra', 'equations'], 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4', 45, 2, '{"category": "algebra"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the area of a circle with radius 5? (Use π ≈ 3.14)', '{"1": "62.8", "2": "78.5", "3": "94.2", "4": "100"}'::jsonb, 2, 'Math', 'normal', ARRAY['geometry', 'circle'], 'Area = πr² = 3.14 × 5² = 3.14 × 25 = 78.5', 60, 2, '{"category": "geometry"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is 20% of 150?', '{"1": "25", "2": "30", "3": "35", "4": "40"}'::jsonb, 2, 'Math', 'easy', ARRAY['percentage', 'arithmetic'], '150 × 0.20 = 30', 30, 1, '{"category": "percentages"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'If a triangle has angles 45° and 55°, what is the third angle?', '{"1": "70°", "2": "75°", "3": "80°", "4": "85°"}'::jsonb, 3, 'Math', 'normal', ARRAY['geometry', 'angles'], 'Sum of angles in a triangle is 180°: 180 - 45 - 55 = 80°', 45, 2, '{"category": "geometry"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is 7³ (7 cubed)?', '{"1": "243", "2": "343", "3": "449", "4": "512"}'::jsonb, 2, 'Math', 'easy', ARRAY['powers', 'arithmetic'], '7 × 7 × 7 = 343', 30, 1, '{"category": "powers"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'Solve: 3(x - 2) = 15. What is x?', '{"1": "5", "2": "6", "3": "7", "4": "8"}'::jsonb, 3, 'Math', 'normal', ARRAY['algebra', 'equations'], 'Divide by 3: x - 2 = 5, then add 2: x = 7', 60, 2, '{"category": "algebra"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the perimeter of a rectangle with length 8 and width 5?', '{"1": "24", "2": "26", "3": "28", "4": "30"}'::jsonb, 2, 'Math', 'easy', ARRAY['geometry', 'perimeter'], 'Perimeter = 2(l + w) = 2(8 + 5) = 2(13) = 26', 30, 1, '{"category": "geometry"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the value of π (pi) to 2 decimal places?', '{"1": "3.12", "2": "3.14", "3": "3.16", "4": "3.18"}'::jsonb, 2, 'Math', 'easy', ARRAY['constants', 'geometry'], 'π ≈ 3.14159...', 30, 1, '{"category": "constants"}'::jsonb, current_user_id, current_user_id),
    
    -- Science Questions (10)
    (current_user_id, 'What is the chemical symbol for water?', '{"1": "H2O", "2": "CO2", "3": "O2", "4": "NaCl"}'::jsonb, 1, 'Science', 'easy', ARRAY['chemistry', 'molecules'], 'Water consists of 2 hydrogen atoms and 1 oxygen atom', 30, 1, '{"category": "chemistry"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'How many planets are in our solar system?', '{"1": "7", "2": "8", "3": "9", "4": "10"}'::jsonb, 2, 'Science', 'easy', ARRAY['astronomy', 'solar_system'], 'There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune', 30, 1, '{"category": "astronomy"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the speed of light in vacuum?', '{"1": "299,792 km/s", "2": "300,000 km/s", "3": "150,000 km/s", "4": "500,000 km/s"}'::jsonb, 1, 'Science', 'hard', ARRAY['physics', 'constants'], 'The speed of light is approximately 299,792 kilometers per second', 60, 3, '{"category": "physics"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the powerhouse of the cell?', '{"1": "Nucleus", "2": "Mitochondria", "3": "Ribosome", "4": "Chloroplast"}'::jsonb, 2, 'Science', 'easy', ARRAY['biology', 'cells'], 'Mitochondria produce energy (ATP) for the cell', 30, 1, '{"category": "biology"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the most abundant gas in Earth''s atmosphere?', '{"1": "Oxygen", "2": "Carbon Dioxide", "3": "Nitrogen", "4": "Hydrogen"}'::jsonb, 3, 'Science', 'normal', ARRAY['earth_science', 'atmosphere'], 'Nitrogen makes up about 78% of Earth''s atmosphere', 45, 2, '{"category": "earth_science"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the pH of pure water?', '{"1": "5", "2": "6", "3": "7", "4": "8"}'::jsonb, 3, 'Science', 'normal', ARRAY['chemistry', 'pH'], 'Pure water has a neutral pH of 7', 45, 2, '{"category": "chemistry"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'Which force keeps planets in orbit around the sun?', '{"1": "Magnetism", "2": "Friction", "3": "Gravity", "4": "Centrifugal"}'::jsonb, 3, 'Science', 'easy', ARRAY['physics', 'forces'], 'Gravity is the attractive force between masses', 30, 1, '{"category": "physics"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the freezing point of water in Celsius?', '{"1": "-5°C", "2": "0°C", "3": "5°C", "4": "10°C"}'::jsonb, 2, 'Science', 'easy', ARRAY['chemistry', 'temperature'], 'Water freezes at 0°C (32°F)', 30, 1, '{"category": "chemistry"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'How many bones are in the adult human body?', '{"1": "186", "2": "206", "3": "226", "4": "246"}'::jsonb, 2, 'Science', 'normal', ARRAY['biology', 'anatomy'], 'Adults have 206 bones (babies are born with about 270)', 45, 2, '{"category": "biology"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the largest organ in the human body?', '{"1": "Liver", "2": "Brain", "3": "Skin", "4": "Heart"}'::jsonb, 3, 'Science', 'normal', ARRAY['biology', 'anatomy'], 'The skin is the largest organ by surface area', 45, 2, '{"category": "biology"}'::jsonb, current_user_id, current_user_id),
    
    -- History Questions (5)
    (current_user_id, 'In which year did World War II end?', '{"1": "1943", "2": "1944", "3": "1945", "4": "1946"}'::jsonb, 3, 'History', 'normal', ARRAY['world_war', '20th_century'], 'World War II ended in 1945', 45, 2, '{"category": "modern_history"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'Who was the first President of the United States?', '{"1": "Thomas Jefferson", "2": "George Washington", "3": "John Adams", "4": "Benjamin Franklin"}'::jsonb, 2, 'History', 'easy', ARRAY['american_history', 'presidents'], 'George Washington was the first US President (1789-1797)', 30, 1, '{"category": "american_history"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'In which year did man first land on the moon?', '{"1": "1967", "2": "1968", "3": "1969", "4": "1970"}'::jsonb, 3, 'History', 'easy', ARRAY['space', '20th_century'], 'Apollo 11 landed on the moon on July 20, 1969', 30, 1, '{"category": "space_history"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'Who painted the Mona Lisa?', '{"1": "Michelangelo", "2": "Leonardo da Vinci", "3": "Raphael", "4": "Vincent van Gogh"}'::jsonb, 2, 'History', 'easy', ARRAY['art', 'renaissance'], 'Leonardo da Vinci painted the Mona Lisa in the early 1500s', 30, 1, '{"category": "art_history"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'When did the Berlin Wall fall?', '{"1": "1987", "2": "1988", "3": "1989", "4": "1990"}'::jsonb, 3, 'History', 'normal', ARRAY['cold_war', '20th_century'], 'The Berlin Wall fell on November 9, 1989', 45, 2, '{"category": "modern_history"}'::jsonb, current_user_id, current_user_id),
    
    -- English/Language Questions (5)
    (current_user_id, 'Which word is a synonym for "happy"?', '{"1": "Sad", "2": "Angry", "3": "Joyful", "4": "Tired"}'::jsonb, 3, 'English', 'easy', ARRAY['vocabulary', 'synonyms'], 'Joyful means the same as happy', 30, 1, '{"category": "vocabulary"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is the plural of "child"?', '{"1": "Childs", "2": "Children", "3": "Childes", "4": "Childrens"}'::jsonb, 2, 'English', 'easy', ARRAY['grammar', 'plurals'], 'Child is an irregular plural', 30, 1, '{"category": "grammar"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'Who wrote "Romeo and Juliet"?', '{"1": "Charles Dickens", "2": "William Shakespeare", "3": "Jane Austen", "4": "Mark Twain"}'::jsonb, 2, 'English', 'easy', ARRAY['literature', 'shakespeare'], 'William Shakespeare wrote Romeo and Juliet around 1595', 30, 1, '{"category": "literature"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'What is an antonym for "hot"?', '{"1": "Warm", "2": "Cold", "3": "Mild", "4": "Cool"}'::jsonb, 2, 'English', 'easy', ARRAY['vocabulary', 'antonyms'], 'Cold is the opposite of hot', 30, 1, '{"category": "vocabulary"}'::jsonb, current_user_id, current_user_id),
    (current_user_id, 'Which punctuation mark shows possession?', '{"1": "Comma", "2": "Period", "3": "Apostrophe", "4": "Semicolon"}'::jsonb, 3, 'English', 'normal', ARRAY['grammar', 'punctuation'], 'The apostrophe ('' or '') shows possession (e.g., John''s book)', 45, 2, '{"category": "grammar"}'::jsonb, current_user_id, current_user_id);
  
  GET DIAGNOSTICS question_count = ROW_COUNT;
  RAISE NOTICE '✅ Created % questions', question_count;
  
  -- =============================================
  -- SAMPLE TASKS (10 tasks)
  -- =============================================
  RAISE NOTICE '📋 Creating sample tasks...';
  
  INSERT INTO tasks (user_id, title, description, status, priority, due_date, tags, metadata, created_by, updated_by)
  VALUES
    (current_user_id, 'Prepare for Math Quiz', 'Study chapters 5-7 on algebra and geometry', 'pending', 'high', NOW() + INTERVAL '3 days', ARRAY['math', 'study'], jsonb_build_object('chapter_range', '5-7'), current_user_id, current_user_id),
    (current_user_id, 'Complete Science Project', 'Finish the solar system model', 'in_progress', 'high', NOW() + INTERVAL '7 days', ARRAY['science', 'project'], jsonb_build_object('project_type', 'model'), current_user_id, current_user_id),
    (current_user_id, 'Read Chapter 10', 'Read and summarize the chapter on World War II', 'pending', 'medium', NOW() + INTERVAL '5 days', ARRAY['history', 'reading'], jsonb_build_object('chapter', 10), current_user_id, current_user_id),
    (current_user_id, 'Write Essay', 'Write a 500-word essay on climate change', 'pending', 'high', NOW() + INTERVAL '10 days', ARRAY['english', 'writing'], jsonb_build_object('word_count', 500), current_user_id, current_user_id),
    (current_user_id, 'Practice Multiplication Tables', 'Practice 6-12 times tables', 'completed', 'low', NOW() - INTERVAL '2 days', ARRAY['math', 'practice'], jsonb_build_object('status', 'completed'), current_user_id, current_user_id),
    (current_user_id, 'Lab Report', 'Complete chemistry lab report on acids and bases', 'in_progress', 'medium', NOW() + INTERVAL '4 days', ARRAY['science', 'lab'], jsonb_build_object('experiment', 'acids_bases'), current_user_id, current_user_id),
    (current_user_id, 'Group Presentation', 'Prepare group presentation on renewable energy', 'pending', 'high', NOW() + INTERVAL '14 days', ARRAY['science', 'presentation', 'group'], jsonb_build_object('group_size', 4), current_user_id, current_user_id),
    (current_user_id, 'Vocabulary Quiz Prep', 'Study vocabulary words 101-150', 'pending', 'medium', NOW() + INTERVAL '2 days', ARRAY['english', 'vocabulary'], jsonb_build_object('word_range', '101-150'), current_user_id, current_user_id),
    (current_user_id, 'Math Homework', 'Complete exercises 1-25 on page 142', 'completed', 'low', NOW() - INTERVAL '1 day', ARRAY['math', 'homework'], jsonb_build_object('page', 142, 'exercises', '1-25'), current_user_id, current_user_id),
    (current_user_id, 'Research Assignment', 'Research famous scientists and their contributions', 'pending', 'medium', NOW() + INTERVAL '8 days', ARRAY['science', 'research'], jsonb_build_object('min_scientists', 3), current_user_id, current_user_id);
  
  GET DIAGNOSTICS task_count = ROW_COUNT;
  
  -- Update completed tasks with completion date
  UPDATE tasks 
  SET completed_at = NOW() - INTERVAL '1 day'
  WHERE status = 'completed' AND user_id = current_user_id;
  
  RAISE NOTICE '✅ Created % tasks', task_count;
  
  -- =============================================
  -- SAMPLE STUDENT POINTS (for top students)
  -- =============================================
  RAISE NOTICE '⭐ Creating sample student points...';
  
  -- Get IDs of students we created
  WITH student_data AS (
    SELECT id, name, score, participation 
    FROM students 
    WHERE user_id = current_user_id 
    ORDER BY score DESC
  )
  INSERT INTO student_points (student_id, points, quiz_count, correct_answers, total_attempts, metadata)
  SELECT 
    id,
    score,  -- Use the score we set
    FLOOR(RANDOM() * 10 + 5)::INTEGER,  -- Random quiz count between 5-15
    FLOOR(score * 0.8)::INTEGER,  -- Correct answers (80% of score)
    FLOOR(score * 1.2)::INTEGER,  -- Total attempts
    jsonb_build_object(
      'average_time', FLOOR(RANDOM() * 30 + 30),
      'favorite_topic', CASE 
        WHEN RANDOM() < 0.3 THEN 'Math'
        WHEN RANDOM() < 0.6 THEN 'Science'
        ELSE 'English'
      END,
      'last_quiz_date', NOW() - (INTERVAL '1 day' * FLOOR(RANDOM() * 7))
    )
  FROM student_data;
  
  RAISE NOTICE '✅ Created student points records';
  
  -- =============================================
  -- SAMPLE QUIZ ATTEMPTS (some recent attempts)
  -- =============================================
  RAISE NOTICE '🎯 Creating sample quiz attempts...';
  
  -- Create some quiz attempts for random students and questions
  INSERT INTO quiz_attempts (user_id, question_id, selected_option, is_correct, time_taken, points_earned, metadata)
  SELECT 
    current_user_id,
    q.id,
    FLOOR(RANDOM() * 4 + 1)::INTEGER,  -- Random option 1-4
    RANDOM() < 0.7,  -- 70% correct rate
    FLOOR(RANDOM() * 40 + 20)::INTEGER,  -- Time between 20-60 seconds
    CASE WHEN RANDOM() < 0.7 THEN q.points ELSE 0 END,  -- Points if correct
    jsonb_build_object(
      'student_id', (SELECT id FROM students WHERE user_id = current_user_id ORDER BY RANDOM() LIMIT 1),
      'difficulty_rating', FLOOR(RANDOM() * 5 + 1)
    )
  FROM (
    SELECT id, points 
    FROM questions 
    WHERE user_id = current_user_id 
    ORDER BY RANDOM() 
    LIMIT 15  -- Create 15 random attempts
  ) q;
  
  RAISE NOTICE '✅ Created quiz attempts';
  
  -- =============================================
  -- SUMMARY
  -- =============================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Sample Data Creation Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  👥 Students: 20 (Groups A, B, C)';
  RAISE NOTICE '  ❓ Questions: 30 (Math, Science, History, English)';
  RAISE NOTICE '  📋 Tasks: 10 (Various priorities and statuses)';
  RAISE NOTICE '  ⭐ Student Points: 20 records';
  RAISE NOTICE '  🎯 Quiz Attempts: 15 records';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 You can now:';
  RAISE NOTICE '  • View students in /students page';
  RAISE NOTICE '  • View questions in /questions page';
  RAISE NOTICE '  • Start a quiz in /quiz page';
  RAISE NOTICE '  • Check leaderboard in /leaderboard page';
  RAISE NOTICE '  • View tasks in /tasks page';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Tip: The student scores and participation';
  RAISE NOTICE '   counts are pre-populated for testing!';
  RAISE NOTICE '';
  
END $$;

