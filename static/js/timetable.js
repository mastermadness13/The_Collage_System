
// ===== DATA =====
const days = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
const dayIcons = {'السبت':'📅','الأحد':'📅','الاثنين':'📅','الثلاثاء':'📅','الأربعاء':'📅','الخميس':'📅'};
const periods = ['A','B','C'];
const periodTimes = { A:'08:00 ← 10:00', B:'10:15 ← 12:15', C:'12:30 ← 14:30' };

const courses = [
  {id:1, name:'رسم هندسي'},
  {id:2, name:'رياضة 1'},
  {id:3, name:'اللغة الانجليزية'},
  {id:4, name:'فيزياء نظري'},
  {id:5, name:'فيزياء عملي'},
  {id:6, name:'كيمياء'},
  {id:7, name:'حاسب آلي ( عملي )'},
  {id:8, name:'حاسب آلي ( نظري )'},
  {id:9, name:'رياضة 2'},
  {id:10, name:'دوائر كهربائية'},
  {id:11, name:'إلكترونيات'},
  {id:12, name:'رياضيات هندسية'},
];

const teachers = [
  {id:1, name:'نادر الغالي'},
  {id:2, name:'غادة أبو السعود'},
  {id:3, name:'هاجر أبو علي'},
  {id:4, name:'نعيمة المسخوط'},
  {id:5, name:'فوزي أبو الشواشي'},
  {id:6, name:'أميرة أبو علي'},
  {id:7, name:'هناء الهاميسي'},
  {id:8, name:'هالا الهاميسي'},
  {id:9, name:'محمد الفيتوري'},
  {id:10, name:'سالم بن ناصر'},
];

const rooms = [
  {id:1, name:'قاعة 1'},
  {id:2, name:'قاعة 2'},
  {id:3, name:'قاعة 3'},
  {id:4, name:'قاعة 5'},
  {id:5, name:'قاعة 10'},
  {id:6, name:'قاعة 11'},
  {id:7, name:'قاعة 12'},
  {id:8, name:'معمل حاسوب 1'},
  {id:9, name:'معمل إلكترونيات 1'},
  {id:10, name:'مسرح'},
];

let entries = [
  {id:105, day:'الأحد', semester:1, period:'A', courseId:1, teacherId:1, roomId:6, startTime:'09:00', endTime:'11:00'},
  {id:178, day:'الأحد', semester:1, period:'B', courseId:1, teacherId:1, roomId:5, startTime:'11:00', endTime:'13:00'},
  {id:36, day:'الاثنين', semester:1, period:'A', courseId:2, teacherId:2, roomId:5, startTime:'09:00', endTime:'11:00'},
  {id:469, day:'الاثنين', semester:1, period:'B', courseId:3, teacherId:3, roomId:2, startTime:'09:00', endTime:'11:00'},
  {id:471, day:'الثلاثاء', semester:1, period:'A', courseId:4, teacherId:4, roomId:2, startTime:'09:00', endTime:'11:00'},
  {id:470, day:'الثلاثاء', semester:1, period:'B', courseId:5, teacherId:5, roomId:9, startTime:'11:00', endTime:'13:00'},
  {id:472, day:'الأربعاء', semester:1, period:'B', courseId:6, teacherId:6, roomId:2, startTime:'11:00', endTime:'13:00'},
  {id:473, day:'الخميس', semester:1, period:'A', courseId:7, teacherId:7, roomId:8, startTime:'09:00', endTime:'11:00'},
  {id:474, day:'الخميس', semester:1, period:'B', courseId:8, teacherId:8, roomId:10, startTime:'11:00', endTime:'13:00'},
  {id:475, day:'السبت', semester:1, period:'A', courseId:9, teacherId:9, roomId:3, startTime:'08:00', endTime:'10:00'},
];

let nextId = 500;
let deleteTargetId = null;
const colorMap = {};
let colorIdx = 0;

function getColor(courseId) {
  if (!colorMap[courseId]) {
    colorIdx = (colorIdx % 7) + 1;
    colorMap[courseId] = colorIdx;
  }
  return colorMap[courseId];
}

