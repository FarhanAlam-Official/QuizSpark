# 📊 How to Add Sample Data to QuizSpark

## 🎯 What This Does

The sample data script will create:
- **20 Students** (in 3 groups: A, B, C) with realistic names and scores
- **30 Questions** across 4 subjects (Math, Science, History, English)
- **10 Tasks** with various priorities and statuses
- **Student Points** tracking for all students
- **15 Quiz Attempts** for testing

---

## ⚡ Quick Start (3 Steps)

### **Step 1: Make Sure You Have a User**

1. Open your app: `http://localhost:3000`
2. If you're not logged in, register a new user
3. Verify your email and login

### **Step 2: Run the Sample Data Script**

1. Open Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Open the file: `scripts/sample-data.sql`
4. Copy the **ENTIRE** contents
5. Paste into SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)

### **Step 3: Refresh Your App**

1. Go back to your QuizSpark app
2. Refresh the page (F5)
3. You should now see:
   - 20 students in `/students`
   - 30 questions in `/questions`
   - 10 tasks in `/tasks`
   - Data in leaderboard

---

## 🎉 What You'll Get

### Students (20 total)

**Group A:**
- Alice Johnson (85 points)
- Bob Smith (92 points) 
- Carol White (78 points)
- David Brown (88 points)
- Emma Davis (95 points)
- Frank Miller (72 points)
- Grace Wilson (90 points)
- Henry Taylor (82 points)

**Group B:**
- Ivy Anderson (87 points)
- Jack Thomas (75 points)
- Kate Martinez (93 points)
- Liam Garcia (80 points)
- Mia Rodriguez (91 points)
- Noah Lee (77 points)
- Olivia Harris (89 points)

**Group C:**
- Peter Clark (84 points)
- Quinn Lewis (79 points)
- Ruby Walker (94 points)
- Sam Young (86 points)

### Questions (30 total)

**Math (10 questions):**
- Basic arithmetic (multiplication, square roots)
- Algebra (solving equations)
- Geometry (area, perimeter, angles)
- Percentages and powers

**Science (10 questions):**
- Chemistry (H2O, pH, atoms)
- Biology (cells, anatomy)
- Physics (speed of light, gravity)
- Astronomy (planets, solar system)

**History (5 questions):**
- World War II
- US Presidents
- Moon landing
- Famous artists
- Berlin Wall

**English (5 questions):**
- Vocabulary (synonyms, antonyms)
- Grammar (plurals, punctuation)
- Literature (Shakespeare)

### Tasks (10 total)

**High Priority:**
- Prepare for Math Quiz (due in 3 days)
- Complete Science Project (due in 7 days)
- Write Essay (due in 10 days)
- Group Presentation (due in 14 days)

**Medium Priority:**
- Read Chapter 10 (due in 5 days)
- Lab Report (due in 4 days)
- Vocabulary Quiz Prep (due in 2 days)
- Research Assignment (due in 8 days)

**Completed:**
- Practice Multiplication Tables ✅
- Math Homework ✅

---

## 🧪 Test Features

After adding sample data, you can test:

### 1. **Student Management** (`/students`)
```
✅ View all 20 students
✅ See different groups (A, B, C)
✅ Check scores and participation
✅ Pick random student
✅ Edit student information
```

### 2. **Question Bank** (`/questions`)
```
✅ Browse 30 questions
✅ Filter by topic (Math, Science, etc.)
✅ Filter by difficulty (Easy, Normal, Hard)
✅ Search questions
✅ Sort by various fields
✅ View question details
```

### 3. **Quiz System** (`/quiz`)
```
✅ Select a student (20 to choose from)
✅ Start quiz with sample questions
✅ Answer questions
✅ See points update
✅ Track progress
✅ View explanations
```

### 4. **Leaderboard** (`/leaderboard`)
```
✅ See top students ranked by score
✅ View participation counts
✅ Check student performance
```

