import csv
from io import StringIO

from flask import Blueprint, Response, flash, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

import db
from routes import login_required, super_admin_required

users_bp = Blueprint('users', __name__)


def _departments(conn):
    return conn.execute('SELECT * FROM departments ORDER BY name').fetchall()


def _sync_session_user(conn, user_id):
    refreshed = conn.execute(
        'SELECT username, role, label, department_id FROM users WHERE id = ?',
        (user_id,),
    ).fetchone()
    if not refreshed:
        return
    session['username'] = refreshed['username']
    session['role'] = refreshed['role']
    session['label'] = refreshed['label']
    if refreshed['role'] == 'head_of_department' and refreshed['department_id'] is not None:
        session['department_id'] = refreshed['department_id']
    else:
        session.pop('department_id', None)


@users_bp.route('/users')
@login_required
@super_admin_required
def list_users():
    conn = db.get_db()
    users = conn.execute(
        '''
        SELECT u.*, d.name AS department_name
        FROM users u
        LEFT JOIN departments d ON d.id = u.department_id
        ORDER BY u.username
        '''
    ).fetchall()
    return render_template('users/Users.html', users=users)


@users_bp.route('/users/export')
@login_required
@super_admin_required
def export_users():
    conn = db.get_db()
    rows = conn.execute(
        '''
        SELECT u.id, u.username, u.role, u.label, d.name AS department_name, u.created_at
        FROM users u
        LEFT JOIN departments d ON d.id = u.department_id
        ORDER BY u.username
        '''
    ).fetchall()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['id', 'username', 'role', 'label', 'department', 'created_at'])
    for row in rows:
        writer.writerow([row['id'], row['username'], row['role'], row['label'], row['department_name'] or '', row['created_at']])
    return Response(
        output.getvalue(),
        mimetype='text/csv; charset=utf-8',
        headers={'Content-Disposition': 'attachment; filename=users.csv'},
    )


@users_bp.route('/users/create', methods=['GET', 'POST'])
@login_required
@super_admin_required
def create_user():
    conn = db.get_db()
    departments = _departments(conn)
    is_modal = request.values.get('modal') in {'1', 'true', 'True'}
    selected_department_id = request.args.get('department_id', type=int) or request.values.get('department_id', type=int)
    default_label = None
    if selected_department_id:
        dept = conn.execute('SELECT name FROM departments WHERE id = ?', (selected_department_id,)).fetchone()
        default_label = dept['name'] if dept else None

    if request.method == 'POST':
        username = (request.form.get('username') or '').strip()
        password = request.form.get('password') or ''
        password_confirm = request.form.get('password_confirm') or ''
        role = request.form.get('role') or ''
        label = (request.form.get('label') or '').strip()
        department_id = request.form.get('department_id', type=int)

        if not username:
            flash('اسم المستخدم مطلوب.', 'danger')
        elif role not in {'super_admin', 'head_of_department', 'head_of_exams', 'teacher', 'student'}:
            flash('الدور المحدد غير صحيح.', 'danger')
        elif len(password) < 6:
            flash('كلمة المرور يجب أن تكون 6 أحرف على الأقل.', 'danger')
        elif password != password_confirm:
            flash('كلمة المرور وتأكيدها غير متطابقين.', 'danger')
        elif role == 'head_of_department' and not department_id:
            flash('حسابات رئيس القسم يجب أن تكون مرتبطة بقسم.', 'danger')
        else:
            if role == 'super_admin':
                department_id = None
            if not label and department_id:
                dept_row = conn.execute('SELECT name FROM departments WHERE id = ?', (department_id,)).fetchone()
                label = dept_row['name'] if dept_row else username
            label = label or username
            try:
                conn.execute(
                    'INSERT INTO users (username, password, role, label, department_id) VALUES (?, ?, ?, ?, ?)',
                    (username, generate_password_hash(password), role, label, department_id),
                )
                conn.commit()
                flash('تم إضافة المستخدم بنجاح', 'success')
                if is_modal:
                    return render_template('timetable/modal_success.html', message='تم إضافة المستخدم بنجاح')
                return redirect(url_for('users.list_users'))
            except Exception as exc:
                flash(f'حدث خطأ أثناء إضافة المستخدم: {exc}', 'danger')

    return render_template(
        'users/create.html',
        departments=departments,
        is_modal=is_modal,
        hide_nav=is_modal,
        default_label=default_label,
        selected_department_id=selected_department_id,
    )


