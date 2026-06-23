from flask import Blueprint, render_template, request, session, redirect, url_for
from werkzeug.security import check_password_hash

import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard.dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        conn = db.get_db()
        user = conn.execute(
            'SELECT id, username, password, role, label, department_id FROM users WHERE username = ?',
            (username,)
        ).fetchone()
        conn.close()

        if not user:
            return render_template('auth/login.html', username_error='اسم المستخدم غير موجود', username_value=username, hide_flashes=True)

        if not check_password_hash(user['password'], password):
            return render_template('auth/login.html', password_error='كلمة المرور غير صحيحة', username_value=username, hide_flashes=True)

        session.clear()
        session.permanent = True
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['role'] = user['role']
        session['label'] = user['label']
        session['department_id'] = user['department_id']
        next_url = request.form.get('next') or request.args.get('next')
        if next_url and next_url.startswith('/'):
            return redirect(next_url)
        return redirect(url_for('dashboard.dashboard'))

    return render_template('auth/login.html', hide_flashes=True, next=request.args.get('next', ''))

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))