// ===== RENDER TIMETABLE =====
function renderTimetable() {
  const tbody = document.getElementById('timetableBody');
  tbody.innerHTML = '';

  days.forEach(day => {
    const tr = document.createElement('tr');

    // Day cell
    const dayTd = document.createElement('td');
    dayTd.innerHTML = `<div class="day-label"><div class="day-label-icon">📅</div><span>${day}</span></div>`;
    tr.appendChild(dayTd);

    periods.forEach(period => {
      const td = document.createElement('td');
      td.dataset.day = day;
      td.dataset.period = period;

      const entry = entries.find(e => e.day === day && e.period === period && e.semester === 1);

      if (entry) {
        const course = courses.find(c => c.id === entry.courseId);
        const teacher = teachers.find(t => t.id === entry.teacherId);
        const room = rooms.find(r => r.id === entry.roomId);
        const color = getColor(entry.courseId);

        td.innerHTML = `
          <div class="schedule-item color-${color}" onclick="openModal(${entry.id})" title="انقر للتعديل">
            <div class="schedule-course">${course ? course.name : '—'}</div>
            <div class="schedule-dept-label">القسم العام</div>
            <div class="schedule-teacher">${teacher ? teacher.name : '—'}</div>
            <div class="schedule-room">${room ? room.name : '—'}</div>
            <div class="schedule-time">${entry.startTime || ''} ← ${entry.endTime || ''}</div>
            <div class="schedule-actions no-print">
              <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation();deleteTargetId=${entry.id};confirmDelete()">حذف</button>
            </div>
          </div>
        `;
      } else {
        td.innerHTML = `
          <button type="button" class="empty-cell no-print" onclick="openModal(null,'${day}','${period}')" title="انقر لإضافة حصة">
            <span class="plus-icon">+</span>
            <span>إضافة حصة</span>
          </button>
        `;
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  // Update count
  const count = entries.filter(e => e.semester === 1).length;
  document.getElementById('semesterCount').textContent = count + ' حصص';
  document.getElementById('totalLectures').textContent = count;
}

// ===== MODAL =====
function openModal(entryId, defaultDay, defaultPeriod) {
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const deleteBtn = document.getElementById('deleteBtn');
  const saveBtn = document.getElementById('saveBtn');

  // Reset form
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

    title.innerHTML = '✏️ تعديل المحضرة';
    deleteBtn.style.display = 'inline-flex';
    saveBtn.innerHTML = '💾 حفظ التعديلات';
    deleteTargetId = entryId;

    document.getElementById('entryId').value = entry.id;
    document.getElementById('formDay').value = entry.day;
    document.getElementById('formSemester').value = entry.semester;
    document.getElementById('formPeriod').value = entry.period;
    document.getElementById('formStartTime').value = entry.startTime || '';
    document.getElementById('formEndTime').value = entry.endTime || '';

    const course = courses.find(c => c.id === entry.courseId);
    const teacher = teachers.find(t => t.id === entry.teacherId);
    const room = rooms.find(r => r.id === entry.roomId);

    document.getElementById('courseId').value = entry.courseId;
    document.getElementById('courseInput').value = course ? course.name : '';
    document.getElementById('teacherId').value = entry.teacherId;
    document.getElementById('teacherInput').value = teacher ? teacher.name : '';
    document.getElementById('roomId').value = entry.roomId;
    document.getElementById('roomInput').value = room ? room.name : '';
  } else {
    title.innerHTML = '📝 إضافة محضرة جديدة';
    deleteBtn.style.display = 'none';
    saveBtn.innerHTML = '💾 حفظ المحضرة';

    if (defaultDay) document.getElementById('formDay').value = defaultDay;
    if (defaultPeriod) document.getElementById('formPeriod').value = defaultPeriod;

    // Auto-fill times
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

// ===== SAVE =====
function saveEntry(e) {
  if (e) e.preventDefault();

  const courseId = parseInt(document.getElementById('courseId').value);
  const teacherId = parseInt(document.getElementById('teacherId').value);
  const roomId = parseInt(document.getElementById('roomId').value);
  const day = document.getElementById('formDay').value;
  const semester = parseInt(document.getElementById('formSemester').value);
  const period = document.getElementById('formPeriod').value;
  const startTime = document.getElementById('formStartTime').value;
  const endTime = document.getElementById('formEndTime').value;
  const entryId = document.getElementById('entryId').value;
  const force = document.getElementById('forceSave').checked;

  if (!courseId || !teacherId || !roomId) {
    showToast('error', 'يرجى اختيار المقرر المحاضر والقاعة');
    return false;
  }

  // Check conflicts
  if (!force) {
    const conflict = entries.find(e =>
      e.id !== parseInt(entryId) &&
      e.day === day &&
      e.semester === semester &&
      e.period === period
    );
    if (conflict) {
      const c = courses.find(c2 => c2.id === conflict.courseId);
      showToast('warning', `تعارض مع "${c ? c.name : ''}" في نفس الوقت. يمكنك تجاهل التعارضات.`);
      return false;
    }
  }

  if (entryId) {
    const idx = entries.findIndex(e2 => e2.id === parseInt(entryId));
    if (idx !== -1) {
      entries[idx] = { ...entries[idx], day, semester, period, courseId, teacherId, roomId, startTime, endTime };
    }
    showToast('success', 'تم تعديل المحضرة بنجاح');
  } else {
    entries.push({ id: nextId++, day, semester, period, courseId, teacherId, roomId, startTime, endTime });
    showToast('success', 'تم إضافة المحضرة بنجاح');
  }

  closeModal();
  renderTimetable();
  return false;
}

// ===== DELETE =====
function confirmDelete() {
  document.getElementById('confirmOverlay').classList.add('show');
}
function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('show');
}
function executeDelete() {
  if (deleteTargetId) {
    entries = entries.filter(e => e.id !== deleteTargetId);
    showToast('success', 'تم حذف المحضرة بنجاح');
    deleteTargetId = null;
    closeConfirm();
    closeModal();
    renderTimetable();
  }
}

// ===== SEARCHABLE DROPDOWNS =====
function setupSearchable(inputId, listId, hiddenId, data) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  const hidden = document.getElementById(hiddenId);

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
    const filtered = data.filter(item => item.name.includes(query));
    list.innerHTML = filtered.length
      ? filtered.map(item => `<div class="searchable-item" data-id="${item.id}" data-name="${item.name}">${item.name}</div>`).join('')
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

// Auto-fill times on period change
document.getElementById('formPeriod').addEventListener('change', function() {
  const opt = this.options[this.selectedIndex];
  document.getElementById('formStartTime').value = opt.dataset.start || '';
  document.getElementById('formEndTime').value = opt.dataset.end || '';
});

// ===== TOAST =====
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

// ===== THEME =====
function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeBtn === theme);
  });
  localStorage.setItem('theme', theme);
}

// ===== SIDEBAR TOGGLE =====
document.getElementById('sidebarToggle').addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    document.getElementById('appSidebar').classList.toggle('mobile-open');
  } else {
    document.body.classList.toggle('sidebar-collapsed');
  }
});

