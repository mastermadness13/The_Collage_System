import json
from collections import defaultdict
from typing import Any, Dict, List, Optional

from flask import Blueprint, jsonify, render_template, request

import db
from routes import (
    current_department_id,
    history_actor,
    is_super_admin,
    login_required,
    head_of_department_required,
)

rooms_bp = Blueprint('rooms', __name__)


@rooms_bp.route('/rooms')
@login_required
@head_of_department_required
def rooms():
    conn = db.get_db()
    if is_super_admin():
        rows = conn.execute(
            'SELECT id, name, name_ar, type, status, capacity, location, department_id, building FROM rooms ORDER BY id'
        ).fetchall()
    else:
        dept_id = current_department_id()
        rows = conn.execute(
            'SELECT id, name, name_ar, type, status, capacity, location, department_id, building FROM rooms WHERE department_id = ? ORDER BY id',
            (dept_id,),
        ).fetchall() if dept_id else []

    rows = [dict(r) for r in rows]
    for r in rows:
        r['floor'] = r['location'] or ''
        r['building'] = r['building'] or ''
        r['notes'] = ''

    total = len(rows)
    halls = sum(1 for r in rows if r['type'] == 'قاعة')
    labs = sum(1 for r in rows if r['type'] == 'معمل')
    theaters = sum(1 for r in rows if r['type'] == 'مسرح')
    total_capacity = sum(r['capacity'] or 0 for r in rows)

    conn.close()
    return render_template('rooms/rooms.html',
        rooms_json=json.dumps(rows, ensure_ascii=False),
        total=total, halls=halls, labs=labs,
        theaters=theaters, total_capacity=total_capacity)


@rooms_bp.route('/rooms/api/create', methods=['POST'])
@login_required
@head_of_department_required
def create_room():
    data: Dict[str, Any] = request.get_json() or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'اسم المرفق مطلوب'}), 400

    conn = db.get_db()
    dept_id = data.get('department_id') or current_department_id()

    building = (data.get('building') or '').strip()

    cur = conn.execute(
        'INSERT INTO rooms (name, name_ar, type, status, capacity, location, department_id, building) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (name, name,
         data.get('type', 'قاعة'),
         data.get('status', 'متاحة'),
         data.get('capacity', 0),
         data.get('floor', ''),
         dept_id,
         building)
    )
    conn.commit()
    room_id = cur.lastrowid

    actor_id, actor_name = history_actor()
    db.add_history(conn, 'ADD', 'room', room_id,
                   actor_id, actor_name,
                   message=f'أضاف قاعة "{name}"')

    conn.close()
    return jsonify({'id': room_id, 'success': True})


@rooms_bp.route('/rooms/api/suggestions', methods=['GET'])
@login_required
def get_suggestions():
    """Suggest the next room name based on existing naming patterns."""
    room_type = request.args.get('type', '').strip()
    prefix = request.args.get('prefix', '').strip()
    conn = db.get_db()
    dept_id = current_department_id() if not is_super_admin() else request.args.get('department_id', type=int)

    query = 'SELECT name FROM rooms WHERE 1=1'
    params = []
    if dept_id:
        query += ' AND department_id = ?'
        params.append(dept_id)
    if room_type:
        query += ' AND type = ?'
        params.append(room_type)

    existing = [r['name'] for r in conn.execute(query, params).fetchall()]
    conn.close()

    # Detect numeric suffix pattern: "Prefix N" → suggest "Prefix N+1"
    suggestion = None
    numbered = []
    for name in existing:
        parts = name.rsplit(' ', 1)
        if len(parts) == 2 and parts[1].isdigit():
            numbered.append((parts[0], int(parts[1])))
    if numbered:
        # Group by prefix
        groups = defaultdict(list)
        for pfx, num in numbered:
            groups[pfx].append(num)
        # Find the most common prefix matching the type hint or any prefix
        if prefix:
            candidates = [(pfx, nums) for pfx, nums in groups.items() if prefix.lower() in pfx.lower()]
        else:
            candidates = list(groups.items())
        if candidates:
            best_pfx, nums = max(candidates, key=lambda x: len(x[1]))
            max_num = max(nums)
            suggestion = f'{best_pfx} {max_num + 1}'

    # Prefix-match existing names for autocomplete
    prefix_matches = [n for n in existing if not prefix or prefix.lower() in n.lower()][:10]

    return jsonify({
        'suggestion': suggestion,
        'alternatives': prefix_matches,
    })


