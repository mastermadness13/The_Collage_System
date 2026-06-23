"""Regression test: auth login no longer crashes with regenerate() error."""
import sys; sys.path.insert(0,'.')
from app import app
app.config['WTF_CSRF_ENABLED'] = False
app.config['SECRET_KEY'] = 'test'

with app.test_client() as c:
    # Test login page loads
    r = c.get('/login')
    assert r.status_code == 200
    print('PASS: GET /login = 200')

    # Test login with wrong password (previously would crash on session.regenerate())
    r2 = c.post('/login', data={
        'username': 'superadmin',
        'password': 'wrongpassword',
    })
    assert r2.status_code == 200, 'Wrong password POST failed: %d' % r2.status_code
    print('PASS: POST /login (bad pass) = 200')

    print('\nAll auth regression tests PASSED')
