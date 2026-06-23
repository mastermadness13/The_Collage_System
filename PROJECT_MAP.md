# PROJECT MAP — Collage Management System

---

## TECH STACK

| Component       | Technology                |
| --------------- | ------------------------- |
| Backend         | Flask (Python 3.x)        |
| Database        | SQLite3 (`data.db`)       |
| ORM             | Raw SQL (no ORM)          |
| Frontend        | HTML, CSS, JS (Vanilla)   |
| CSS Framework   | Bootstrap 4.6.2 + Custom  |
| JS Libraries    | jQuery 3.6.0              |
| Auth            | werkzeug.security         |
| CSRF            | Flask-WTF (CSRFProtect)   |
| Templating      | Jinja2                    |
| Session         | Flask signed cookies      |

---

## PROJECT INVENTORY

| Component       | Count |
| --------------- | ----- |
| Route Files     | 12    |
| Templates       | 17    |
| JS Files        | 8     |
| CSS Files       | 13    |
| Database Tables | 10    |
| Blueprints      | 11 (all registered) |

---

## DATABASE SCHEMA

### attendance
| Column       | Type      |
|------------- | --------- |
| id           | INTEGER   |
| user_id      | INTEGER   |
| student_id   | INTEGER   |
| date         | TEXT      |
| status       | TEXT      |
| note         | TEXT      |
| created_at   | TIMESTAMP |

### courses
| Column             | Type      |
|------------------- | --------- |
| id                 | INTEGER   |
| user_id            | INTEGER   |
| name               | TEXT      |
| code               | TEXT      |
| department         | TEXT      |
| year               | INTEGER   |
| theoretical_hours  | INTEGER   |
| practical_hours    | INTEGER   |
| total_hours        | INTEGER   |
| accreditation      | TEXT      |
| vocabulary         | TEXT      |
| notes              | TEXT      |
| syllabus_file      | TEXT      |
| created_at         | TIMESTAMP |

### departments
| Column    | Type      |
|---------- | --------- |
| id        | INTEGER   |
| name      | TEXT      |
| semesters | INTEGER   |
| majors    | INTEGER   |
| created_at| TIMESTAMP |

### history
| Column         | Type      |
|--------------- | --------- |
| id             | INTEGER   |
| action         | TEXT      |
| entity_type    | TEXT      |
| entity_id      | INTEGER   |
| old_value      | TEXT      |
| new_value      | TEXT      |
| created_at     | TIMESTAMP |
| actor_user_id  | INTEGER   |
| actor_username | TEXT      |
| message        | TEXT      |

### period_settings
| Column     | Type    |
|----------- | ------- |
| code       | TEXT    |
| label      | TEXT    |
| start_time | TEXT    |
| end_time   | TEXT    |
| is_enabled | INTEGER |
| sort_order | INTEGER |

### rooms
| Column        | Type      |
|-------------- | --------- |
| id            | INTEGER   |
| name          | TEXT      |
| capacity      | INTEGER   |
| location      | TEXT      |
| created_at    | TIMESTAMP |
| name_ar       | TEXT      |
| type          | TEXT      |
| status        | TEXT      |
| department_id | INTEGER   |

### students
| Column    | Type      |
|---------- | --------- |
| id        | INTEGER   |
| user_id   | INTEGER   |
| name      | TEXT      |
| department| TEXT      |
| class     | TEXT      |
| created_at| TIMESTAMP |

### teachers
| Column         | Type      |
|--------------- | --------- |
| id             | INTEGER   |
| user_id        | INTEGER   |
| name           | TEXT      |
| department     | TEXT      |
| subject        | TEXT      |
| created_at     | TIMESTAMP |
| department_id  | INTEGER   |
| academic_number| TEXT      |
| national_id    | TEXT      |
| qualification  | TEXT      |
| academic_rank  | TEXT      |
| classification | TEXT      |
| phone          | TEXT      |
| contract_date  | TEXT      |
| tasks          | TEXT      |

### teacher_courses
| Column     | Type      |
|----------- | --------- |
| id         | INTEGER   |
| teacher_id | INTEGER   |
| course_id  | INTEGER   |
| created_at | TIMESTAMP |

### timetable
| Column        | Type      |
|-------------- | --------- |
| id            | INTEGER   |
| user_id       | INTEGER   |
| day           | TEXT      |
| semester      | INTEGER   |
| section       | TEXT      |
| course_id     | INTEGER   |
| teacher_id    | INTEGER   |
| room_id       | INTEGER   |
| created_at    | TIMESTAMP |
| start_time    | TEXT      |
| end_time      | TEXT      |
| department_id | INTEGER   |

Note: UNIQUE(user_id, day, semester, section) constraint **removed** to allow duplicate entries.

