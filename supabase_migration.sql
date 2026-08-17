-- ============================================================
-- CodeCanvas — Full Database Schema Migration (Recursion Free)
-- ============================================================

-- 1. CREATE ALL TABLES FIRST

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  avatar_url   TEXT,
  email        TEXT,
  role         TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'hod', 'admin')),
  school_id    TEXT DEFAULT 'cse',
  xp           INTEGER NOT NULL DEFAULT 0,
  streak_days  INTEGER NOT NULL DEFAULT 0,
  last_active  DATE,
  updated_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classrooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  course_code  TEXT,
  school_id    TEXT DEFAULT 'cse',
  invite_code  TEXT UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classroom_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id  UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  algorithm     TEXT,
  sample_code   TEXT,
  lang          TEXT DEFAULT 'python',
  deadline      TIMESTAMPTZ,
  max_xp        INTEGER DEFAULT 50,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id  UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code           TEXT,
  steps_json     JSONB,
  explanation    TEXT,
  ai_grade       INTEGER,
  ai_feedback    TEXT,
  teacher_grade  INTEGER,
  submitted_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.trace_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lang            TEXT,
  code            TEXT,
  steps_json      JSONB,
  data_structure  TEXT,
  school_id       TEXT,
  step_count      INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  algorithm_type   TEXT NOT NULL,
  trace_count      INTEGER NOT NULL DEFAULT 0,
  last_traced_at   TIMESTAMPTZ,
  UNIQUE(user_id, algorithm_type)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  label        TEXT,
  earned_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

CREATE TABLE IF NOT EXISTS public.shared_traces (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lang           TEXT,
  code           TEXT,
  steps_json     JSONB,
  data_structure TEXT,
  title          TEXT,
  slug           TEXT UNIQUE DEFAULT lower(substring(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  view_count     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trace_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_traces ENABLE ROW LEVEL SECURITY;

-- 3. DEFINE SECURITY FUNCTIONS (To bypass mutual recursion in RLS)

CREATE OR REPLACE FUNCTION public.is_teacher(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id_param AND role IN ('teacher', 'hod', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_classroom_teacher(classroom_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE id = classroom_id_param AND teacher_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_classroom_student(classroom_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE classroom_id = classroom_id_param AND student_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_assignment_teacher(assignment_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.classrooms c ON c.id = a.classroom_id
    WHERE a.id = assignment_id_param AND c.teacher_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE POLICIES

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Teachers can view student profiles" ON public.profiles FOR SELECT USING (
  public.is_teacher(auth.uid())
);

CREATE POLICY "Teachers manage their classrooms" ON public.classrooms FOR ALL USING (teacher_id = auth.uid());
CREATE POLICY "Students can view enrolled classrooms" ON public.classrooms FOR SELECT USING (
  public.is_classroom_student(id, auth.uid())
);

CREATE POLICY "Students can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can see own enrollments" ON public.enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers can see their class enrollments" ON public.enrollments FOR SELECT USING (
  public.is_classroom_teacher(classroom_id, auth.uid())
);
CREATE POLICY "Teachers can remove students" ON public.enrollments FOR DELETE USING (
  public.is_classroom_teacher(classroom_id, auth.uid())
);

CREATE POLICY "Teachers manage assignments" ON public.assignments FOR ALL USING (
  public.is_classroom_teacher(classroom_id, auth.uid())
);
CREATE POLICY "Students view assignments for their classes" ON public.assignments FOR SELECT USING (
  public.is_classroom_student(classroom_id, auth.uid())
);

CREATE POLICY "Students submit and view own submissions" ON public.submissions FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Teachers view submissions for their assignments" ON public.submissions FOR SELECT USING (
  public.is_assignment_teacher(assignment_id, auth.uid())
);
CREATE POLICY "Teachers grade submissions" ON public.submissions FOR UPDATE USING (
  public.is_assignment_teacher(assignment_id, auth.uid())
);

CREATE POLICY "Users can insert own traces" ON public.trace_history FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own traces" ON public.trace_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Teachers can view student traces" ON public.trace_history FOR SELECT USING (
  public.is_teacher(auth.uid())
);

CREATE POLICY "Users manage own progress" ON public.student_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Teachers view student progress" ON public.student_progress FOR SELECT USING (
  public.is_teacher(auth.uid())
);

CREATE POLICY "Users view own achievements" ON public.achievements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert achievements" ON public.achievements FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view shared traces" ON public.shared_traces FOR SELECT USING (true);
CREATE POLICY "Authenticated users can share" ON public.shared_traces FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users increment view count" ON public.shared_traces FOR UPDATE USING (true);

-- 5. CREATE TRIGGERS & FUNCTIONS

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.increment_xp(user_id_param UUID, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET xp = xp + xp_amount WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_streak(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  last_active_date DATE;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT last_active INTO last_active_date FROM public.profiles WHERE id = user_id_param;
  IF last_active_date IS NULL OR last_active_date < today - INTERVAL '1 day' THEN
    IF last_active_date < today - INTERVAL '1 day' THEN
      UPDATE public.profiles SET streak_days = 1, last_active = today WHERE id = user_id_param;
    ELSE
      UPDATE public.profiles SET streak_days = streak_days + 1, last_active = today WHERE id = user_id_param;
    END IF;
  ELSE
    UPDATE public.profiles SET last_active = today WHERE id = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.upsert_progress(user_id_param UUID, algorithm_type_param TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.student_progress (user_id, algorithm_type, trace_count, last_traced_at)
  VALUES (user_id_param, algorithm_type_param, 1, NOW())
  ON CONFLICT (user_id, algorithm_type) DO UPDATE SET
    trace_count = student_progress.trace_count + 1,
    last_traced_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. INDEXES

CREATE INDEX IF NOT EXISTS idx_trace_history_user_id ON public.trace_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trace_history_created_at ON public.trace_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_classroom_id ON public.enrollments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_user_id ON public.student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_traces_slug ON public.shared_traces(slug);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
