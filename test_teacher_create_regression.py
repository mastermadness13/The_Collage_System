"""Regression test: teachers/create page doesn't crash with UndefinedError."""
import sys; sys.path.insert(0,'.')
from app import app
app.config['WTF_CSRF_ENABLED'] = False
with app.test_client() as c:
    with c.session_transaction() as sess:
        sess['user_id'] = 1
        sess['role'] = 'super_admin'
        sess['username'] = 'superadmin'

    r = c.get('/teachers/create')
    assert r.status_code == 200, 'GET /teachers/create failed: %d' % r.status_code
    html = r.data.decode('utf-8')
    assert 'UndefinedError' not in html, 'Template still crashes'
    assert 'name="name"' in html, 'Form field missing'
    print('PASS: GET /teachers/create = 200 OK')

    r2 = c.post('/teachers/create', data={'name': ''})
    assert r2.status_code in (200, 302), 'POST invalid failed: %d' % r2.status_code
    print('PASS: POST invalid = %d' % r2.status_code)

    r3 = c.post('/teachers/create', data={
        'name': 'Test Teacher', 'academic_number': '123', 'national_id': '456',
        'qualification': u'ماجستير', 'academic_rank': u'أستاذ مساعد',
        'classification': u'عضو هيئة تدريس قار', 'phone': '077',
        'department': u'قسم غير موجود', 'subject': '',
    })
    assert r3.status_code == 200, 'POST bad dept crashed: %d' % r3.status_code
    print('PASS: POST bad department = 200 (validation re-render)')

    print('\nAll regression tests PASSED')