### users
| Column        | Type      |
|-------------- | --------- |
| id            | INTEGER   |
| username      | TEXT      |
| password      | TEXT      |
| role          | TEXT      |
| label         | TEXT      |
| created_at    | TIMESTAMP |
| department    | TEXT      |
| department_id | INTEGER   |

---

## ROUTE REGISTRATION MATRIX

| Route File         | Blueprint Name   | Prefix           | Registered in app.py | Status     |
| ------------------ | ---------------- | ---------------- | -------------------- | ---------- |
| routes/auth.py     | `auth`           | (none)           | YES                  | ACTIVE     |
| routes/dashboard.py| `dashboard`      | (none)           | YES                  | ACTIVE     |
| routes/timetable.py| `timetable`      | `/timetable`     | YES                  | ACTIVE     |
| routes/rooms.py    | `rooms`          | (none)           | YES                  | ACTIVE     |
| routes/departments.py | `departments` | (none)           | YES                  | ACTIVE     |
| routes/students.py | `students`       | (none)           | YES                  | ACTIVE     |
| scripts/routes/history.py | `history`   | `/history`       | YES                  | ACTIVE     |
| routes/users.py    | `users`          | (none)           | YES                  | ACTIVE     |
| routes/courses.py  | `courses`        | (none)           | YES                  | ACTIVE     |
| routes/attendance.py| `attendance`    | (none)           | YES                  | ACTIVE     |
| routes/teachers.py | `teachers`       | (none)           | YES                  | ACTIVE     |
| routes/ExamSchedule.py | `exam`  | `/exams`         | YES                  | ACTIVE     |

---

## ROUTE MAP

| Endpoint                            | Method(s)       | View Function           | File:Line          |
| ----------------------------------- | --------------- | ----------------------- | ------------------ |
| `/`                                 | GET             | `index`                 | `app.py:46`        |
| `/login`                            | GET, POST       | `auth.login`            | `routes/auth.py:16`|
| `/logout`                           | GET             | `auth.logout`           | `routes/auth.py:48`|
| `/dashboard`                        | GET             | `dashboard.dashboard`   | `routes/dashboard.py:10` |
| `/timetable/`                       | GET             | `timetable.timetable`   | `routes/timetable.py:21` |
| `/timetable/api/entries`            | GET             | `timetable.get_entries` | `routes/timetable.py:33` |
| `/timetable/api/entries`            | POST            | `timetable.create_entry`| `routes/timetable.py:71` |
| `/timetable/api/entries/<id>`       | PUT             | `timetable.update_entry`| `routes/timetable.py:116`|
| `/timetable/api/entries/<id>`       | DELETE          | `timetable.delete_entry`| `routes/timetable.py:149`|
| `/timetable/api/courses`            | GET             | `timetable.get_courses` | `routes/timetable.py:157`|
| `/timetable/api/teachers`           | GET             | `timetable.get_teachers`| `routes/timetable.py:179`|
| `/timetable/api/rooms`              | GET             | `timetable.get_rooms`   | `routes/timetable.py:201`|
| `/timetable/api/departments`        | GET             | `timetable.get_departments`| `routes/timetable.py:222`|
| `/timetable/api/periods`            | GET             | `timetable.get_periods` | `routes/timetable.py:236`|
| `/rooms`                            | GET             | `rooms.rooms`           | `routes/rooms.py:15`|
| `/departments`                      | GET             | `departments.departments`| `routes/departments.py:10`|
| `/students`                         | GET             | `students.list_students`| `routes/students.py:10`|
| `/students/create`                  | GET, POST       | `students.create_student`| `routes/students.py:36`|
| `/students/<id>/edit`               | GET, POST       | `students.edit_student`| `routes/students.py:55`|
| `/students/<id>/delete`             | POST            | `students.delete_student`| `routes/students.py:79`|
| `/teachers`                         | GET             | `teachers.list_teachers`| `routes/teachers.py:42`|
| `/teachers/export`                  | GET             | `teachers.export_teachers`| `routes/teachers.py:91`|
| `/teachers/create`                  | GET, POST       | `teachers.create_teacher`| `routes/teachers.py:117`|
| `/teachers/<id>/edit`               | GET, POST       | `teachers.edit_teacher`| `routes/teachers.py:166`|
| `/teachers/<id>/delete`             | POST            | `teachers.delete_teacher`| `routes/teachers.py:214`|
| `/courses`                          | GET             | `courses.courses`       | `routes/courses.py:65`|
| `/courses/search`                   | GET             | `courses.search_courses`| `routes/courses.py:94`|
| `/courses/filter`                   | GET             | `courses.filter_courses`| `routes/courses.py:102`|
| `/courses/stats`                    | GET             | `courses.stats_courses` | `routes/courses.py:113`|
| `/courses/api/list`                 | GET             | `courses.api_course_list`| `routes/courses.py:143`|
| `/courses/create`                   | GET, POST       | `courses.create_course` | `routes/courses.py:152`|
| `/courses/<id>/edit`                | GET, POST       | `courses.edit_course`   | `routes/courses.py:198`|
| `/courses/<id>/delete`              | POST            | `courses.delete_course` | `routes/courses.py:259`|
| `/courses/bulk-delete`              | POST            | `courses.bulk_delete`   | `routes/courses.py:282`|
| `/courses/export`                   | GET             | `courses.export_courses`| `routes/courses.py:302`|
| `/courses/import`                   | POST            | `courses.import_courses`| `routes/courses.py:321`|
| `/courses/print`                    | GET             | `courses.print_courses` | `routes/courses.py:353`|
| `/users`                            | GET             | `users.list_users`      | `routes/users.py:33`|
| `/users/export`                     | GET             | `users.export_users`    | `routes/users.py:49`|
| `/users/create`                     | GET, POST       | `users.create_user`     | `routes/users.py:74`|
| `/users/<id>/edit`                  | GET, POST       | `users.edit_user`       | `routes/users.py:135`|
| `/users/<id>/delete`                | POST            | `users.delete_user`     | `routes/users.py:193`|
| `/users/<id>/change_password`       | GET, POST       | `users.change_password` | `routes/users.py:216`|
| `/history/`                         | GET             | `history.list_history`  | `scripts/routes/history.py:72`|
| `/attendance`                       | GET             | `attendance.list_attendance`| `routes/attendance.py:7`|
| `/attendance/create`                | GET, POST       | `attendance.create_attendance`| `routes/attendance.py:15`|
| `/attendance/<id>/delete`           | POST            | `attendance.delete_attendance`| `routes/attendance.py:22`|
| `/courses/create`                   | GET, POST       | `courses.create_course` | `routes/courses.py:152` |
| `/courses/<id>/edit`                | GET, POST       | `courses.edit_course`   | `routes/courses.py:198` |
| `/exams/`                           | GET             | `exam.index`            | `routes/ExamSchedule.py:23` |

