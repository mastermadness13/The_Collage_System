"""
Blueprint for timetable management – API endpoints and main page.
"""

from flask import Blueprint, render_template, jsonify, request
from typing import Dict, Any, Optional, List, Union
import db
from routes import (  # type: ignore[import-untyped]
    login_required,
    courses_timetable_admin_required,
    current_user_id,
    current_department_id,
    is_super_admin,
)
from routes.access import admin_department_required  # type: ignore[import-untyped]


timetable_bp = Blueprint('timetable', __name__, url_prefix='/timetable')


@timetable_bp.route('/')
@login_required
@admin_department_required
def timetable() -> str:
    """
    Render the main timetable HTML page.
    """
    return render_template('timetable/timetable.html')


# ===== API Endpoints =====

@timetable_bp.route('/api/entries')
@login_required
@admin_department_required
def get_entries() -> Any:
    """
    Return timetable entries filtered by semester, department, and optionally section.
    """
    conn = db.get_db()
    dept_id: Optional[int] = request.args.get('department_id', type=int)
    semester: int = request.args.get('semester', 1, type=int)
    section: Optional[str] = request.args.get('section')

    if not is_super_admin():
        dept_id = current_department_id()

    query = '''
        SELECT t.*, c.name as course_name, c.code as course_code,
               te.name as teacher_name, r.name as room_name
        FROM timetable t
        LEFT JOIN courses c ON c.id = t.course_id
        LEFT JOIN teachers te ON te.id = t.teacher_id
        LEFT JOIN rooms r ON r.id = t.room_id
        WHERE t.semester = ?
    '''
    params: List[Union[int, str]] = [semester]

    if dept_id:
        query += ' AND t.department_id = ?'
        params.append(dept_id)
    if section:
        query += ' AND t.section = ?'
        params.append(section)

    query += ' ORDER BY t.day, t.section'
    rows = conn.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])


@timetable_bp.route('/api/entries', methods=['POST'])
@login_required
@courses_timetable_admin_required
def create_entry() -> Any:
    """
    Create a new timetable entry.
    """
    data: Dict[str, Any] = request.get_json() or {}
    required_fields = ['day', 'semester', 'section', 'course_id',
                       'teacher_id', 'room_id', 'department_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    conn = db.get_db()

    cur = conn.execute('''
        INSERT INTO timetable (user_id, day, semester, section, course_id, teacher_id, room_id,
                               start_time, end_time, department_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        current_user_id(),
        data['day'],
        data['semester'],
        data['section'],
        data['course_id'],
        data['teacher_id'],
        data['room_id'],
        data.get('start_time'),
        data.get('end_time'),
        data['department_id']
    ))
    conn.commit()
    return jsonify({'id': cur.lastrowid, 'success': True})


@timetable_bp.route('/api/entries/<int:entry_id>', methods=['PUT'])
@login_required
@courses_timetable_admin_required
def update_entry(entry_id: int) -> Any:
    """
    Update an existing timetable entry. Only allowed for the same department (or super admin).
    """
    data: Dict[str, Any] = request.get_json() or {}
    conn = db.get_db()

    entry = conn.execute('SELECT * FROM timetable WHERE id=?', (entry_id,)).fetchone()
    if not entry or (not is_super_admin() and entry['department_id'] != current_department_id()):
        return jsonify({'error': 'Not allowed'}), 403

    conn.execute('''
        UPDATE timetable SET day=?, semester=?, section=?, course_id=?, teacher_id=?,
                             room_id=?, start_time=?, end_time=?
        WHERE id=?
    ''', (
        data['day'],
        data['semester'],
        data['section'],
        data['course_id'],
        data['teacher_id'],
        data['room_id'],
        data.get('start_time'),
        data.get('end_time'),
        entry_id
    ))
    conn.commit()
    return jsonify({'success': True})


@timetable_bp.route('/api/entries/<int:entry_id>', methods=['DELETE'])
@login_required
@courses_timetable_admin_required
def delete_entry(entry_id: int) -> Any:
    """
    Delete a timetable entry. Only allowed for the same department (or super admin).
    """
    conn = db.get_db()
    entry = conn.execute('SELECT * FROM timetable WHERE id=?', (entry_id,)).fetchone()
    if not entry or (not is_super_admin() and entry['department_id'] != current_department_id()):
        return jsonify({'error': 'Not allowed'}), 403

    conn.execute('DELETE FROM timetable WHERE id=?', (entry_id,))
    conn.commit()
    return jsonify({'success': True})


@timetable_bp.route('/api/courses')
@login_required
def get_courses() -> Any:
    """
    Return courses, optionally filtered by department_id.
    """
    conn = db.get_db()
    dept_id: Optional[int] = request.args.get('department_id', type=int)
    if not is_super_admin():
        dept_id = current_department_id()

    query = 'SELECT c.id, c.name, c.code FROM courses c WHERE 1=1'
    params: List[Union[int, str]] = []
    if dept_id:
        query += ' AND c.department = (SELECT name FROM departments WHERE id = ?)'
        params.append(dept_id)
    query += ' ORDER BY c.name'

    rows = conn.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])


@timetable_bp.route('/api/teachers')
@login_required
def get_teachers() -> Any:
    """
    Return teachers, optionally filtered by department_id.
    """
    conn = db.get_db()
    dept_id: Optional[int] = request.args.get('department_id', type=int)
    if not is_super_admin():
        dept_id = current_department_id()

    query = 'SELECT t.id, t.name FROM teachers t WHERE 1=1'
    params: List[Union[int, str]] = []
    if dept_id:
        query += ' AND (t.department_id = ? OR t.department = (SELECT name FROM departments WHERE id = ?) OR t.department IS NULL OR TRIM(t.department) = \'\')'
        params.extend([dept_id, dept_id])
    query += ' ORDER BY t.name'

    rows = conn.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])


@timetable_bp.route('/api/rooms')
@login_required
def get_rooms() -> Any:
    """
    Return rooms, optionally filtered by department_id.
    """
    conn = db.get_db()
    dept_id: Optional[int] = request.args.get('department_id', type=int)
    if not is_super_admin():
        dept_id = current_department_id()

    query = 'SELECT id, name FROM rooms WHERE 1=1'
    params: List[int] = []
    if dept_id:
        query += ' AND (department_id = ? OR department_id IS NULL)'
        params.append(dept_id)

    rows = conn.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])


@timetable_bp.route('/api/departments')
@login_required
def get_departments() -> Any:
    """
    Return departments — all for super_admin, own department for others.
    """
    conn = db.get_db()
    if is_super_admin():
        rows = conn.execute('SELECT id, name, semesters FROM departments').fetchall()
    else:
        dept_id = current_department_id()
        rows = conn.execute(
            'SELECT id, name, semesters FROM departments WHERE id = ?', (dept_id,)
        ).fetchall() if dept_id else []
    return jsonify([dict(r) for r in rows])


@timetable_bp.route('/api/periods')
@login_required
def get_periods() -> Any:
    """
    Return period settings (code, label, start/end times).
    """
    conn = db.get_db()
    rows = conn.execute(
        'SELECT code, label as name, start_time, end_time FROM period_settings ORDER BY sort_order'
    ).fetchall()
    return jsonify([dict(r) for r in rows])