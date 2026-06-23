from functools import wraps
from flask import flash, g, redirect, request, session, url_for

import db


def _safe_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def is_super_admin():
    return current_role() == 'super_admin'


def history_actor():
    if hasattr(g, 'active_account') and g.active_account:
        return g.active_account['id'], g.active_account['username']
    return current_user_id(), session.get('username') or 'System'


def is_general_department(name):
    normalized = (name or '').strip()
    return normalized in {'القسم العام', 'General Department'} or 'العام' in normalized


def current_user_id():
    """Source of truth for the active user ID in the current request context."""
    if hasattr(g, 'active_account') and g.active_account:
        return _safe_int(g.active_account.get('id'))
    return None


def current_role():
    """Source of truth for the active role."""
    if hasattr(g, 'active_account') and g.active_account:
        return g.active_account.get('role')
    return None


def current_department_id():
    """Source of truth for the active department ID."""
    if hasattr(g, 'active_account') and g.active_account:
        return _safe_int(g.active_account.get('department_id'))
    return None


def current_department(conn=None):
    """Fetches the current user's department with request-level caching."""
    if 'current_dept_cached' not in g:
        department_id = current_department_id()
        if department_id is None:
            g.current_dept_cached = None
        else:
            connection = conn or db.get_db()
            g.current_dept_cached = connection.execute(
                'SELECT id, name, semesters FROM departments WHERE id = ?', (department_id,)
            ).fetchone()
    return g.current_dept_cached


def current_department_name(conn=None):
    department = current_department(conn)
    return department['name'] if department else None


def has_valid_department_access(conn=None):
    if current_role() != 'head_of_department':
        return True
    return current_department(conn) is not None


def clear_invalid_session():
    """Clears the session while preserving application settings and the account switcher wallet."""
    preserved = {
        'theme': session.get('theme'),
        'font_size': session.get('font_size'),
        'time_format': session.get('time_format'),
        'accounts': session.get('accounts'),
        'active_account_id': session.get('active_account_id'),
        '_permanent': session.get('_permanent'),
    }
    session.clear()
    for k, v in preserved.items():
        if v is not None:
            session[k] = v


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if current_user_id() is None:
            flash('يجب تسجيل الدخول أولاً.', 'danger')
            return redirect(url_for('auth.login', next=request.url))
        return view(*args, **kwargs)

    return wrapped


def role_required(*allowed_roles):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if current_role() not in allowed_roles:
                flash('ليس لديك صلاحية الوصول إلى هذه الصفحة.', 'danger')
                return redirect(url_for('dashboard.dashboard'))
            return view(*args, **kwargs)

        return wrapped

    return decorator


def super_admin_required(view):
    return role_required('super_admin')(view)


def courses_timetable_admin_required(view):
    return role_required('super_admin', 'head_of_department', 'head_of_exams')(view)

def head_of_department_required(view):
    return role_required('head_of_department', 'super_admin')(view)

def head_of_exams_required(view):
    return role_required('head_of_exams', 'super_admin')(view)

def teacher_required(view):
    return role_required('teacher', 'super_admin', 'head_of_department')(view)

def student_required(view):
    return role_required('student', 'super_admin')(view)