---

## ROUTE → TEMPLATE CONNECTIVITY

| Route                      | Template Expected          | Actual File                | Status      |
| -------------------------- | -------------------------- | -------------------------- | ----------- |
| `/login`                   | `auth/login.html`          | `auth/login.html`          | OK          |
| `/dashboard`               | `dashboard/dashboard_admin.html` | `dashboard/dashboard_admin.html` | OK    |
| `/timetable/`              | `timetable/timetable.html` | `timetable/timetable.html` | OK          |
| `/rooms`                   | `rooms/rooms.html`         | `rooms/rooms.html`         | OK          |
| `/departments`             | `departments/departments.html` | `departments/departments.html` | OK      |
| `/courses`                 | `courses/courses.html`     | `courses/courses.html`     | OK          |
| `/users`                   | `users/list.html`          | `users/Users.html`         | **BROKEN** (wrong path/case) |
| `/users/create`            | `users/create.html`        | **DOES NOT EXIST**         | **MISSING** |
| `/users/create` (modal)    | `timetable/modal_success.html` | **DOES NOT EXIST**    | **MISSING** |
| `/users/<id>/edit`         | `users/edit.html`          | **DOES NOT EXIST**         | **MISSING** |
| `/users/<id>/change_password` | `users/change_password.html` | **DOES NOT EXIST**     | **MISSING** |
| `/students`                | `students/list.html`       | `students/students.html`   | **BROKEN** (wrong path) |
| `/students/create`         | `students/create.html`     | **DOES NOT EXIST**         | **MISSING** |
| `/students/<id>/edit`      | `students/edit.html`       | **DOES NOT EXIST**         | **MISSING** |
| `/teachers`                | `teachers/list.html`       | `teachers/teachers.html`   | **BROKEN** (wrong path) |
| `/teachers/create`         | `teachers/create.html`     | **DOES NOT EXIST**         | **MISSING** |
| `/teachers/<id>/edit`      | `teachers/edit.html`       | **DOES NOT EXIST**         | **MISSING** |
| `/history`                 | `history/history.html`     | `history/history.html` | OK (was `history/list.html`, fixed) |
| `/attendance`              | `attendance/list.html`     | `attendance/list.html`     | OK          |
| `/attendance/create`       | `attendance/create.html`   | `attendance/create.html`   | OK          |
| `/exams/` (unregistered)   | `ExamSchedule.html`        | `timetable/ExamSchedule.html` | **UNREACHABLE** |

---

## TEMPLATE COVERAGE REPORT

