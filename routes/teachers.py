import csv
import json
import sqlite3
from io import StringIO
from typing import Any

from flask import Blueprint, Response, render_template, request, redirect, url_for, flash
import db

from routes import courses_timetable_admin_required, current_department_name, current_user_id, login_required
from routes.access import admin_department_required, department_name_allowed, is_super_admin

teachers_bp = Blueprint('teachers', __name__)


def _get_departments_and_subjects(conn: sqlite3.Connection) -> tuple[Any, Any]:
    departments = conn.execute('SELECT name FROM departments ORDER BY name').fetchall()
    subjects = conn.execute('SELECT DISTINCT name FROM courses ORDER BY name').fetchall()
    return departments, subjects


def _clean_optional_value(value: str | None) -> str:
    return (value or '').strip()


def _allowed_departments(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    if is_super_admin():
        return _get_departments_and_subjects(conn)[0]
    return [{'name': current_department_name(conn)}]


def _teacher_form_payload() -> dict[str, str]:
    return {
        'academic_number': _clean_optional_value(request.form.get('academic_number')),
        'national_id': _clean_optional_value(request.form.get('national_id')),
        'qualification': _clean_optional_value(request.form.get('qualification')),
        'academic_rank': _clean_optional_value(request.form.get('academic_rank')),
        'classification': _clean_optional_value(request.form.get('classification')),
        'phone': _clean_optional_value(request.form.get('phone')),
        'contract_date': _clean_optional_value(request.form.get('contract_date')),
        'tasks': _clean_optional_value(request.form.get('tasks')),
    }


@teachers_bp.route('/teachers/api/<int:teacher_id>/details')
@login_required
def teacher_details(teacher_id: int):
    conn = db.get_db()
    teacher = conn.execute('SELECT * FROM teachers WHERE id = ?', (teacher_id,)).fetchone()
    if not teacher:
        return {'error': 'غير موجود'}, 404

    courses = conn.execute('''
        SELECT DISTINCT c.id, c.name, c.code
        FROM timetable tt
        JOIN courses c ON c.id = tt.course_id
        WHERE tt.teacher_id = ?
        ORDER BY c.code
    ''', (teacher_id,)).fetchall()

    departments = set()
    if teacher['department']:
        departments.add(teacher['department'])
    for d in conn.execute('''
        SELECT DISTINCT c.department
        FROM timetable tt
        JOIN courses c ON c.id = tt.course_id
        WHERE tt.teacher_id = ? AND c.department IS NOT NULL
    ''', (teacher_id,)).fetchall():
        if d['department']:
            departments.add(d['department'])

    return {
        'id': teacher['id'],
        'name': teacher['name'],
        'academic_number': teacher['academic_number'] or '',
        'national_id': teacher['national_id'] or '',
        'phone': teacher['phone'] or '',
        'email': '',
        'qualification': teacher['qualification'] or '',
        'academic_rank': teacher['academic_rank'] or '',
        'classification': teacher['classification'] or '',
        'department': teacher['department'] or '',
        'status': 'نشط' if courses else 'غير نشط',
        'departments': sorted(departments),
        'courses': [{'id': c['id'], 'name': c['name'], 'code': c['code']} for c in courses],
    }


@teachers_bp.route('/teachers')
@login_required
@admin_department_required
def list_teachers() -> str:
    conn = db.get_db()
    requested_department = request.args.get('department', '')
    is_super = is_super_admin()
    department = requested_department if is_super else (current_department_name(conn) or '')
    _, subjects = _get_departments_and_subjects(conn)
    departments = _allowed_departments(conn)

    sql = '''
        SELECT t.*, COUNT(DISTINCT tt.course_id) as num_subjects,
               GROUP_CONCAT(DISTINCT tt.semester) as semesters
        FROM teachers t
        LEFT JOIN timetable tt ON t.id = tt.teacher_id
        WHERE 1=1
    '''
    params: list[Any] = []
    if not is_super:
        sql += ' AND t.department = ?'
        params.append(current_department_name(conn))
    elif department:
        sql += ' AND t.department = ?'
        params.append(department)
    sql += ' GROUP BY t.id'
    teachers = conn.execute(sql, params).fetchall()

    return render_template(
        'teachers/teachers.html',
        teachers=teachers,
        department=department,
        departments=departments,
        subjects=subjects,
    )


@teachers_bp.route('/teachers/export')
@login_required
@admin_department_required
def export_teachers() -> Response:
    conn = db.get_db()
    cols = (
        'id, name, academic_number, national_id, qualification, '
        'academic_rank, classification, phone, contract_date, '
        'department, subject, tasks, created_at'
    )
    if is_super_admin():
        rows = conn.execute(
            f'SELECT {cols} FROM teachers ORDER BY department, name'
        ).fetchall()
    else:
        rows = conn.execute(
            f'SELECT {cols} FROM teachers WHERE department = ? ORDER BY name',
            (current_department_name(conn),),
        ).fetchall()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        'ID', 'Name', 'Qualification', 'Rank', 'Classification',
        'Phone', 'Department', 'Subject', 'Weekly Hours',
    ])
    for r in rows:
        writer.writerow([
            r['id'], r['name'], r['qualification'],
            r['academic_rank'], r['classification'],
            r['phone'], r['department'], r['subject'], '',
        ])
    return Response(
        output.getvalue(),
        mimetype='text/csv; charset=utf-8',
        headers={'Content-Disposition': 'attachment; filename=faculty.csv'},
    )


