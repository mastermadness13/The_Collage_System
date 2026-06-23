from flask import Blueprint, g, render_template, jsonify, request
from routes import login_required, head_of_exams_required, current_user_id
import db

exam_flow_bp = Blueprint('exam_flow', __name__, url_prefix='/exam-schedule')

# Exempt API endpoints from CSRF so they can work with X-CSRFToken header
# CSRF is handled via the X-CSRFToken header in frontend fetch calls


# ---------- Helper to map DB row → frontend shape ----------
def _exam_row(row):
    return {
        'id': row['id'],
        'subject': row['course'],
        'dept': row['department'],
        'sem': str(row['semester']),
        'type': row['exam_type'],
        'day': row['day'],
        'week': row['week'],
        'start': row['start_time'],
        'end': row['end_time'],
        'hall': row['room'],
        'instructor': row['teacher'] or '',
        'students': row['students'] or 0,
    }


# ---------- Page routes ----------
@exam_flow_bp.route('/')
@login_required
def exam_schedule():
    conn = db.get_db()
    depts = conn.execute(
        'SELECT id, name FROM departments ORDER BY name'
    ).fetchall()
    return render_template(
        'ExamFlowdepartment/examflow.html',
        departments=[dict(d) for d in depts],
        active_page='exam_flow',
    )


@exam_flow_bp.route('/department/<dept_name>')
@login_required
def exam_schedule_by_department(dept_name):
    conn = db.get_db()
    depts = conn.execute(
        'SELECT id, name FROM departments ORDER BY name'
    ).fetchall()
    return render_template(
        'ExamFlowdepartment/examflow.html',
        departments=[dict(d) for d in depts],
        active_department=dept_name,
        active_page='exam_flow',
    )


# ---------- API: list / create ----------
@exam_flow_bp.route('/api/exams', methods=['GET'])
@login_required
def get_exams():
    conn = db.get_db()
    dept = request.args.get('department')
    if dept:
        rows = conn.execute(
            'SELECT * FROM exam_schedule WHERE department = ? ORDER BY week, day, start_time',
            (dept,),
        ).fetchall()
    else:
        rows = conn.execute(
            'SELECT * FROM exam_schedule ORDER BY week, day, start_time'
        ).fetchall()
    return jsonify([_exam_row(r) for r in rows])


@exam_flow_bp.route('/api/exams', methods=['POST'])
@login_required
def create_exam():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid data'}), 400
    g_user_id = current_user_id()
    conn = db.get_db()
    cur = conn.execute(
        '''
        INSERT INTO exam_schedule (user_id, course, department, semester, week, day,
                                   start_time, end_time, room, teacher, students, exam_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            g_user_id,
            data.get('subject', ''),
            data.get('dept', ''),
            int(data.get('sem', 1)),
            int(data.get('week', 1)),
            data.get('day', ''),
            data.get('start', ''),
            data.get('end', ''),
            data.get('hall', ''),
            data.get('instructor', ''),
            int(data.get('students', 0)),
            data.get('type', 'theory'),
        ),
    )
    conn.commit()
    new_id = cur.lastrowid
    row = conn.execute(
        'SELECT * FROM exam_schedule WHERE id = ?', (new_id,)
    ).fetchone()
    return jsonify({'id': new_id, 'success': True, 'exam': _exam_row(row)}), 201


# ---------- API: update / delete ----------
@exam_flow_bp.route('/api/exams/<int:exam_id>', methods=['PUT'])
@login_required
def update_exam(exam_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid data'}), 400
    conn = db.get_db()
    existing = conn.execute(
        'SELECT * FROM exam_schedule WHERE id = ?', (exam_id,)
    ).fetchone()
    if not existing:
        return jsonify({'error': 'Not found'}), 404

    conn.execute(
        '''
        UPDATE exam_schedule
        SET course=?, department=?, semester=?, week=?, day=?,
            start_time=?, end_time=?, room=?, teacher=?, students=?, exam_type=?
        WHERE id=?
        ''',
        (
            data.get('subject', existing['course']),
            data.get('dept', existing['department']),
            int(data.get('sem', existing['semester'])),
            int(data.get('week', existing['week'])),
            data.get('day', existing['day']),
            data.get('start', existing['start_time']),
            data.get('end', existing['end_time']),
            data.get('hall', existing['room']),
            data.get('instructor', existing['teacher']),
            int(data.get('students', existing['students'])),
            data.get('type', existing['exam_type']),
            exam_id,
        ),
    )
    conn.commit()
    row = conn.execute(
        'SELECT * FROM exam_schedule WHERE id = ?', (exam_id,)
    ).fetchone()
    return jsonify({'success': True, 'exam': _exam_row(row)})


@exam_flow_bp.route('/api/exams/<int:exam_id>', methods=['DELETE'])
@login_required
def delete_exam(exam_id):
    conn = db.get_db()
    conn.execute('DELETE FROM exam_schedule WHERE id = ?', (exam_id,))
    conn.commit()
    return jsonify({'success': True})


# ---------- Reference data API ----------
@exam_flow_bp.route('/api/departments', methods=['GET'])
@login_required
def get_departments():
    conn = db.get_db()
    rows = conn.execute('SELECT id, name FROM departments ORDER BY name').fetchall()
    return jsonify([{'id': r['id'], 'name': r['name']} for r in rows])


@exam_flow_bp.route('/api/rooms', methods=['GET'])
@login_required
def get_rooms():
    conn = db.get_db()
    rows = conn.execute(
        'SELECT id, name, name_ar, capacity FROM rooms ORDER BY name'
    ).fetchall()
    return jsonify([{'id': r['id'], 'name': r['name_ar'] or r['name'], 'capacity': r['capacity']} for r in rows])


@exam_flow_bp.route('/api/semesters', methods=['GET'])
@login_required
def get_semesters():
    return jsonify([1, 2, 3, 4, 5, 6, 7, 8])
