# Workflows — CodeCanvas

## 1. Student Onboarding Workflow
1. Student lands on home page -> launches visualizer or clicks "Sign In".
2. Sign up via email or Google OAuth.
3. If first-time login: role selection picker -> inputs full name and selects "Student" role.
4. Redirected to Student Dashboard showing syllabus progress rings.
5. Launches visualizer -> 6-step onboarding tour highlights features.

## 2. Teacher Course Management Workflow
1. Teacher registers -> chooses "Teacher" role.
2. Visits Teacher Dashboard -> My Classes tab -> click "Create Class".
3. Generates invite code (e.g. `LPU-CSE-101`). Share code with student group.
4. Student enters invite code -> enrolls instantly. Roster table populates.
5. Teacher creates assignment with template code, constraints, and deadline.

## 3. Assignment Grading Workflow
1. Student views pending assignment -> launches visualizer workspace with starter template.
2. Solves problem -> hits submit -> packages code trace and AI explanation -> inserts record into `submissions`.
3. Teacher reviews roster -> selects assignment -> opens submission review panel.
4. Reviews step-by-step trace visually -> inserts grade/score -> logs to database.
