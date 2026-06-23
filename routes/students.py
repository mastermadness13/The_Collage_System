from flask import Blueprint, render_template, request, redirect, url_for, session, flash
import db

from routes import courses_timetable_admin_required, current_department_name, login_required
from routes.access import is_super_admin

students_bp = Blueprint('students', __name__)


@students_bp.route('/students')
@login_required
@courses_timetable_admin_required
def list_students():
    conn = db.get_db()
    requested_department = request.args.get('department', '')
    department = requested_department if is_super_admin() else (current_department_name(conn) or '')
    class_name = request.args.get('class', '')

    if is_super_admin():
        sql = 'SELECT * FROM students WHERE 1=1'
        params = []
    else:
        sql = 'SELECT * FROM students WHERE department = ?'
        params = [current_department_name(conn)]

    if department:
        sql += ' AND department = ?'
        params.append(department)
    if class_name:
        sql += ' AND class = ?'
        params.append(class_name)

    students = conn.execute(sql, params).fetchall()
    return render_template('students/students.html', students=students, department=department, class_name=class_name)


@students_bp.route('/students/create', methods=['GET', 'POST'])
@login_required
@courses_timetable_admin_required
def create_student():
    conn = db.get_db()
    if request.method == 'POST':
        name = request.form['name']
        department = request.form['department'] if is_super_admin() else (current_department_name(conn) or '')
        class_name = request.form['class']
        conn.execute(
            'INSERT INTO students (user_id, name, department, class) VALUES (?, ?, ?, ?)',
            (session.get('user_id'), name, department, class_name)
        )
        conn.commit()
        flash('تم إضافة الطالب', 'success')
        return redirect(url_for('students.list_students'))

    departments = conn.execute('SELECT name FROM departments ORDER BY name').fetchall()
    return render_template('students/create.html', departments=departments)


@students_bp.route('/students/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@courses_timetable_admin_required
def edit_student(id):
    conn = db.get_db()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()
    if not student or (not is_super_admin() and student['department'] != current_department_name(conn)):
        flash('غير مسموح', 'danger')
        return redirect(url_for('students.list_students'))

    if request.method == 'POST':
        name = request.form['name']
        department = request.form['department'] if is_super_admin() else (current_department_name(conn) or '')
        class_name = request.form['class']
        conn.execute(
            'UPDATE students SET name = ?, department = ?, class = ? WHERE id = ?',
            (name, department, class_name, id)
        )
        conn.commit()
        flash('تم التحديث', 'success')
        return redirect(url_for('students.list_students'))

    departments = conn.execute('SELECT name FROM departments ORDER BY name').fetchall()
    return render_template('students/edit.html', student=student, departments=departments)


@students_bp.route('/students/<int:id>/delete', methods=['POST'])
@login_required
@courses_timetable_admin_required
def delete_student(id):
    conn = db.get_db()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()
    if not student or (not is_super_admin() and student['department'] != current_department_name(conn)):
        flash('غير مسموح', 'danger')
        return redirect(url_for('students.list_students'))

    conn.execute('DELETE FROM students WHERE id = ?', (id,))
    conn.commit()
    flash('تم الحذف', 'success')
    return redirect(url_for('students.list_students'))
