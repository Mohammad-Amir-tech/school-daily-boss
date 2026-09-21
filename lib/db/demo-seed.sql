INSERT INTO schools (id, name, city, is_demo)
VALUES ('00000000-0000-4000-8000-000000000001', 'Saraswati Vidya Mandir', 'Pune', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, school_id, clerk_user_id, name, email, role)
VALUES
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'demo-principal', 'Meera Sharma', 'meera.sharma@svm-demo.school', 'principal'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'demo-teacher-anita', 'Anita Desai', 'anita.desai@svm-demo.school', 'teacher'),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'demo-teacher-rajesh', 'Rajesh Nair', 'rajesh.nair@svm-demo.school', 'teacher'),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000001', 'demo-teacher-nisha', 'Nisha Verma', 'nisha.verma@svm-demo.school', 'teacher')
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, school_id, grade, section)
VALUES
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', '6', 'A'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', '6', 'B'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001', '7', 'A'),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000001', '7', 'B'),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000001', '8', 'A'),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000001', '8', 'B')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, school_id, class_id, name, roll_number)
VALUES
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000201', 'Rhea Kulkarni', '06'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000202', 'Kabir Deshmukh', '11'),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000203', 'Anaya Joshi', '03'),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000204', 'Arjun Patil', '14'),
  ('00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000205', 'Sana Shaikh', '09'),
  ('00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000206', 'Vihaan Shah', '18')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_insights (id, school_id, category, severity, title, evidence, why_it_matters, suggested_action, confidence, observed_on)
VALUES
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000001', 'attendance', 'urgent', 'Class 7-B attendance dropped today', '76% present today versus a 91% seven-day average.', 'A sudden class-level change is worth checking while the context is still fresh.', 'Ask the 7-B class teacher to confirm whether the register is complete and follow up on absent students.', 0.98, '2026-09-20'),
  ('00000000-0000-4000-8000-000000000702', '00000000-0000-4000-8000-000000000001', 'academic', 'attention', 'Mathematics marks are below the school threshold in 8-A', 'Class average is 57% on the latest recorded test.', 'The recorded results suggest the class may need an instructional review.', 'Ask the mathematics teacher to share the topic breakdown and plan a short reteach.', 0.91, '2026-09-20')
ON CONFLICT (id) DO NOTHING;