### 5. **Tasks** (`/tasks`)
```
✅ View 10 sample tasks
✅ See different priorities
✅ Check due dates
✅ Filter by status
✅ Mark tasks complete
```

---

## 🔄 Run It Multiple Times?

**Q: What happens if I run the script again?**

A: It will create DUPLICATE data. Each time you run it, you'll get:
- Another 20 students
- Another 30 questions
- Another 10 tasks

### To Start Fresh:

If you want to clear sample data and start over:

```sql
-- Delete all sample data (WARNING: Deletes everything except users!)
DELETE FROM quiz_attempts WHERE user_id = (SELECT id FROM auth.users LIMIT 1);
DELETE FROM student_points;
DELETE FROM tasks WHERE user_id = (SELECT id FROM auth.users LIMIT 1);
DELETE FROM questions WHERE user_id = (SELECT id FROM auth.users LIMIT 1);
DELETE FROM students WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

-- Then run sample-data.sql again
```

---

## 💡 Pro Tips

### Tip 1: Customize the Data
You can edit `scripts/sample-data.sql` to:
- Change student names
- Modify score values
- Add more questions
- Change task descriptions
- Adjust difficulty levels

### Tip 2: Create Your Own Students
After loading sample data, you can still:
- Add your own students manually
- Import students via CSV
- Edit sample students

### Tip 3: Add More Questions
After loading sample data:
- Use the "Add Question" form
- Import questions via bulk import
- Edit existing questions

### Tip 4: Test the Quiz Flow
1. Go to `/quiz`
2. Click "Select Student"
3. Pick one of the 20 sample students
4. Start quiz
5. Answer questions
6. Watch points accumulate
7. Check leaderboard for updated scores

---

## 📊 Expected Database State

After running the script, your database will have:

| Table | Record Count |
|-------|-------------|
| **students** | 20+ |
| **questions** | 30+ |
| **tasks** | 10+ |
| **student_points** | 20+ |
| **quiz_attempts** | 15+ |
| **users** | 1+ (your account) |

---

## 🆘 Troubleshooting

### Issue: "No user found" Error

**Solution:**
```
The script needs at least one user to exist.
1. Make sure you're registered and logged in
2. Check if user exists:
   SELECT id, email FROM auth.users;
3. If no users exist, register first
4. Then run the sample data script
```

### Issue: Script Runs But No Data Appears

**Solution:**
```
1. Check Supabase logs for errors
2. Verify you're looking at the right project
3. Refresh your app page (F5)
4. Check in Supabase Table Editor:
   - students table should have 20 records
   - questions table should have 30 records
```

### Issue: Duplicate Data

**Solution:**
```
If you ran the script multiple times:
1. Use the "Delete all sample data" query above
2. Or manually delete records in Table Editor
3. Then run sample-data.sql once more
```

### Issue: Some Data Missing

**Solution:**
```
Check Supabase SQL Editor for error messages:
1. Look for red error text
2. Check which INSERT failed
3. Fix the issue (usually permissions)
4. Run the script again
```

---

## 🎯 What's Next?

After loading sample data:

1. **Explore the Dashboard**
   - See statistics update
   - View total counts

2. **Test Student Picker**
   - Try the visual picker
   - Pick multiple students
   - Check participation updates

3. **Run a Quiz**
   - Select a student
   - Answer questions
   - See real-time scoring

4. **Check Leaderboard**
   - View rankings
   - See top performers
   - Compare groups

5. **Manage Tasks**
   - Mark tasks complete
   - Add new tasks
   - Set priorities

6. **Try All Features**
   - Edit students
   - Create questions
   - Import/export data
   - Toggle dark mode
   - Use sound effects

---

## 🎉 Enjoy QuizSpark!

You now have a fully populated database to test all features!

**Time to load sample data: ~30 seconds**
**Total test data: 95+ records**

---

**Created by:** AI Assistant  
**Last Updated:** November 2025  
**For:** QuizSpark v2.0.0