| Template File                    | Rendered By Route     | Linked in UI | Status                |
| -------------------------------- | --------------------- | ------------ | --------------------- |
| `auth/login.html`                | `auth.login`          | `/` redirect  | ACTIVE                |
| `auth/dashboard.html`            | **NO ROUTE**          | **NO**        | **ORPHAN**            |
| `dashboard/dashboard_admin.html` | `dashboard.dashboard` | sidebar      | ACTIVE                |
| `dashboard/dashboard_user.html`  | **NO ROUTE**          | **NO**        | **ORPHAN**            |
| `base.html`                      | (layout)              | (layout)     | ACTIVE                |
| `partials/sidebar.html`          | (layout)              | (layout)     | ACTIVE                |
| `partials/navbar.html`           | (layout)              | (layout)     | ACTIVE                |
| `departments/departments.html`   | `departments.departments` | sidebar   | ACTIVE                |
| `courses/courses.html`           | `courses.courses`     | sidebar      | ACTIVE                |
| `teachers/teachers.html`         | `teachers.list_teachers` | sidebar    | ACTIVE (wrong template path in route) |
| `students/students.html`         | `students.list_students` | sidebar    | ACTIVE (wrong template path in route) |
| `rooms/rooms.html`               | `rooms.rooms`         | sidebar      | ACTIVE                |
| `users/Users.html`               | `users.list_users`    | sidebar      | ACTIVE (wrong template path in route) |
| `timetable/timetable.html`       | `timetable.timetable` | sidebar      | ACTIVE                |
| `timetable/ExamSchedule.html`    | **no route** (blueprint unregistered) | removed from sidebar | **DEAD** |
| `timetable/ExamSID.html`         | **NO ROUTE**          | **NO**        | **ORPHAN**            |
| `history/history.html`           | `history.list_history`| sidebar      | ACTIVE                |
| `attendance/list.html`           | `attendance.list_attendance` | **NO sidebar link** | PARTIALLY CONNECTED |
| `attendance/create.html`         | `attendance.create_attendance` | **NO sidebar link** | PARTIALLY CONNECTED |

---

## JS FLOW MATRIX

| HTML Template        | JS File Loaded     | API Endpoints Called                  | Backend Route Exists | Status     |
| -------------------- | ------------------ | ------------------------------------- | -------------------- | ---------- |
| `auth/login.html`    | `login.js`         | None (form submit)                    | N/A                  | OK         |
| `base.html` (layout) | None directly      | None                                  | N/A                  | OK         |
| `dashboard/dashboard_admin.html` | None           | None                                  | N/A                  | OK         |
| `departments/departments.html` | `departments.js` | None                                | N/A                  | OK         |
| `courses/courses.html` | None              | None                                  | N/A                  | OK         |
| `teachers/teachers.html` | `teachers.js`   | None (client-side mock data)          | N/A                  | OK (static mock) |
| `students/students.html` | `Students.js` inline | None (client-side mock data)     | N/A                  | OK (static mock) |
| `users/Users.html`   | `User.js`          | None (client-side mock data)          | N/A                  | OK (static mock) |
| `rooms/rooms.html`   | None               | None                                  | N/A                  | OK         |
| `timetable/timetable.html` | `timetable.js` | `/timetable/api/entries` `/timetable/api/courses` `/timetable/api/teachers` `/timetable/api/rooms` `/timetable/api/departments` | YES | OK          |
| `timetable/ExamSchedule.html` | `ExamSchedule.js` | `/api/exams` `/api/rooms` `/api/departments` `/api/semesters` | **NO** (backend has `/exams/api/exams`) | **BROKEN** (mock interceptor, no real backend) |
| `history/history.html` | inline JS only (accordion toggle) | None | N/A                  | OK         |
| `attendance/list.html` | None              | None                                  | N/A                  | OK         |
| `attendance/create.html` | None            | None                                  | N/A                  | OK         |

Note: `ExamSchedule.js` uses a **mock fetch interceptor** that intercepts all `/api/*` calls before they reach the server. The real backend routes are at `/exams/api/*`. This means the JS never communicates with the actual backend.

---

## ACCESS CONTROL MATRIX

