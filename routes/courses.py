import csv
import io
import os
from datetime import datetime

from flask import Blueprint, current_app, flash, jsonify, redirect, render_template, request, url_for
from werkzeug.utils import secure_filename

import db
from routes import courses_timetable_admin_required, current_department_name, current_user_id, is_super_admin, login_required

courses_bp = Blueprint('courses', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'zip'}
UPLOAD_FOLDER = 'static/uploads/syllabi/'


def _allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _course_row(row):
    return dict(row)


def _all_courses_query(conn, year=None, department=None, search=None, order='c.name'):
    where = []
    params = []
    if year:
        where.append('c.year = ?')
        params.append(int(year))
    if department:
        where.append('c.department = ?')
        params.append(department)
    if search:
        where.append('(c.name LIKE ? OR c.code LIKE ?)')
        like = f'%{search}%'
        params.extend([like, like])
    clause = ('WHERE ' + ' AND '.join(where)) if where else ''
    sql = f'''
        SELECT c.id, c.name, c.code, c.department AS department_name,
               c.year, c.theoretical_hours AS theory_hours,
               c.practical_hours AS practical_hours, c.total_hours,
               c.accreditation, c.vocabulary, c.notes,
               c.syllabus_file, c.created_at
        FROM courses c
        {clause}
        ORDER BY {order}
    '''
    return conn.execute(sql, params).fetchall()


# ───────────────────────── main list ─────────────────────────
@courses_bp.route('/courses')
@login_required
@courses_timetable_admin_required
def courses():
    conn = db.get_db()
    dept_name = None if is_super_admin() else current_department_name(conn)
    courses_ = [dict(r) for r in _all_courses_query(conn, department=dept_name)]

    total_courses = len(courses_)
    total_departments = conn.execute('SELECT COUNT(*) FROM departments').fetchone()[0]
    total_hours = sum(c['total_hours'] or 0 for c in courses_)
    total_theory = sum(c['theory_hours'] or 0 for c in courses_)
    total_practical = sum(c['practical_hours'] or 0 for c in courses_)
    avg_hours = round(total_hours / total_courses, 1) if total_courses else 0

    # Distribution matrix: department × year × count
    dept_names = sorted(set(c['department_name'] or '' for c in courses_ if c['department_name']))
    years = [1, 2, 3, 4]
    matrix = {}
    totals_by_dept = {}
    totals_by_year = {y: 0 for y in years}
    for dept in dept_names:
        matrix[dept] = {}
        for y in years:
            cnt = sum(1 for c in courses_ if c['department_name'] == dept and c['year'] == y)
            matrix[dept][y] = cnt
            totals_by_dept[dept] = totals_by_dept.get(dept, 0) + cnt
            totals_by_year[y] = totals_by_year.get(y, 0) + cnt

    departments = conn.execute('SELECT name FROM departments ORDER BY name').fetchall()

    conn.close()
    return render_template('courses/courses.html',
        courses=courses_, active_page='courses',
        total_courses=total_courses, total_departments=total_departments,
        total_hours=total_hours, total_theory=total_theory,
        total_practical=total_practical, avg_hours=avg_hours,
        matrix=matrix, dept_names=dept_names, years=years,
        totals_by_dept=totals_by_dept, totals_by_year=totals_by_year,
        departments=departments)


# ───────────────────────── search (JSON) ─────────────────────────
@courses_bp.route('/courses/search')
@login_required
@courses_timetable_admin_required
def search_courses():
    q = request.args.get('q', '').strip()
    conn = db.get_db()
    rows = _all_courses_query(conn, search=q)
    conn.close()
    return jsonify([dict(r) for r in rows])


# ───────────────────────── filter (JSON) ─────────────────────────
@courses_bp.route('/courses/filter')
@login_required
@courses_timetable_admin_required
def filter_courses():
    dept = request.args.get('department', '').strip()
    year = request.args.get('year', '').strip()
    conn = db.get_db()
    rows = _all_courses_query(conn, year=year or None, department=dept or None)
    conn.close()
    return jsonify([dict(r) for r in rows])


# ───────────────────────── stats (JSON) ─────────────────────────
@courses_bp.route('/courses/stats')
@login_required
@courses_timetable_admin_required
def stats_courses():
    conn = db.get_db()
    rows = [dict(r) for r in _all_courses_query(conn)]
    conn.close()

    total = len(rows)
    total_hours = sum(r['total_hours'] or 0 for r in rows)
    total_theory = sum(r['theory_hours'] or 0 for r in rows)
    total_practical = sum(r['practical_hours'] or 0 for r in rows)
    avg_hours = round(total_hours / total, 1) if total else 0

    dept_counts = {}
    year_counts = {}
    for r in rows:
        d = r['department_name'] or 'غير محدد'
        dept_counts[d] = dept_counts.get(d, 0) + 1
        y = r['year']
        year_counts[y] = year_counts.get(y, 0) + 1

    return jsonify({
        'total_courses': total,
        'total_hours': total_hours,
        'total_theory': total_theory,
        'total_practical': total_practical,
        'avg_hours': avg_hours,
        'by_department': dept_counts,
        'by_year': year_counts,
    })