@users_bp.route('/users/<int:user_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_user(user_id):
    if session.get('role') != 'super_admin' and session.get('user_id') != user_id:
        flash('ليس لديك صلاحية تعديل هذا المستخدم.', 'danger')
        return redirect(url_for('dashboard.dashboard'))

    conn = db.get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        flash('المستخدم غير موجود', 'danger')
        return redirect(url_for('users.list_users') if session.get('role') == 'super_admin' else url_for('dashboard.dashboard'))

    departments = _departments(conn)
    if request.method == 'POST':
        username = (request.form.get('username') or '').strip()
        label = (request.form.get('label') or '').strip()
        if not username:
            flash('اسم المستخدم مطلوب.', 'danger')
            return render_template('users/edit.html', user=user, departments=departments)

        if session.get('role') == 'super_admin':
            role = request.form.get('role') or user['role']
            department_id = request.form.get('department_id', type=int)
            if role not in {'super_admin', 'head_of_department', 'head_of_exams', 'teacher', 'student'}:
                flash('الدور المحدد غير صحيح.', 'danger')
                return render_template('users/edit.html', user=user, departments=departments)
            if user['role'] == 'super_admin' and role != 'super_admin':
                count = conn.execute('SELECT COUNT(*) FROM users WHERE role = "super_admin"').fetchone()[0]
                if count <= 1:
                    flash('لا يمكن تغيير دور آخر مشرف عام.', 'danger')
                    return render_template('users/edit.html', user=user, departments=departments)
            if role == 'head_of_department' and not department_id:
                flash('حسابات رئيس القسم يجب أن تكون مرتبطة بقسم.', 'danger')
                return render_template('users/edit.html', user=user, departments=departments)
            if role == 'super_admin':
                department_id = None
            if not label and department_id:
                dept_row = conn.execute('SELECT name FROM departments WHERE id = ?', (department_id,)).fetchone()
                label = dept_row['name'] if dept_row else username
            conn.execute(
                'UPDATE users SET username = ?, role = ?, label = ?, department_id = ? WHERE id = ?',
                (username, role, label or username, department_id, user_id),
            )
        else:
            conn.execute(
                'UPDATE users SET username = ?, label = ? WHERE id = ?',
                (username, label or username, user_id),
            )
        conn.commit()
        if session.get('user_id') == user_id:
            _sync_session_user(conn, user_id)
        flash('تم تحديث بيانات المستخدم', 'success')
        return redirect(url_for('users.list_users') if session.get('role') == 'super_admin' else url_for('dashboard.dashboard'))

    return render_template('users/edit.html', user=user, departments=departments)


@users_bp.route('/users/<int:user_id>/delete', methods=['POST'])
@login_required
@super_admin_required
def delete_user(user_id):
    conn = db.get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        flash('المستخدم غير موجود.', 'danger')
        return redirect(url_for('users.list_users'))
    if user_id == session.get('user_id'):
        flash('لا يمكنك حذف حسابك الحالي.', 'danger')
        return redirect(url_for('users.list_users'))
    if user['role'] == 'super_admin':
        count = conn.execute('SELECT COUNT(*) FROM users WHERE role = "super_admin"').fetchone()[0]
        if count <= 1:
            flash('لا يمكن حذف آخر مشرف عام.', 'danger')
            return redirect(url_for('users.list_users'))
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    flash('تم حذف المستخدم', 'success')
    return redirect(url_for('users.list_users'))


@users_bp.route('/users/<int:user_id>/change_password', methods=['GET', 'POST'])
@login_required
def change_password(user_id):
    if session.get('role') != 'super_admin' and session.get('user_id') != user_id:
        flash('ليس لديك صلاحية تغيير كلمة المرور لهذا المستخدم.', 'danger')
        return redirect(url_for('dashboard.dashboard'))

    conn = db.get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        flash('المستخدم غير موجود', 'danger')
        return redirect(url_for('users.list_users') if session.get('role') == 'super_admin' else url_for('dashboard.dashboard'))

    if request.method == 'POST':
        current_password = request.form.get('current_password', '')
        password = request.form.get('password', '')
        password_confirm = request.form.get('password_confirm', '')
        is_self_change = session.get('user_id') == user_id
        if is_self_change and not check_password_hash(user['password'], current_password):
            flash('كلمة المرور الحالية غير صحيحة.', 'danger')
        elif len(password) < 6:
            flash('كلمة المرور يجب أن تكون 6 أحرف على الأقل.', 'danger')
        elif password != password_confirm:
            flash('كلمة المرور الجديدة وتأكيدها غير متطابقين.', 'danger')
        else:
            conn.execute('UPDATE users SET password = ? WHERE id = ?', (generate_password_hash(password), user_id))
            conn.commit()
            flash('تم تغيير كلمة المرور. لا يمكن عرض كلمة المرور الحالية لأنها محفوظة بشكل آمن.', 'success')
            if session.get('role') == 'super_admin' and not is_self_change:
                return redirect(url_for('users.list_users'))
            return redirect(url_for('dashboard.dashboard'))

    return render_template('users/change_password.html', user=user)
