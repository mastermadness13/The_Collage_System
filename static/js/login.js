function togglePass() {
  const p = document.getElementById('password');
  const btn = document.getElementById('togglePassword');
  const lbl = document.getElementById('toggleLabel');
  if (p.type === 'password') {
    p.type = 'text';
    btn.classList.add('active');
    lbl.textContent = 'إخفاء';
  } else {
    p.type = 'password';
    btn.classList.remove('active');
    lbl.textContent = 'إظهار';
  }
}

function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if (!u || !p) {
    showToast('error', 'يرجى ملء جميع الحقول');
    return false;
  }
  showToast('success', 'جاري تسجيل الدخول...');
  setTimeout(() => {
    showToast('success', 'مرحباً بك، ' + u + '!');
  }, 1500);
  return false;
}

let toastTimer;
function showToast(type, msg) {
  const t = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const m = document.getElementById('toastMsg');
  t.className = 'notification-toast ' + type;
  m.textContent = msg;
  icon.textContent = type === 'success' ? '✓' : '✕';
  clearTimeout(toastTimer);
  requestAnimationFrame(() => {
    t.classList.add('show');
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
    document.getElementById('loginForm').requestSubmit();
  }
});