// ===== ACCOUNT DROPDOWN =====
document.getElementById('accountBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('accountDropdown').classList.toggle('show');
});
document.addEventListener('click', () => {
  document.getElementById('accountDropdown').classList.remove('show');
});

// ===== SEMESTER TOGGLE =====
function toggleSemester(cb) {
  cb.closest('.semester-pill').classList.toggle('is-active', cb.checked);
}

// ===== BACK TO TOP =====
window.addEventListener('scroll', () => {
  document.getElementById('backToTop').classList.toggle('show', window.scrollY > 300);
});

// ===== NAVIGATION =====
function navigateTo(page) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  event.currentTarget.classList.add('active');
  if (window.innerWidth <= 768) {
    document.getElementById('appSidebar').classList.remove('mobile-open');
  }
}

// ===== GLOBAL SEARCH =====
document.getElementById('globalSearch').addEventListener('input', function() {
  const q = this.value.trim().toLowerCase();
  if (!q) { renderTimetable(); return; }
  // Simple highlight: just filter visual
  document.querySelectorAll('.schedule-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.opacity = text.includes(q) ? '1' : '0.2';
  });
});

// ===== MODAL OVERLAY CLICK =====
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('confirmOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeConfirm();
});

// ===== KEYBOARD =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('confirmOverlay').classList.contains('show')) closeConfirm();
    else if (document.getElementById('modalOverlay').classList.contains('show')) closeModal();
  }
});

// ===== INIT =====
(function init() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  setupSearchable('courseInput', 'courseList', 'courseId', courses);
  setupSearchable('teacherInput', 'teacherList', 'teacherId', teachers);
  setupSearchable('roomInput', 'roomList', 'roomId', rooms);

  renderTimetable();
})();