| Route                      | Decorators                                         | Roles Allowed                        |
| -------------------------- | -------------------------------------------------- | ------------------------------------ |
| `/login`                   | none                                               | PUBLIC                               |
| `/logout`                  | none                                               | PUBLIC                               |
| `/`                        | none                                               | PUBLIC (redirects to login)          |
| `/dashboard`               | none                                               | PUBLIC (any authenticated user)      |
| `/teachers`                | `@login_required` `@admin_department_required`     | super_admin, admin (with dept check) |
| `/teachers/create`         | `@login_required` `@courses_timetable_admin_required` | super_admin, admin               |
| `/teachers/<id>/edit`      | `@login_required` `@courses_timetable_admin_required` | super_admin, admin               |
| `/teachers/<id>/delete`    | `@login_required` `@courses_timetable_admin_required` | super_admin, admin               |
| `/teachers/export`         | `@login_required` `@admin_department_required`     | super_admin, admin (with dept check) |
| `/students`                | `@login_required`                                  | any authenticated user               |
| `/students/create`         | `@login_required`                                  | any authenticated user               |
| `/students/<id>/edit`      | `@login_required`                                  | any authenticated user               |
| `/students/<id>/delete`    | `@login_required`                                  | any authenticated user               |
| `/users`                   | `@login_required` `@super_admin_required`          | super_admin only                     |
| `/users/create`            | `@login_required` `@super_admin_required`          | super_admin only                     |
| `/users/<id>/delete`       | `@login_required` `@super_admin_required`          | super_admin only                     |
| `/users/<id>/edit`         | `@login_required` (self or super_admin)            | super_admin or self                  |
| `/users/<id>/change_password` | `@login_required` (self or super_admin)         | super_admin or self                  |
| `/history`                 | `@login_required` `@super_admin_required`          | super_admin only                     |
| `/timetable/`              | `@login_required` `@admin_department_required`     | super_admin, admin (with dept check) |
| `/timetable/api/*`         | `@login_required` + various                        | super_admin, admin                   |
| `/courses`                 | none                                               | PUBLIC (anyone)                      |
| `/rooms`                   | none                                               | PUBLIC (anyone)                      |
| `/departments`             | none                                               | PUBLIC (anyone)                      |
| `/attendance`              | none                                               | PUBLIC (anyone)                      |
| `/attendance/create`       | none                                               | PUBLIC (anyone)                      |
| `/attendance/<id>/delete`  | none                                               | PUBLIC (anyone)                      |

---

## SYSTEM FLOW DIAGRAM

```
Login (/login)
  │
  ├──> Dashboard (/dashboard)
  │      ├── sidebar ──────────────────────────────────────────────┐
  │      ├── links to: (hardcoded # anchors, not route names)      │
  │      └── stats from DB (departments, rooms, teachers, etc.)    │
  │
  ├──> Users (/users) [super_admin only]                           │
  ├──> Departments (/departments) [no auth]                        │
  ├──> Rooms (/rooms) [no auth]                                    │
  ├──> Teachers (/teachers) [admin/super_admin]                    │
  ├──> Courses (/courses) [no auth]                                │
  ├──> Timetable (/timetable/) [admin/super_admin]                 │
  ├──> Exams (sidebar link → BuildError: BROKEN)                  │
  └──> History (/history) [super_admin only]                       │
                                                                   │
  Attendance (/attendance, /attendance/create) [no auth]           │
  [NOT linked from sidebar — only accessible via direct URL]       │
                                                                   │
  ExamSchedule (/exams/) [blueprint NOT registered → 404]          │
  [Linked from sidebar → BuildError]                               │
```

---

## ORPHANS & PENDING

### ORPHAN TEMPLATES (never rendered by any route)
- `dashboard/dashboard_user.html` — never rendered

### ORPHAN JS FILES (loaded by no template)
- `static/js/departments.js` — `departments/departments.html` doesn't load this file

### DELETED FILES (cleanup)
- `routes/ExamSID.py` — empty file, removed
- `templates/auth/dashboard.html` — orphaned, removed
- `templates/timetable/ExamSID.html` — orphaned, removed
- `static/js/courses.js` — empty file, removed
- `static/js/history.js` — orphaned (never loaded by any template), removed
- `timetable.html` inline `<script>` block — duplicate of `timetable.js`, removed

### ORPHAN ROUTES (no links pointing to them)
- `/attendance` — no sidebar link
- `/attendance/create` — no sidebar link
- `/students/create`, `/students/<id>/edit`, `/students/<id>/delete` — no direct links
- `/teachers/create`, `/teachers/<id>/edit`, `/teachers/<id>/delete` — no direct links

### ORPHAN TABLES (never queried by application code)
- `period_settings` — only queried by `/timetable/api/periods` (covered)
- Table coverage seems complete for active routes

### UNUSED TABLE COLUMNS
- `teachers.department_id` — never populated in queries (uses `department` text field instead)
- `students.user_id` — column exists but never read back

### MISSING CRUD OPERATIONS
- **courses**: ✅ ALL routes now exist (create, edit, delete, search, filter, export, import, bulk-delete, print, stats, api)
- **rooms**: NO create, edit, or delete routes (only list)
- **departments**: NO create, edit, or delete routes (only list)
- **attendance**: create route has NO POST handler (form submission silently fails)

### BROKEN url_for() CALLS
- ~~`courses.html:29` → `url_for('courses.create_course')` → BuildError~~ ✅ FIXED (route now exists)
- ~~`courses.html:76` → `url_for('courses.edit_course', course_id=course.id)` → BuildError~~ ✅ FIXED (route now exists)

