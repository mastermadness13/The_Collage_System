from flask import Blueprint, render_template, session

import db
from routes import login_required

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
@login_required
def dashboard():
    conn = db.get_db()
    c = conn.cursor()
    c.execute('SELECT count(*) FROM departments')
    dept_count = c.fetchone()[0]
    c.execute('SELECT count(*) FROM rooms')
    room_count = c.fetchone()[0]
    c.execute('SELECT count(*) FROM teachers')
    teacher_count = c.fetchone()[0]
    c.execute('SELECT count(*) FROM courses')
    course_count = c.fetchone()[0]
    c.execute('SELECT count(*) FROM timetable')
    lecture_count = c.fetchone()[0]
    c.execute('SELECT count(*) FROM users')
    user_count = c.fetchone()[0]
    conn.close()
    role = session.get('role')
    template = 'dashboard/dashboard_admin.html' if role == 'super_admin' else 'dashboard/dashboard_user.html'
    return render_template(template,
        dept_count=dept_count, room_count=room_count,
        teacher_count=teacher_count, course_count=course_count,
        lecture_count=lecture_count, user_count=user_count)