@rooms_bp.route('/rooms/api/buildings', methods=['GET'])
@login_required
def get_buildings():
    """Return distinct buildings from rooms + default building list."""
    conn = db.get_db()
    rows = conn.execute(
        "SELECT DISTINCT building FROM rooms WHERE building IS NOT NULL AND building != '' ORDER BY building"
    ).fetchall()
    conn.close()
    db_buildings = [r['building'] for r in rows]
    defaults = ['المبنى الرئيسي', 'المبنى الهندسي', 'المبنى الإداري', 'مبنى المعامل', 'مبنى الطلاب']
    # Merge, deduplicate, preserve order
    seen = set()
    merged = []
    for b in defaults + db_buildings:
        if b not in seen:
            seen.add(b)
            merged.append(b)
    return jsonify(merged)


@rooms_bp.route('/rooms/api/departments', methods=['GET'])
@login_required
@head_of_department_required
def get_departments():
    """Return all departments (for super_admin) or just current user's department."""
    conn = db.get_db()
    if is_super_admin():
        rows = conn.execute('SELECT id, name FROM departments ORDER BY name').fetchall()
    else:
        dept_id = current_department_id()
        rows = conn.execute('SELECT id, name FROM departments WHERE id = ?', (dept_id,)).fetchall() if dept_id else []
    conn.close()
    return jsonify([dict(r) for r in rows])


@rooms_bp.route('/rooms/api/<int:room_id>', methods=['PUT'])
@login_required
@head_of_department_required
def update_room(room_id: int):
    data: Dict[str, Any] = request.get_json() or {}
    conn = db.get_db()

    room = conn.execute('SELECT * FROM rooms WHERE id = ?', (room_id,)).fetchone()
    if not room:
        conn.close()
        return jsonify({'error': 'القاعة غير موجودة'}), 404

    if not is_super_admin() and room['department_id'] != current_department_id():
        conn.close()
        return jsonify({'error': 'ليس لديك صلاحية'}), 403

    old_name = room['name']
    new_name = (data.get('name') or '').strip() or old_name

    building = (data.get('building') or '').strip()

    conn.execute(
        'UPDATE rooms SET name=?, name_ar=?, type=?, status=?, capacity=?, location=?, building=? WHERE id=?',
        (new_name, new_name,
         data.get('type', room['type']),
         data.get('status', room['status']),
         data.get('capacity', room['capacity']),
         data.get('floor', room['location'] or ''),
         building,
         room_id)
    )
    conn.commit()

    actor_id, actor_name = history_actor()
    db.add_history(conn, 'EDIT', 'room', room_id,
                   actor_id, actor_name,
                   message=f'عدّل قاعة "{new_name}"',
                   old_value={'name': old_name},
                   new_value={'name': new_name})

    conn.close()
    return jsonify({'success': True})


@rooms_bp.route('/rooms/api/<int:room_id>', methods=['DELETE'])
@login_required
@head_of_department_required
def delete_room(room_id: int):
    conn = db.get_db()

    room = conn.execute('SELECT * FROM rooms WHERE id = ?', (room_id,)).fetchone()
    if not room:
        conn.close()
        return jsonify({'error': 'القاعة غير موجودة'}), 404

    if not is_super_admin() and room['department_id'] != current_department_id():
        conn.close()
        return jsonify({'error': 'ليس لديك صلاحية'}), 403

    name = room['name']
    conn.execute('DELETE FROM rooms WHERE id = ?', (room_id,))
    conn.commit()

    actor_id, actor_name = history_actor()
    db.add_history(conn, 'DELETE', 'room', room_id,
                   actor_id, actor_name,
                   message=f'حذف قاعة "{name}"')

    conn.close()
    return jsonify({'success': True})