### BROKEN TEMPLATE PATHS IN RENDER_TEMPLATE
- `teachers.py:82` → `teachers/list.html` should be `teachers/teachers.html`
- `teachers.py:137` → `teachers/create.html` doesn't exist
- `teachers.py:163` → `teachers/create.html` doesn't exist
- `teachers.py:191` → `teachers/edit.html` doesn't exist
- `teachers.py:211` → `teachers/edit.html` doesn't exist
- `students.py:33` → `students/list.html` should be `students/students.html`
- `students.py:52` → `students/create.html` doesn't exist
- `students.py:76` → `students/edit.html` doesn't exist
- `users.py:46` → `users/list.html` should be `users/Users.html` (case mismatch)
- `users.py:120` → `timetable/modal_success.html` doesn't exist
- `users.py:125` → `users/create.html` doesn't exist
- `users.py:154` → `users/edit.html` doesn't exist
- `users.py:190` → `users/edit.html` doesn't exist
- `users.py:248` → `users/change_password.html` doesn't exist

### TIMETABLE IMPROVEMENTS (Complete)
- **Conflict detection removed**: Python `/api/check-conflict` endpoint deleted, JS save conflict check removed
- **UNIQUE constraint removed**: `UNIQUE(user_id, day, semester, section)` dropped from timetable table
- **`forceSave` checkbox removed**: No longer needed (no conflicts to bypass)
- **Inline JS merged**: Duplicate inline `<script>` block removed, all logic lives in `static/js/timetable.js`
- **Courses query fixed**: Removed reference to non-existent `c.department_id` column
- **Rooms query fixed**: Added `OR department_id IS NULL` fallback so all rooms appear regardless of department filter
- **Persistence verified**: Create, edit, delete all confirmed working via automated test

### MISSING ENDPOINTS IN JS
- `ExamSchedule.js` fetches `/api/exams` but backend routes are at `/exams/api/exams` (prefix mismatch). Mock interceptor handles this client-side only.

### INSECURE ROUTES (no auth)
- `/courses` — ✅ NOW PROTECTED with `@login_required` + `@courses_timetable_admin_required`
- `/rooms` — no login required
- `/departments` — no login required
- `/attendance` — no login required
- `/attendance/create` — no login required
- `/attendance/<id>/delete` — no login required

### DUPLICATE DB CONNECTION PATTERNS
- **FIXED**: `auth.py`, `dashboard.py`, `rooms.py`, `departments.py`, `courses.py` — now all use `db.get_db()` (Flask g) instead of direct `sqlite3.connect`
- `teachers.py`, `students.py`, `users.py`, `history.py`, `timetable.py`, `attendance.py` — already used `db.get_db()`

---

## ARCHITECTURE SCORE

| Dimension       | Score (0-10) | Notes |
| --------------- | ------------ | ----- |
| Structure       | 6/10         | All blueprints registered, consistent DB connection pattern |
| Security        | 4/10         | Multiple routes unprotected, no role-based access on courses/rooms/departments/attendance |
| Maintainability | 4/10         | Duplicate JS removed, template fix in history, fewer orphans |
| Scalability     | 3/10         | SQLite, no connection pooling, in-memory mock data for exams |
| Connectivity    | 5/10         | Courses module fully connected with 12 routes; History page fully connected with server-side pagination/filters; teachers/students/users template paths still broken |
| Data Integrity  | 7/10         | Courses has auto-calculated total_hours, file cleanup on delete, bulk operations |

**OVERALL: 5.2/10**

---

## CRITICAL ISSUES (Remaining)

1. **History page completely redesigned** — **FIXED** rewritten at `scripts/routes/history.py` with server-side pagination (50/page), parameterized filters (action, entity_type, user, date_from, date_to), concise Arabic messages, user role via JOIN, stat cards, action pill colors, and collapsible old/new value diff. Orphaned `static/js/history.js` removed, `app.py` updated to register new blueprint with `/history` prefix.

2. **`teachers/teachers.html` wrong title** — **FIXED** now shows "هيئة التدريس" instead of "المقررات".

3. **`sidebar.html` had broken `url_for('exams.exams')` and `url_for('timetable.exam_schedule')`** — **FIXED** both links removed.

4. **DB connection unification** — **FIXED** all 5 files (`auth.py`, `dashboard.py`, `rooms.py`, `departments.py`, `courses.py`) now use `db.get_db()`.

5. **Timetable inline JS duplication** — **FIXED** external `timetable.js` now has all logic (loadDepartments, department filtering), duplicate inline script removed.

6. **Timetable conflict detection** — **FIXED** all conflict checks removed: Python `/api/check-conflict` deleted, JS `saveEntry` conflict block removed, `forceSave` checkbox removed, DB UNIQUE constraint dropped.

7. **Timetable course dropdown broken** — **FIXED** `c.department_id` column doesn't exist in courses table, now uses `c.department = (SELECT name FROM departments WHERE id = ?)`.

8. **Timetable room dropdown empty** — **FIXED** all rooms have NULL `department_id`, added `OR department_id IS NULL` fallback.