# ───────────────────────── list JSON (for exam/timetable dropdowns) ─────────────────────────
@courses_bp.route('/courses/api/list')
@login_required
def api_course_list():
    conn = db.get_db()
    rows = conn.execute(
        'SELECT id, name, code, department, year FROM courses ORDER BY name'
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


# ───────────────────────── create ─────────────────────────
@courses_bp.route('/courses/create', methods=['GET', 'POST'])
@login_required
@courses_timetable_admin_required
def create_course():
    conn = db.get_db()
    departments = conn.execute('SELECT name FROM departments ORDER BY name').fetchall()
    all_courses = conn.execute('SELECT id, name, code FROM courses ORDER BY name').fetchall()

    if request.method == 'POST':
        name = (request.form.get('name') or '').strip()
        code = (request.form.get('code') or '').strip()
        department = request.form.get('department') or ''
        year = request.form.get('year', type=int) or 1
        theoretical_hours = request.form.get('theoretical_hours', type=int) or 0
        practical_hours = request.form.get('practical_hours', type=int) or 0
        total_hours = theoretical_hours + practical_hours
        accreditation = request.form.get('accreditation') or ''
        vocabulary = (request.form.get('vocabulary') or '').strip()
        notes = (request.form.get('notes') or '').strip()

        if not name:
            flash('اسم المقرر مطلوب.', 'danger')
            return render_template('courses/create.html', departments=departments, all_courses=all_courses)

        syllabus_file = ''
        if 'syllabus_file' in request.files:
            file = request.files['syllabus_file']
            if file and file.filename and _allowed_file(file.filename):
                filename = secure_filename(f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
                file.save(os.path.join(current_app.root_path, UPLOAD_FOLDER, filename))
                syllabus_file = filename

        conn.execute(
            '''INSERT INTO courses (user_id, name, code, department, year,
               theoretical_hours, practical_hours, total_hours,
               accreditation, vocabulary, notes, syllabus_file)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (current_user_id(), name, code, department, year,
             theoretical_hours, practical_hours, total_hours,
             accreditation or None, vocabulary or None, notes or None,
             syllabus_file or None),
        )
        conn.commit()
        flash('تم إضافة المقرر بنجاح', 'success')
        return redirect(url_for('courses.courses'))

    return render_template('courses/create.html', departments=departments, all_courses=all_courses)


# ───────────────────────── edit ─────────────────────────
@courses_bp.route('/courses/<int:course_id>/edit', methods=['GET', 'POST'])
@login_required
@courses_timetable_admin_required
def edit_course(course_id):
    conn = db.get_db()
    course = conn.execute('SELECT * FROM courses WHERE id = ?', (course_id,)).fetchone()
    if not course:
        flash('المقرر غير موجود.', 'danger')
        return redirect(url_for('courses.courses'))

    if request.method == 'POST':
        name = (request.form.get('name') or '').strip()
        code = (request.form.get('code') or '').strip()
        department = request.form.get('department') or ''
        year = request.form.get('year', type=int) or 1
        theoretical_hours = request.form.get('theoretical_hours', type=int) or 0
        practical_hours = request.form.get('practical_hours', type=int) or 0
        total_hours = theoretical_hours + practical_hours
        accreditation = request.form.get('accreditation') or ''
        vocabulary = (request.form.get('vocabulary') or '').strip()
        notes = (request.form.get('notes') or '').strip()
        delete_file = request.form.get('delete_syllabus')

        if not name:
            flash('اسم المقرر مطلوب.', 'danger')
            departments = conn.execute('SELECT name FROM departments ORDER BY name').fetchall()
            all_courses = conn.execute('SELECT id, name, code FROM courses ORDER BY name').fetchall()
            return render_template('courses/edit.html', course=course, departments=departments, all_courses=all_courses)

        syllabus_file = course['syllabus_file']
        if delete_file == '1' and syllabus_file:
            filepath = os.path.join(current_app.root_path, UPLOAD_FOLDER, syllabus_file)
            if os.path.exists(filepath):
                os.remove(filepath)
            syllabus_file = ''

        if 'syllabus_file' in request.files:
            file = request.files['syllabus_file']
            if file and file.filename and _allowed_file(file.filename):
                if syllabus_file:
                    old_path = os.path.join(current_app.root_path, UPLOAD_FOLDER, syllabus_file)
                    if os.path.exists(old_path):
                        os.remove(old_path)
                filename = secure_filename(f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
                file.save(os.path.join(current_app.root_path, UPLOAD_FOLDER, filename))
                syllabus_file = filename

        conn.execute(
            '''UPDATE courses SET name=?, code=?, department=?, year=?,
               theoretical_hours=?, practical_hours=?, total_hours=?,
               accreditation=?, vocabulary=?, notes=?, syllabus_file=?
               WHERE id=?''',
            (name, code, department, year,
             theoretical_hours, practical_hours, total_hours,
             accreditation or None, vocabulary or None, notes or None,
             syllabus_file or None, course_id),
        )
        conn.commit()
        flash('تم تحديث المقرر بنجاح', 'success')
        return redirect(url_for('courses.courses'))

    departments = conn.execute('SELECT name FROM departments ORDER BY name').fetchall()
    all_courses = conn.execute('SELECT id, name, code FROM courses ORDER BY name').fetchall()
    return render_template('courses/edit.html', course=course, departments=departments, all_courses=all_courses)


# ───────────────────────── delete ─────────────────────────
@courses_bp.route('/courses/<int:course_id>/delete', methods=['POST'])
@login_required
@courses_timetable_admin_required
def delete_course(course_id):
    conn = db.get_db()
    course = conn.execute('SELECT * FROM courses WHERE id = ?', (course_id,)).fetchone()
    if not course:
        flash('المقرر غير موجود.', 'danger')
        return redirect(url_for('courses.courses'))

    if course['syllabus_file']:
        filepath = os.path.join(current_app.root_path, UPLOAD_FOLDER, course['syllabus_file'])
        if os.path.exists(filepath):
            os.remove(filepath)

    conn.execute('DELETE FROM courses WHERE id = ?', (course_id,))
    conn.commit()
    flash('تم حذف المقرر بنجاح', 'success')
    return redirect(url_for('courses.courses'))


# ───────────────────────── bulk delete ─────────────────────────
@courses_bp.route('/courses/bulk-delete', methods=['POST'])
@login_required
@courses_timetable_admin_required
def bulk_delete():
    ids = request.form.getlist('course_ids')
    if not ids:
        flash('لم يتم تحديد أي مقررات.', 'danger')
        return redirect(url_for('courses.courses'))

    conn = db.get_db()
    placeholders = ','.join('?' for _ in ids)
    rows = conn.execute(f'SELECT id, syllabus_file FROM courses WHERE id IN ({placeholders})', ids).fetchall()
    for row in rows:
        if row['syllabus_file']:
            fp = os.path.join(current_app.root_path, UPLOAD_FOLDER, row['syllabus_file'])
            if os.path.exists(fp):
                os.remove(fp)
    conn.execute(f'DELETE FROM courses WHERE id IN ({placeholders})', ids)
    conn.commit()
    flash(f'تم حذف {len(ids)} مقرر بنجاح.', 'success')
    return redirect(url_for('courses.courses'))


# ───────────────────────── export CSV ─────────────────────────
@courses_bp.route('/courses/export')
@login_required
@courses_timetable_admin_required
def export_courses():
    conn = db.get_db()
    rows = _all_courses_query(conn)
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['الرمز', 'الاسم', 'القسم', 'السنة', 'ساعات نظرية', 'ساعات عملية', 'الإجمالي', 'المتطلب السابق'])
    for r in rows:
        writer.writerow([
            r['code'], r['name'], r['department_name'], r['year'],
            r['theory_hours'], r['practical_hours'], r['total_hours'],
            r['accreditation'],
        ])

    response = current_app.response_class(
        output.getvalue().encode('utf-8-sig'),
        mimetype='text/csv; charset=utf-8',
    )
    response.headers['Content-Disposition'] = 'attachment; filename=courses.csv'
    return response


# ───────────────────────── import CSV ─────────────────────────
@courses_bp.route('/courses/import', methods=['POST'])
@login_required
@courses_timetable_admin_required
def import_courses():
    if 'file' not in request.files:
        flash('لم يتم رفع ملف.', 'danger')
        return redirect(url_for('courses.courses'))

    file = request.files['file']
    if not file or not file.filename:
        flash('الملف فارغ.', 'danger')
        return redirect(url_for('courses.courses'))

    stream = io.StringIO(file.stream.read().decode('utf-8-sig'))
    reader = csv.DictReader(stream)
    conn = db.get_db()
    count = 0

    for row in reader:
        name = (row.get('الاسم') or '').strip()
        if not name:
            continue
        code = (row.get('الرمز') or '').strip()
        department = (row.get('القسم') or '').strip()
        year = int(row.get('السنة', 1))
        theoretical = int(row.get('ساعات نظرية', 0))
        practical = int(row.get('ساعات عملية', 0))
        total = theoretical + practical
        accreditation = (row.get('المتطلب السابق') or '').strip()

        conn.execute(
            '''INSERT INTO courses (user_id, name, code, department, year,
               theoretical_hours, practical_hours, total_hours, accreditation)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (current_user_id(), name, code or None, department or None, year,
             theoretical, practical, total, accreditation or None),
        )
        count += 1

    conn.commit()
    flash(f'تم استيراد {count} مقرر بنجاح.', 'success')
    return redirect(url_for('courses.courses'))


# ───────────────────────── print view ─────────────────────────
@courses_bp.route('/courses/print')
@login_required
@courses_timetable_admin_required
def print_courses():
    conn = db.get_db()
    courses_ = [dict(r) for r in _all_courses_query(conn)]
    conn.close()
    return render_template('courses/print.html', courses=courses_, hide_nav=True)
