import json

from flask import Blueprint, render_template, request

import db
from routes import login_required, super_admin_required

history_bp = Blueprint('history', __name__)

PER_PAGE = 50

ACTION_VERBS = {
    'ADD': 'أضاف',
    'EDIT': 'عدّل',
    'DELETE': 'حذف',
    'VIEW': 'عرض',
    'SYSTEM_ERROR': 'خطأ نظام',
}

ACTION_LABELS = {
    'ADD': 'إضافة',
    'EDIT': 'تعديل',
    'DELETE': 'حذف',
    'VIEW': 'عرض',
}

ENTITY_LABELS = {
    'timetable': 'الجدول الدراسي',
    'course': 'مقرر',
    'teacher': 'محاضر',
    'room': 'قاعة',
    'user': 'مستخدم',
    'department': 'قسم',
    'exam': 'امتحان',
    'student': 'طالب',
    'attendance': 'حضور',
}

ACTION_COLORS = {
    'ADD': '#059669',
    'EDIT': '#d97706',
    'DELETE': '#dc2626',
    'VIEW': '#0284c7',
}


def _display_value(raw_value):
    if raw_value in (None, ''):
        return None
    try:
        parsed = json.loads(raw_value)
    except Exception:
        return str(raw_value)
    if isinstance(parsed, (dict, list)):
        return json.dumps(parsed, ensure_ascii=False, indent=2)
    if parsed in (None, ''):
        return None
    return str(parsed)


def _build_message(action, entity_type, entity_id, message, actor_name):
    if message:
        return message
    verb = ACTION_VERBS.get(action, 'غيَّر')
    type_label = ENTITY_LABELS.get(entity_type, entity_type)
    return f'{verb} {type_label}'


@history_bp.route('/')
@login_required
@super_admin_required
def list_history():
    conn = db.get_db()

    action = (request.args.get('action') or '').strip().upper()
    entity_type = (request.args.get('entity_type') or '').strip().lower()
    user = (request.args.get('user') or '').strip()
    date_from = (request.args.get('date_from') or '').strip()
    date_to = (request.args.get('date_to') or '').strip()
    page = request.args.get('page', 1, type=int)
    offset = (page - 1) * PER_PAGE

    where = ['1 = 1']
    params = []

    if action:
        where.append('h.action = ?')
        params.append(action)
    if entity_type:
        where.append('h.entity_type = ?')
        params.append(entity_type)
    if user:
        where.append('(h.actor_username LIKE ? OR u.label LIKE ?)')
        like = f'%{user}%'
        params.extend([like, like])
    if date_from:
        where.append('h.created_at >= ?')
        params.append(date_from)
    if date_to:
        where.append('h.created_at <= ?')
        params.append(date_to + ' 23:59:59')

    clause = ' AND '.join(where)

    count_row = conn.execute(
        f'SELECT COUNT(*) AS cnt FROM history h LEFT JOIN users u ON u.id = h.actor_user_id WHERE {clause}',
        params,
    ).fetchone()
    total = count_row['cnt']

    rows = conn.execute(
        f'''
        SELECT h.*, u.label AS actor_label, u.role AS actor_role
        FROM history h
        LEFT JOIN users u ON u.id = h.actor_user_id
        WHERE {clause}
        ORDER BY h.created_at DESC, h.id DESC
        LIMIT ? OFFSET ?
        ''',
        params + [PER_PAGE, offset],
    ).fetchall()

    total_pages = max(1, (total + PER_PAGE - 1) // PER_PAGE)

    entries = []
    for row in rows:
        item = dict(row)
        item['old_display'] = _display_value(item.get('old_value'))
        item['new_display'] = _display_value(item.get('new_value'))
        actor_name = item.get('actor_username') or item.get('actor_label') or 'System'
        item['actor_name'] = actor_name
        item['actor_role'] = item.get('actor_role') or ''
        item['is_system_error'] = (item['action'] == 'SYSTEM_ERROR')
        item['message'] = _build_message(
            item['action'], item['entity_type'],
            item['entity_id'], item.get('message'),
            actor_name,
        )
        entries.append(item)

    # Stats from full dataset (unfiltered)
    all_rows = conn.execute('SELECT action FROM history').fetchall()
    total_all = len(all_rows)
    adds = sum(1 for r in all_rows if r['action'] == 'ADD')
    edits = sum(1 for r in all_rows if r['action'] == 'EDIT')
    deletes = sum(1 for r in all_rows if r['action'] == 'DELETE')

    # Active users list for filter dropdown
    active_users = conn.execute(
        'SELECT DISTINCT h.actor_username FROM history h WHERE h.actor_username IS NOT NULL AND h.actor_username != ? ORDER BY h.actor_username',
        ('',),
    ).fetchall()

    return render_template('history/history.html',
        entries=entries,
        page=page, total_pages=total_pages, total=total,
        action=action, entity_type=entity_type,
        user=user, date_from=date_from, date_to=date_to,
        total_all=total_all, adds=adds, edits=edits, deletes=deletes,
        active_users=active_users,
        action_labels=ACTION_LABELS,
        entity_labels=ENTITY_LABELS,
        action_colors=ACTION_COLORS,
    )