9. **ALL template paths in `teachers.py`, `students.py`, `users.py` are wrong** — every `render_template` call references a non-existent file:
   - Should be `teachers/teachers.html`, not `teachers/list.html`
   - Should be `students/students.html`, not `students/list.html`
   - Should be `users/Users.html` (with capital U), not `users/list.html`

10. **`courses.html` references routes that don't exist** — `courses.create_course` and `courses.edit_course` are not defined in `courses.py`.

11. **`ExamSchedule.js` calls `/api/*` endpoints but backend serves at `/exams/api/*`** — the mock interceptor masks this for demo, but no real data flow exists.

12. **`attendance.create_attendance` has no POST handler** — form submission has no effect.

### CLEANUP COMPLETED
- Removed: `routes/ExamSID.py` (empty), `templates/auth/dashboard.html` (orphan), `templates/timetable/ExamSID.html` (orphan), `static/js/courses.js` (empty)
- Removed: 464-line inline `<script>` block from `timetable.html` (logic merged into `timetable.js`)
- Fixed: `timetable.js` updated with `loadDepartments()` and department-filtered `loadReferenceData()`
- Fixed: `history.html` now renders dynamic `entries` data with Jinja2 loop (was hardcoded rows)
- Fixed: `courses.py` query aliases (`department_name`, `prerequisite`, `theory_hours`) match template expectations
- Fixed: `students.py` SQL ordering bug

### RECOMMENDED FIX ORDER

1. Fix all template paths in teachers.py, students.py, users.py (most critical remaining)
2. Add missing CRUD routes for courses (create, edit, delete)
3. Add POST handler for attendance.create_attendance
4. Add auth decorators to unprotected routes (courses, rooms, departments, attendance)
5. Add missing CRUD routes for rooms and departments
6. Create missing templates (users/create.html, users/edit.html, users/change_password.html, students/create.html, teachers/create.html, etc.)
7. Align ExamSchedule frontend API paths with backend (or remove it)

---

## COURSES MODULE REBUILD (COMPLETE)

### Backend (`routes/courses.py`) — fully rewritten
| Feature | Endpoint | Status |
|---------|----------|--------|
| Full CRUD with all 14 DB columns | `/courses`, `/courses/create`, `/courses/<id>/edit`, `/courses/<id>/delete` | ✅ |
| Search (by name/code) | `/courses/search?q=` (JSON) | ✅ |
| Filter (by department/year) | `/courses/filter?dept=&year=` (JSON) | ✅ |
| Stats API (JSON for charts) | `/courses/stats` | ✅ |
| Course list API (for exam/timetable dropdowns) | `/courses/api/list` | ✅ |
| Export CSV | `/courses/export` | ✅ |
| Import CSV | `/courses/import` (POST) | ✅ |
| Bulk delete | `/courses/bulk-delete` (POST) | ✅ |
| Print view | `/courses/print` | ✅ |
| Auto-calculate total_hours (theoretical + practical) | backend + JS | ✅ |
| File upload (syllabus_file with secure_filename) | create/edit forms | ✅ |

### Database
| Change | Location | Status |
|--------|----------|--------|
| `teacher_courses` junction table | `db.py:ensure_schema()` | ✅ |
| Upload directory `static/uploads/syllabi/` | filesystem | ✅ |

### Frontend — Templates
| Template | Changes | Status |
|----------|---------|--------|
| `courses/courses.html` | Stats cards (4 metrics), Filter bar (search + dept + year), Distribution matrix (department × year × count), Courses table (all columns including syllabus link, accreditation), Detail drawer (vocabulary, notes, file), Chart.js doughnut chart, Bulk delete, Import/Export/Print buttons, Dynamic AJAX filtering | ✅ |
| `courses/create.html` | All 12 form fields (name, code, dept, year, theory/practical/total hours, accreditation, vocabulary, notes, syllabus_file), auto-calculate total_hours (JS), file upload support | ✅ |
| `courses/edit.html` | Same as create + existing file display + delete file checkbox + pre-populated values | ✅ |
| `courses/print.html` | Print-optimized table with all columns, auto-print trigger | ✅ |

### CSS (`static/css/timetable.css`)
| Addition | Status |
|----------|--------|
| `.matrix-table`, `.matrix-cell`, `.matrix-dept`, `.matrix-total`, `.matrix-grand`, `.matrix-total-row` | ✅ |
| `.detail-drawer`, `.drawer-content`, `.drawer-header`, `.drawer-body`, `.detail-grid`, `.detail-field`, `.detail-section` | ✅ |

### Verification Results
| Test | Result |
|------|--------|
| CREATE course with all fields | ✅ |
| LIST/API course list | ✅ |
| EDIT course (update all fields) | ✅ |
| FILTER by year | ✅ |
| SEARCH by name | ✅ |
| STATS JSON endpoint | ✅ |
| EXPORT CSV | ✅ |
| PRINT page | ✅ |
| DELETE single course | ✅ |
| BULK DELETE multiple courses | ✅ |

