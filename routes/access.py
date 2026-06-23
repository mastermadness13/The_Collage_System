from functools import wraps

from flask import abort, request, session

from routes import current_department_id, current_department_name, current_role


def _safe_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def is_super_admin():
    return current_role() == 'super_admin'


def is_admin():
    return current_role() == 'head_of_department'

def is_head_of_exams():
    return current_role() == 'head_of_exams'

def is_teacher():
    return current_role() == 'teacher'

def is_student():
    return current_role() == 'student'


def department_id_allowed(department_id):
    if not is_admin():
        return True
    requested_id = _safe_int(department_id)
    curr_id = current_department_id()
    if requested_id is None or curr_id is None:
        return False
    return int(requested_id) == int(curr_id)


def department_name_allowed(department_name, conn=None):
    if not is_admin():
        return True
    current_name = current_department_name(conn)
    return bool(current_name and department_name == current_name)


def admin_department_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        # Super admins bypass department restrictions
        if not is_admin():
            return view(*args, **kwargs)

        department_id = (
            kwargs.get('department_id')
            or request.args.get('department_id')
            or request.form.get('department_id')
        )
        
        # If the user is a head_of_department but has no department, deny access
        if current_role() == 'head_of_department' and current_department_id() is None:
            abort(403)
            
        # If a specific department is being accessed, verify it matches the admin's department
        if department_id and not department_id_allowed(department_id):
            abort(403)
            
        return view(*args, **kwargs)

    return wrapped
