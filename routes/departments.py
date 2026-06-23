from flask import Blueprint, flash, redirect, render_template, request, url_for

import db
from routes import login_required, super_admin_required

departments_bp = Blueprint('departments', __name__)


@departments_bp.route('/departments')
@login_required
@super_admin_required
def departments():
    conn = db.get_db()
    c = conn.cursor()
    c.execute('SELECT id, name, semesters, majors FROM departments ORDER BY name')
    departments = [dict(r) for r in c.fetchall()]
    conn.close()
    return render_template('departments/departments.html', departments=departments)


@departments_bp.route('/departments/create', methods=['POST'])
@login_required
@super_admin_required
def create_department():
    name = (request.form.get('name') or '').strip()
    semesters = request.form.get('semesters', type=int) or 0
    majors = request.form.get('majors', type=int) or 0
    if not name:
        flash('اسم القسم مطلوب.', 'danger')
        return redirect(url_for('departments.departments'))
    conn = db.get_db()
    conn.execute('INSERT INTO departments (name, semesters, majors) VALUES (?, ?, ?)',
                 (name, semesters, majors))
    conn.commit()
    flash('تم إضافة القسم بنجاح', 'success')
    return redirect(url_for('departments.departments'))


@departments_bp.route('/departments/<int:id>/edit', methods=['POST'])
@login_required
@super_admin_required
def edit_department(id):
    name = (request.form.get('name') or '').strip()
    semesters = request.form.get('semesters', type=int) or 0
    majors = request.form.get('majors', type=int) or 0
    if not name:
        flash('اسم القسم مطلوب.', 'danger')
        return redirect(url_for('departments.departments'))
    conn = db.get_db()
    conn.execute('UPDATE departments SET name=?, semesters=?, majors=? WHERE id=?',
                 (name, semesters, majors, id))
    conn.commit()
    flash('تم تحديث القسم بنجاح', 'success')
    return redirect(url_for('departments.departments'))


@departments_bp.route('/departments/<int:id>/delete', methods=['POST'])
@login_required
@super_admin_required
def delete_department(id):
    conn = db.get_db()
    conn.execute('DELETE FROM departments WHERE id=?', (id,))
    conn.commit()
    flash('تم حذف القسم بنجاح', 'success')
    return redirect(url_for('departments.departments'))