def _build_courses_by_dept(conn):
    courses_rows = conn.execute(
        'SELECT name, code, department FROM courses ORDER BY department, name'
    ).fetchall()
    courses_by_dept = {}
    for c in courses_rows:
        dept = c['department'] or 'بدون قسم'
        courses_by_dept.setdefault(dept, []).append({
            'name': c['name'],
            'code': c['code'] or ''
        })
    return json.dumps(courses_by_dept, ensure_ascii=False)


@teachers_bp.route('/teachers/create', methods=['GET', 'POST'])
@login_required
@courses_timetable_admin_required
def create_teacher():
    conn = db.get_db()
    _, subjects = _get_departments_and_subjects(conn)
    departments = _allowed_departments(conn)
    courses_by_dept_json = _build_courses_by_dept(conn)

    empty_teacher = {}

    if request.method == 'POST':
        name = request.form['name'].strip()
        department = _clean_optional_value(request.form.get('department'))
        selected_courses = request.form.get('selected_courses', '').strip()
        course_list = [c.strip() for c in selected_courses.split(',') if c.strip()]
        subject = course_list[0] if course_list else ''
        payload = _teacher_form_payload()
        payload['tasks'] = selected_courses

        if not course_list:
            flash('⚠️ يرجى اختيار مادة واحدة على الأقل.', 'danger')
            return render_template(
                'teachers/create.html', teacher=empty_teacher,
                departments=departments, subjects=subjects,
                courses_by_dept_json=courses_by_dept_json,
            )

        if not is_super_admin():
            department = current_department_name(conn) or ''

        dept_row = conn.execute(
            'SELECT id, name FROM departments WHERE name = ?', (department,)
        ).fetchone()
        if department and not dept_row:
            flash('القسم المختار غير موجود في النظام.', 'danger')
            return render_template(
                'teachers/create.html', teacher=empty_teacher,
                departments=departments, subjects=subjects,
                courses_by_dept_json=courses_by_dept_json,
            )

        department_id = dept_row['id'] if dept_row else None

        conn.execute(
            '''INSERT INTO teachers (
                user_id, name, department, department_id, subject,
                academic_number, national_id, qualification, academic_rank,
                classification, phone, contract_date, tasks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                current_user_id(), name, department, department_id, subject,
                payload['academic_number'], payload['national_id'],
                payload['qualification'], payload['academic_rank'],
                payload['classification'], payload['phone'],
                payload['contract_date'], payload['tasks'],
            ),
        )
        conn.commit()
        flash('تم حفظ بيانات المحاضر بنجاح', 'success')
        return redirect(url_for('teachers.list_teachers'))

    return render_template(
        'teachers/create.html', teacher=empty_teacher,
        departments=departments, subjects=subjects,
        courses_by_dept_json=courses_by_dept_json,
    )


@teachers_bp.route('/teachers/<int:teacher_id>/edit', methods=['GET', 'POST'])
@login_required
@courses_timetable_admin_required
def edit_teacher(teacher_id: int):
    conn = db.get_db()
    teacher = conn.execute(
        'SELECT * FROM teachers WHERE id = ?', (teacher_id,)
    ).fetchone()
    _, subjects = _get_departments_and_subjects(conn)
    departments = _allowed_departments(conn)
    courses_by_dept_json = _build_courses_by_dept(conn)

    if not teacher or (
        not is_super_admin()
        and not department_name_allowed(teacher['department'], conn)
    ):
        flash('Not allowed.', 'danger')
        return redirect(url_for('teachers.list_teachers'))

    existing_selected = (teacher['tasks'] or '').strip()
    if not existing_selected:
        existing_selected = teacher['subject'] or ''

    if request.method == 'POST':
        name = request.form['name'].strip()
        department = _clean_optional_value(request.form.get('department'))
        selected_courses = request.form.get('selected_courses', '').strip()
        course_list = [c.strip() for c in selected_courses.split(',') if c.strip()]
        subject = course_list[0] if course_list else ''
        payload = _teacher_form_payload()
        payload['tasks'] = selected_courses

        if not course_list:
            flash('⚠️ يرجى اختيار مادة واحدة على الأقل.', 'danger')
            return render_template(
                'teachers/edit.html', teacher=teacher,
                departments=departments, subjects=subjects,
                courses_by_dept_json=courses_by_dept_json,
                existing_selected=existing_selected,
            )

        if not is_super_admin():
            department = current_department_name(conn) or ''

        valid_departments = {row['name'] for row in departments}
        dept_ok = not department or department in valid_departments
        if not dept_ok:
            flash('الرجاء اختيار قسم صحيح من القائمة.', 'danger')
            return render_template(
                'teachers/edit.html', teacher=teacher,
                departments=departments, subjects=subjects,
                courses_by_dept_json=courses_by_dept_json,
                existing_selected=existing_selected,
            )

        dept_lookup = conn.execute(
            'SELECT id FROM departments WHERE name = ?', (department,)
        ).fetchone()
        department_id = dept_lookup['id'] if dept_lookup else None

        conn.execute(
            '''UPDATE teachers
            SET name=?, department=?, department_id=?, subject=?,
                academic_number=?, national_id=?, qualification=?,
                academic_rank=?, classification=?, phone=?,
                contract_date=?, tasks=?
            WHERE id=?''',
            (
                name, department, department_id, subject,
                payload['academic_number'], payload['national_id'],
                payload['qualification'], payload['academic_rank'],
                payload['classification'], payload['phone'],
                payload['contract_date'], payload['tasks'],
                teacher_id,
            ),
        )
        conn.commit()
        flash('تم تعديل بيانات المحاضر بنجاح', 'success')
        return redirect(url_for('teachers.list_teachers'))

    return render_template(
        'teachers/edit.html', teacher=teacher,
        departments=departments, subjects=subjects,
        courses_by_dept_json=courses_by_dept_json,
        existing_selected=existing_selected,
    )


@teachers_bp.route('/teachers/<int:teacher_id>/delete', methods=['POST'])
@login_required
@courses_timetable_admin_required
def delete_teacher(teacher_id: int):
    conn = db.get_db()
    teacher = conn.execute(
        'SELECT * FROM teachers WHERE id = ?', (teacher_id,)
    ).fetchone()
    if not teacher or (
        not is_super_admin()
        and not department_name_allowed(teacher['department'], conn)
    ):
        flash('Not allowed.', 'danger')
        return redirect(url_for('teachers.list_teachers'))

    conn.execute('DELETE FROM teachers WHERE id = ?', (teacher_id,))
    conn.commit()
    flash('Teacher deleted successfully.', 'success')
    return redirect(url_for('teachers.list_teachers'))