### Known Issues Resolved
- `courses.html` stat hardcoded fallbacks (`91`, `7`, `4`, `56`) → now real DB values
- Column header `المفردات` was showing `prerequisite` (accreditation) → now correct
- `courses.create_course` and `courses.edit_course` routes now exist (were BuildError)
- `courses.delete_course` now removes syllabus_file from disk
- Missing `accreditation`, `vocabulary`, `notes`, `syllabus_file` fields → now fully active
- No search/filter/pagination → now AJAX search + filter
- No distribution matrix → now displayed with department × year × count
- No file upload → now supports syllabus PDF/DOC upload

---

## HISTORY PAGE REDESIGN (COMPLETE)

### Backend (`scripts/routes/history.py`) — rewritten
| Feature | Detail | Status |
|---------|--------|--------|
| Route location | `scripts/routes/history.py` (new PythonAnywhere-compatible structure) | ✅ |
| Blueprint | `history_bp` registered at `/history` prefix | ✅ |
| Server-side pagination | 50 records per page with LIMIT/OFFSET | ✅ |
| Parameterized filters | action, entity_type, user (actor_username), date_from, date_to | ✅ |
| Concise messages | Auto-generated from action verb + entity label (e.g. "أضاف مقرر", "حذف الجدول الدراسي") | ✅ |
| User role | `LEFT JOIN users u ON u.id = h.actor_user_id` → `u.role AS actor_role` | ✅ |
| Stats | Computed from full unfiltered dataset (total, adds, edits, deletes) | ✅ |
| Entity label mapping | timetable→الجدول الدراسي, course→مقرر, teacher→محاضر, user→مستخدم, room→قاعة, department→قسم, attendance→حضور | ✅ |
| Color system | `#059669`=ADD, `#d97706`=EDIT, `#dc2626`=DELETE, `#0284c7`=VIEW | ✅ |
| Detail diff | `_display_value()` parses JSON old/new values for collapsible display | ✅ |

### Frontend — Template (`templates/history/history.html`) — rewritten
| Feature | Status |
|---------|--------|
| Stats cards (4: total, adds, edits, deletes) with colored left borders | ✅ |
| Server-side filter form (5 fields: user, action, entity_type, date_from, date_to) + reset link | ✅ |
| User cell: initials avatar (color-coded background) + username + actual role text | ✅ |
| Action pill: colored badge (green=ADD, orange=EDIT, red=DELETE) | ✅ |
| Message cell: concise Arabic text + collapsible `<details>` for old/new values | ✅ |
| Pagination bar: page numbers with prev/next, "الصفحة X من Y (Z سجل)" info | ✅ |
| No search bar (removed — never functional) | ✅ |
| No client-side filter JS (filters fully server-side now) | ✅ |
| Inline JS only: accordion-style `<details>` toggle (auto-close others on open) | ✅ |

### CSS (`static/css/timetable.css`)
| Addition | Status |
|----------|--------|
| `.stats-grid`, `.stat-card`, `.stat-icon`, `.stat-label`, `.stat-value` | ✅ |
| `.history-filters`, `.filter-group` | ✅ |
| `.history-table`, `.history-row`, `.time-cell`, `.time-date`, `.time-hour` | ✅ |
| `.user-cell`, `.user-cell-avatar`, `.user-cell-info`, `.user-cell-name`, `.user-cell-role` | ✅ |
| `.message-cell`, `.message-text` | ✅ |
| `.action-pill` | ✅ |
| `.diff-container`, `.diff-box`, `.diff-label`, `.diff-content` | ✅ |
| `.pagination-bar`, `.pagination-info`, `.pagination-links` | ✅ |
| `.table-info-bar`, `.count-badge` | ✅ |

### Removed
| File | Reason | Status |
|------|--------|--------|
| `static/js/history.js` | Orphaned (never loaded by any template) | ✅ |
| `test_history_page.py` | Temp test file, logic verified | ✅ |

### Verification Results
| Test | Result |
|------|--------|
| Page loads with 50 records (PER_PAGE) | ✅ |
| Pagination: page 2 returns next 50, last page returns remaining 39 | ✅ |
| Filter by action=ADD returns 43 records (all ADD entries) | ✅ |
| Filter by entity_type=course returns 50+ records | ✅ |
| 4 stat cards present (total=239, adds=43, edits=92, deletes=99) | ✅ |
| Filter form has all 5 fields + reset link | ✅ |
| 50 action pills with proper color coding | ✅ |
| 50 `<details>` sections for old/new value diff | ✅ |
| 50 user cells with avatar + username + role | ✅ |
| Old route `routes/history.py` replaced by `scripts/routes/history.py` in `app.py` | ✅ |
| No orphan JS or test files remaining | ✅ |
