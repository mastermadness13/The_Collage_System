function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getCSRFToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta && meta.content) return meta.content;
    const input = document.querySelector('input[name="csrf_token"]');
    if (input && input.value) return input.value;
    return null;
}

function buildHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = getCSRFToken();
    if (token) headers['X-CSRFToken'] = token;
    return headers;
}

const days = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
const periods = ['A','B','C'];

let entries = [];
let courses = [];
let teachers = [];
let rooms = [];
let deleteTargetId = null;
const colorMap = {};
let colorIdx = 0;
const deptSemesters = {};

function getColor(courseId) {
  if (!colorMap[courseId]) {
    colorIdx = (colorIdx % 7) + 1;
    colorMap[courseId] = colorIdx;
  }
  return colorMap[courseId];
}

async function loadDepartments() {
    try {
        const res = await fetch('/timetable/api/departments');
        if (!res.ok) throw new Error('Failed to load departments');
        const depts = await res.json();
        const select = document.getElementById('deptFilter');
        select.innerHTML = '';
        depts.forEach(d => {
            deptSemesters[d.id] = d.semesters || 8;
            select.innerHTML += `<option value="${d.id}">${escapeHtml(d.name)}</option>`;
        });
    } catch (err) {
        showToast('error', 'فشل تحميل الأقسام');
    }
}

async function loadReferenceData() {
  const deptId = document.getElementById('deptFilter').value;
  const deptParam = `?department_id=${deptId}`;

  try {
    const [coursesRes, teachersRes, roomsRes] = await Promise.all([
      fetch(`/timetable/api/courses${deptParam}`),
      fetch(`/timetable/api/teachers${deptParam}`),
      fetch(`/timetable/api/rooms${deptParam}`)
    ]);
    if (coursesRes.ok) courses = await coursesRes.json();
    if (teachersRes.ok) teachers = await teachersRes.json();
    if (roomsRes.ok) rooms = await roomsRes.json();
    setupSearchable('courseInput', 'courseList', 'courseId', courses);
    setupSearchable('teacherInput', 'teacherList', 'teacherId', teachers);
    setupSearchable('roomInput', 'roomList', 'roomId', rooms);
  } catch (err) {
    showToast('error', 'فشل تحميل البيانات المرجعية');
  }
}

function getActiveSemester() {
  const active = document.querySelector('.semester-pill.is-active input');
  return active ? active.value : '1';
}

async function loadEntries() {
  try {
    const semester = getActiveSemester();
    const params = new URLSearchParams({ semester });
    const deptFilter = document.getElementById('deptFilter');
    const deptId = deptFilter ? parseInt(deptFilter.value) : null;
    if (deptId && !isNaN(deptId)) {
      params.set('department_id', deptId);
    }
    const res = await fetch('/timetable/api/entries?' + params.toString());
    if (res.ok) entries = await res.json();
  } catch (err) {
    showToast('error', 'فشل تحميل الجدول');
  }
}

