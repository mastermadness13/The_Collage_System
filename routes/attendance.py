from flask import Blueprint, redirect, render_template, request, url_for
import db
from routes import login_required, teacher_required, current_user_id

attendance_bp = Blueprint('attendance', __name__)


@attendance_bp.route('/attendance')
@login_required
@teacher_required
def list_attendance():
    conn = db.get_db()
    records = conn.execute('''
        SELECT a.*, t.name AS teacher_name, t.department AS teacher_department
        FROM faculty_attendance a
        LEFT JOIN teachers t ON t.id = a.teacher_id
        ORDER BY a.date DESC, a.period
    ''').fetchall()
    teachers = conn.execute('SELECT id, name, department FROM teachers ORDER BY name').fetchall()
    return render_template('attendance/list.html', records=records, teachers=teachers, teacher_id=None)


@attendance_bp.route('/attendance/create', methods=['GET', 'POST'])
@login_required
@teacher_required
def create_attendance():
    conn = db.get_db()
    if request.method == 'POST':
        teacher_id = request.form.get('teacher_id', type=int)
        date = request.form.get('date')
        period = request.form.get('period')
        status = request.form.get('status')
        note = request.form.get('note', '')
        if teacher_id and date and period and status:
            conn.execute(
                'INSERT INTO faculty_attendance (user_id, teacher_id, date, period, status, note) VALUES (?, ?, ?, ?, ?, ?)',
                (current_user_id(), teacher_id, date, period, status, note)
            )
            conn.commit()
            return redirect(url_for('attendance.list_attendance'))
    teachers = conn.execute('SELECT id, name, department FROM teachers ORDER BY name').fetchall()
    return render_template('attendance/create.html', teachers=teachers)


@attendance_bp.route('/attendance/<int:id>/delete', methods=['POST'])
@login_required
@teacher_required
def delete_attendance(id):
    conn = db.get_db()
    conn.execute('DELETE FROM faculty_attendance WHERE id = ?', (id,))
    conn.commit()
    return redirect(url_for('attendance.list_attendance'))