async function renderTimetable() {
  await loadEntries();
  const tbody = document.getElementById('timetableBody');
  tbody.innerHTML = '';
  const deptSel = document.getElementById('deptFilter');
  const deptName = deptSel ? deptSel.options[deptSel.selectedIndex].text : '';
  const semEl = document.querySelector('.semester-header .semester-title');
  if (semEl) {
    const s = getActiveSemester();
    semEl.innerHTML = `📖 الفصل الدراسي ${escapeHtml(s)} <span class="semester-badge" id="semesterCount">${escapeHtml(String(entries.length))} حصص</span>`;
  }

  days.forEach(day => {
    const tr = document.createElement('tr');
    const dayTd = document.createElement('td');
    dayTd.innerHTML = `<div class="day-label"><div class="day-label-icon">📅</div><span>${escapeHtml(day)}</span></div>`;
    tr.appendChild(dayTd);

    periods.forEach(period => {
      const td = document.createElement('td');
      td.dataset.day = day;
      td.dataset.period = period;

      const entry = entries.find(e => e.day === day && e.section === period);

      if (entry) {
        const color = getColor(entry.course_id);
        td.innerHTML = `
          <div class="schedule-item color-${color}" onclick="openModal(${entry.id})" title="انقر للتعديل">
            <div class="schedule-course">${escapeHtml(entry.course_name || '—')}</div>
            <div class="schedule-teacher">${escapeHtml(entry.teacher_name || '—')}</div>
            <div class="schedule-room">${escapeHtml(entry.room_name || '—')}</div>
            <div class="schedule-time">${escapeHtml(entry.start_time || '')} ← ${escapeHtml(entry.end_time || '')}</div>
            <div class="schedule-actions no-print">
              <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation();deleteTargetId=${entry.id};document.getElementById('confirmOverlay').classList.add('show')">حذف</button>
            </div>
          </div>
        `;
      } else {
        td.innerHTML = `
          <button type="button" class="empty-cell no-print" onclick="openModal(null,'${escapeHtml(day)}','${escapeHtml(period)}')" title="إضافة محاضرة">
            <span class="plus-icon">+</span>
          </button>
        `;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  document.getElementById('semesterCount').textContent = entries.length + ' حصص';
  document.getElementById('totalLectures').textContent = entries.length;

  // Update print header dynamically
  const deptText = deptSel ? deptSel.options[deptSel.selectedIndex].text : '';
  const sem = getActiveSemester();
  const phDept = document.getElementById('printDeptSemester');
  if (phDept) phDept.textContent = deptText + ' — الفصل الدراسي ' + sem;
  const phYear = document.getElementById('printAcademicYear');
  if (phYear) {
    const y = new Date().getFullYear();
    phYear.textContent = 'العام الجامعي ' + (y - 1) + '-' + y;
  }
}

function openModal(entryId, defaultDay, defaultPeriod) {
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const deleteBtn = document.getElementById('deleteBtn');
  const saveBtn = document.getElementById('saveBtn');
  document.getElementById('timetableForm').reset();
  document.getElementById('entryId').value = '';
  document.getElementById('courseId').value = '';
  document.getElementById('teacherId').value = '';
  document.getElementById('roomId').value = '';
  document.getElementById('courseInput').value = '';
  document.getElementById('teacherInput').value = '';
  document.getElementById('roomInput').value = '';
  document.getElementById('formStartTime').value = '';
  document.getElementById('formEndTime').value = '';

  if (entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    title.innerHTML = '✏️ تعديل المحاضرة';
    deleteBtn.style.display = 'inline-flex';
    saveBtn.innerHTML = '💾 حفظ التعديلات';
    deleteTargetId = entryId;
    document.getElementById('entryId').value = entry.id;
    document.getElementById('formDay').value = entry.day;
    document.getElementById('formSemester').value = entry.semester;
    document.getElementById('formPeriod').value = entry.section;
    document.getElementById('formStartTime').value = entry.start_time || '';
    document.getElementById('formEndTime').value = entry.end_time || '';
    document.getElementById('courseId').value = entry.course_id;
    document.getElementById('courseInput').value = entry.course_name || '';
    document.getElementById('teacherId').value = entry.teacher_id;
    document.getElementById('teacherInput').value = entry.teacher_name || '';
    document.getElementById('roomId').value = entry.room_id;
    document.getElementById('roomInput').value = entry.room_name || '';
  } else {
    title.innerHTML = '📝 إضافة محاضرة جديدة';
    deleteBtn.style.display = 'none';
    saveBtn.innerHTML = '💾 حفظ المحاضرة';
    if (defaultDay) document.getElementById('formDay').value = defaultDay;
    if (defaultPeriod) document.getElementById('formPeriod').value = defaultPeriod;
    const periodSel = document.getElementById('formPeriod');
    const opt = periodSel.options[periodSel.selectedIndex];
    document.getElementById('formStartTime').value = opt.dataset.start || '';
    document.getElementById('formEndTime').value = opt.dataset.end || '';
  }
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.body.style.overflow = '';
  closeAllSearchLists();
}

async function saveEntry(e) {
  if (e) e.preventDefault();
  const courseId = parseInt(document.getElementById('courseId').value);
  const teacherId = parseInt(document.getElementById('teacherId').value);
  const roomId = parseInt(document.getElementById('roomId').value);
  const day = document.getElementById('formDay').value;
  const semester = parseInt(document.getElementById('formSemester').value);
  const section = document.getElementById('formPeriod').value;
  const startTime = document.getElementById('formStartTime').value;
  const endTime = document.getElementById('formEndTime').value;
  const entryId = document.getElementById('entryId').value;
  const deptSel = document.getElementById('deptFilter');

  if (!courseId || !teacherId || !roomId) {
    showToast('error', 'يرجى اختيار المقرر والمحاضر والقاعة');
    return false;
  }

  const deptId = deptSel && deptSel.value !== 'all' ? parseInt(deptSel.value) : null;
  if (deptId === null || isNaN(deptId)) {
    showToast('error', 'يرجى اختيار قسم محدد أولاً');
    return false;
  }

  const payload = {
    day, semester, section, course_id: courseId, teacher_id: teacherId, room_id: roomId,
    start_time: startTime, end_time: endTime,
    department_id: deptId
  };

  try {
    let res;
    if (entryId) {
      res = await fetch('/timetable/api/entries/' + entryId, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch('/timetable/api/entries', {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload)
      });
    }
    if (!res.ok) {
      const errData = await res.json();
      showToast('error', errData.error || 'فشل الحفظ');
      return false;
    }
    showToast('success', entryId ? 'تم تعديل المحاضرة بنجاح' : 'تم إضافة المحاضرة بنجاح');
  } catch (err) {
    showToast('error', 'فشل الاتصال بالخادم');
    return false;
  }

  closeModal();
  renderTimetable();
  return false;
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('show');
}

async function executeDelete() {
  if (!deleteTargetId) return;
  try {
    const res = await fetch('/timetable/api/entries/' + deleteTargetId, { method: 'DELETE', headers: buildHeaders() });
    if (!res.ok) {
      showToast('error', 'فشل الحذف');
      return;
    }
    showToast('success', 'تم حذف المحاضرة بنجاح');
  } catch (err) {
    showToast('error', 'فشل الاتصال بالخادم');
    return;
  }
  deleteTargetId = null;
  closeConfirm();
  closeModal();
  renderTimetable();
}

function setupSearchable(inputId, listId, hiddenId, data) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  const hidden = document.getElementById(hiddenId);
  if (!input || !list || !hidden) return;

  input.addEventListener('focus', () => {
    renderList(input.value);
    list.classList.add('show');
  });
  input.addEventListener('input', () => {
    hidden.value = '';
    renderList(input.value);
    list.classList.add('show');
  });

  function renderList(query) {
    const filtered = data.filter(item => (item.name || '').includes(query));
    list.innerHTML = filtered.length
      ? filtered.map(item => `<div class="searchable-item" data-id="${item.id}" data-name="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>`).join('')
      : '<div class="searchable-item" style="color:var(--text-muted);cursor:default">لا توجد نتائج</div>';
    list.querySelectorAll('.searchable-item[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        input.value = el.dataset.name;
        hidden.value = el.dataset.id;
        list.classList.remove('show');
      });
    });
  }

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove('show');
    }
  });
}

function closeAllSearchLists() {
  document.querySelectorAll('.searchable-list').forEach(l => l.classList.remove('show'));
}

document.getElementById('formPeriod').addEventListener('change', function() {
  const opt = this.options[this.selectedIndex];
  document.getElementById('formStartTime').value = opt.dataset.start || '';
  document.getElementById('formEndTime').value = opt.dataset.end || '';
});

let toastTimer;
function showToast(type, msg) {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');
  toast.className = 'notification-toast ' + type;
  msgEl.textContent = msg;
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠';
  clearTimeout(toastTimer);
  requestAnimationFrame(() => {
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  });
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeBtn === theme);
  });
  localStorage.setItem('theme', theme);
}

// sidebar removed — toggle logic no longer needed

document.getElementById('accountBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('accountDropdown').classList.toggle('show');
});
document.addEventListener('click', () => {
  document.getElementById('accountDropdown').classList.remove('show');
});

document.querySelectorAll('.semester-pill').forEach(pill => {
  pill.addEventListener('click', function(e) {
    const input = this.querySelector('input');
    if (e.target.tagName !== 'INPUT') {
      input.checked = !input.checked;
    }
    if (input.checked) {
      document.querySelectorAll('.semester-pill').forEach(p => p.classList.remove('is-active'));
      this.classList.add('is-active');
      document.querySelectorAll('.semester-pill input').forEach(cb => cb.checked = false);
      input.checked = true;
      renderTimetable();
    }
  });
});

window.addEventListener('scroll', () => {
  document.getElementById('backToTop').classList.toggle('show', window.scrollY > 300);
});

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('confirmOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeConfirm();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('confirmOverlay').classList.contains('show')) closeConfirm();
    else if (document.getElementById('modalOverlay').classList.contains('show')) closeModal();
  }
});

function updateSemesterPills() {
  const deptId = parseInt(document.getElementById('deptFilter').value);
  const max = deptSemesters[deptId] || 8;
  document.querySelectorAll('.semester-pill').forEach(pill => {
    const val = parseInt(pill.querySelector('input').value);
    pill.style.display = val <= max ? '' : 'none';
  });
  const active = document.querySelector('.semester-pill.is-active');
  if (!active || parseInt(active.querySelector('input').value) > max) {
    const first = document.querySelector('.semester-pill');
    if (first) {
      document.querySelectorAll('.semester-pill').forEach(p => p.classList.remove('is-active'));
      first.classList.add('is-active');
      first.querySelector('input').checked = true;
    }
  }
}

document.getElementById('deptFilter').addEventListener('change', async function() {
  updateSemesterPills();
  await loadReferenceData();
  await renderTimetable();
});

(async function init() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  await loadDepartments();
  updateSemesterPills();
  await loadReferenceData();
  await renderTimetable();
})();