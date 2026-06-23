
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let exams = [];
let currentWeek = 1;
let editingId = null;
let draggedId = null;
let deptList = [];
let roomsList = [];

const DAYS = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
const SEMS = ['1','2','3','4','5','6','7'];
const BAR_COLORS = ['#3d7fff','#0ecfe8','#f59e0b','#10b981','#a855f7','#ec4899','#f97316','#14b8a6'];

const DEPT_PALETTE = [
  { color:'var(--dept-cs)',    cls:'dept-cs'    },
  { color:'var(--dept-tele)',  cls:'dept-tele'  },
  { color:'var(--dept-oil)',   cls:'dept-oil'   },
  { color:'var(--dept-civil)', cls:'dept-civil' },
  { color:'var(--dept-gen)',   cls:'dept-gen'   },
];

/* ─── CSRF helper ─── */
function csrfToken(){
  const m = document.querySelector('meta[name="csrf-token"]');
  return m ? m.getAttribute('content') : '';
}

/* ═══════════════════════════════════════════
   API
═══════════════════════════════════════════ */
async function apiFetch(url, opts={}){
  opts.headers = opts.headers || {};
  opts.headers['X-CSRFToken'] = csrfToken();
  if(opts.body && typeof opts.body==='object' && !(opts.body instanceof FormData)){
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, opts);
  if(!res.ok){ const e=await res.json().catch(()=>({})); toast('⚠️', e.error||'خطأ في الاتصال'); throw new Error(e.error||'API error'); }
  return res.json();
}

async function fetchExams(deptFilter){
  let url = '/exam-schedule/api/exams';
  if(deptFilter) url += '?department='+encodeURIComponent(deptFilter);
  exams = await apiFetch(url);
}

async function fetchDepts(){
  const data = await apiFetch('/exam-schedule/api/departments');
  deptList = data;
}

async function fetchRooms(){
  const data = await apiFetch('/exam-schedule/api/rooms');
  roomsList = data;
}

/* ─── HALLS from API ─── */
let HALLS_DATA = [];
async function initHalls(){
  const data = await apiFetch('/exam-schedule/api/rooms');
  HALLS_DATA = data.map(r=>({ name: r.name, capacity: r.capacity, floor: 1 }));
}

/* ═══════════════════════════════════════════
   DEPT MAP (built dynamically)
═══════════════════════════════════════════ */
function getDeptInfo(dept){
  if(!dept) return { color:'var(--ink-200)', cls:'dept-gen' };
  const idx = deptList.findIndex(d=>d.name===dept);
  const palette = DEPT_PALETTE[idx % DEPT_PALETTE.length] || DEPT_PALETTE[0];
  return palette;
}
function deptCls(dept){ return getDeptInfo(dept).cls; }
function deptColor(dept){ return getDeptInfo(dept).color; }

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function t2m(t){ const [h,m]=t.split(':').map(Number); return h*60+m; }
function hasConflict(exam){
  return exams.some(e=>
    e.id!==exam.id && e.week==exam.week && e.day===exam.day && e.hall===exam.hall &&
    t2m(e.start)<t2m(exam.end) && t2m(e.end)>t2m(exam.start)
  );
}
function countConflicts(){
  return exams.filter(e=>hasConflict(e)).length;
}

/* ═══════════════════════════════════════════
   TAB SWITCH
═══════════════════════════════════════════ */
function switchTab(tab){
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>{
    n.classList.toggle('active', n.dataset.tab===tab);
  });
  const titles={
    dashboard:'📊 لوحة التحكم',
    matrix:'🗓️ الجدول الموحد',
    schedule:'📋 قائمة الامتحانات',
    timeline:'⏳ المخطط الزمني',
    halls:'🏛️ إدارة القاعات',
    ai:'🧠 التحسين الذكي'
  };
  document.getElementById('pageTitle').textContent = titles[tab]||tab;
  renderAll();
}

/* ═══════════════════════════════════════════
   WEEK
═══════════════════════════════════════════ */
function changeWeek(d){
  currentWeek = Math.max(1,Math.min(2,currentWeek+d));
  document.querySelectorAll('#weekLabel,#weekLabelMain,#matrixWeekLabel,#tlWeekLabel')
    .forEach(el=>{ if(el) el.textContent='الأسبوع '+currentWeek; });
  renderAll();
}

/* ═══════════════════════════════════════════
   RENDER ALL
═══════════════════════════════════════════ */
function renderAll(){
  renderStats();
  renderDays();
  renderRecent();
  renderScheduleTable();
  renderMatrix();
  renderTimeline();
  renderHalls();
}

/* ─── STATS ─── */
function renderStats(){
  const wExams = exams.filter(e=>e.week==currentWeek);
  const conflicts = countConflicts();
  const usedHalls = [...new Set(wExams.map(e=>e.hall))];
  document.getElementById('statExams').textContent = wExams.length;
  document.getElementById('statDepts').textContent = deptList.length;
  document.getElementById('statHalls').textContent = usedHalls.length;
  const db = document.getElementById('deptBadge');
  if(db) db.textContent = deptList.length + ' أقسام';
  document.getElementById('statConflicts').textContent = conflicts;
  document.getElementById('conflictBadge').textContent = conflicts+' تعارض';
  const s1=document.getElementById('sideStatExams');if(s1)s1.textContent=wExams.length;
  const s2=document.getElementById('sideStatHalls');if(s2)s2.textContent=usedHalls.length;
  const s3=document.getElementById('sideStatConflicts');if(s3)s3.textContent=conflicts;
  const badge = document.getElementById('conflictNavBadge');
  if(badge){ badge.textContent=conflicts; badge.style.display=conflicts>0?'':'none'; }
}

/* ─── DAYS GRID ─── */
function renderDays(){
  const wExams = exams.filter(e=>e.week==currentWeek);
  const container = document.getElementById('daysGrid');
  if(!container) return;
  container.innerHTML = DAYS.map(day=>{
    const de = wExams.filter(e=>e.day===day);
    const depts = [...new Set(de.map(e=>e.dept))];
    return `
      <div class="day-card ${de.length?'active-day':''}">
        <div class="day-name">${escapeHtml(day)}</div>
        <div class="day-count">${de.length}</div>
        <div class="day-sub">امتحان</div>
        <div class="day-dots">${depts.map(d=>`<div class="day-dot" style="background:${deptColor(d)}"></div>`).join('')}</div>
      </div>
    `;
  }).join('');
}

/* ─── RECENT EXAMS ─── */
function renderRecent(){
  const container = document.getElementById('recentExams');
  if(!container) return;
  const recent = [...exams].reverse().slice(0,6);
  if(!recent.length){ container.innerHTML='<div class="empty-state"><div class="es-icon">📭</div><div class="es-text">لا توجد امتحانات</div></div>'; return; }
  container.innerHTML = `
    <table class="data-table">
      <thead><tr>
        <th>المادة</th><th>القسم</th><th>اليوم</th><th>الوقت</th><th>القاعة</th><th>الفصل</th>
      </tr></thead>
      <tbody>${recent.map(e=>`
        <tr>
          <td><div class="cell-subject">
            <div class="subject-dot ${deptCls(e.dept)}">${escapeHtml(e.subject.charAt(0))}</div>
            <div><div class="subject-name">${escapeHtml(e.subject)}</div><div class="subject-meta">${e.type==='practical'?'عملي':'نظري'}</div></div>
          </div></td>
          <td><span class="dept-chip ${deptCls(e.dept)}">${escapeHtml(e.dept)}</span></td>
          <td>${escapeHtml(e.day)}</td>
          <td><span class="time-chip">${escapeHtml(e.start)}–${escapeHtml(e.end)}</span></td>
          <td>${escapeHtml(e.hall)}</td>
          <td><span style="color:var(--ink-400)">فصل ${escapeHtml(e.sem)}</span></td>
        </tr>
      `).join('')}</tbody>
    </table>
  `;
}

/* ─── SCHEDULE TABLE ─── */
function renderScheduleTable(){
  const tbody = document.getElementById('scheduleTable');
  const empty = document.getElementById('emptySchedule');
  if(!tbody) return;
  const q     = (document.getElementById('searchInput')?.value||'').toLowerCase();
  const fDept = document.getElementById('filterDept')?.value||'';
  const fDay  = document.getElementById('filterDay')?.value||'';
  const fSem  = document.getElementById('filterSem')?.value||'';

  let list = exams.filter(e=>e.week==currentWeek);
  if(q)     list = list.filter(e=>e.subject.toLowerCase().includes(q)||e.instructor?.toLowerCase().includes(q)||e.hall.toLowerCase().includes(q));
  if(fDept) list = list.filter(e=>e.dept===fDept);
  if(fDay)  list = list.filter(e=>e.day===fDay);
  if(fSem)  list = list.filter(e=>e.sem===fSem);

  if(!list.length){ tbody.innerHTML=''; empty.style.display=''; return; }
  empty.style.display='none';

  tbody.innerHTML = list.map((e,i)=>{
    const conflict = hasConflict(e);
    return `
      <tr class="draggable" draggable="true" ondragstart="onDragStart(event,${e.id})" ondragend="onDragEnd(event)">
        <td style="color:var(--ink-600)">${i+1}</td>
        <td><div class="cell-subject">
          <div class="subject-dot ${deptCls(e.dept)}">${escapeHtml(e.subject.charAt(0))}</div>
          <div><div class="subject-name">${escapeHtml(e.subject)}</div><div class="subject-meta">${e.type==='practical'?'عملي':'نظري'}</div></div>
        </div></td>
        <td><span class="dept-chip ${deptCls(e.dept)}">${escapeHtml(e.dept)}</span></td>
        <td style="color:var(--ink-400)">فصل ${escapeHtml(e.sem)}</td>
        <td><span style="font-size:0.72rem;color:${e.type==='practical'?'var(--teal)':'var(--ink-400)'}">${e.type==='practical'?'عملي ⚗️':'نظري 📖'}</span></td>
        <td>${escapeHtml(e.day)}</td>
        <td><span class="time-chip">${escapeHtml(e.start)}–${escapeHtml(e.end)}</span></td>
        <td>${escapeHtml(e.hall)}</td>
        <td style="color:var(--ink-400);font-size:0.78rem">${escapeHtml(e.instructor)||'—'}</td>
        <td>${escapeHtml(e.students)}</td>
        <td>${conflict?'<span class="status-conflict">⚠️ تعارض</span>':'<span class="status-ok">✓ سليم</span>'}</td>
        <td><div class="row-actions">
          <button class="act-btn" onclick="editExam(${e.id})">✏️</button>
          <button class="act-btn del" onclick="deleteExam(${e.id})">🗑️</button>
        </div></td>
      </tr>
    `;
  }).join('');
}

/* ─── MATRIX (signature element) ─── */
function renderMatrix(){
  const container = document.getElementById('matrixContainer');
  if(!container) return;
  const filterSem = document.getElementById('matrixFilterSem')?.value||'';
  let wExams = exams.filter(e=>e.week==currentWeek);
  if(filterSem) wExams = wExams.filter(e=>e.sem===filterSem);
  const depts = deptList.map(d=>d.name);

  let html = `<table class="matrix-table">
    <thead>
      <tr>
        <th class="matrix-th-left">القسم / الفصل</th>
        ${DAYS.map(d=>`<th class="matrix-th-day">${d}</th>`).join('')}
      </tr>
    </thead>
    <tbody>`;

  depts.forEach(dept=>{
    const dInfo = getDeptInfo(dept);
    const semsWithExams = filterSem ? [filterSem] : SEMS.filter(s=>wExams.some(e=>e.dept===dept&&e.sem===s));
    if(!semsWithExams.length && !filterSem) return;
    const rowSpan = filterSem ? 1 : Math.max(1, semsWithExams.length);

    if(filterSem){
      const sem = filterSem;
      html += `<tr>
        <td class="matrix-row-label" style="border-right:3px solid ${dInfo.color}">
          <div class="dept-label" style="color:${dInfo.color}">${escapeHtml(dept)}</div>
          <div class="dept-sub">فصل ${escapeHtml(sem)}</div>
        </td>`;
      DAYS.forEach(day=>{
        const cellExams = wExams.filter(e=>e.dept===dept&&e.sem===sem&&e.day===day);
        html += `<td class="matrix-cell">`;
        cellExams.forEach(ex=>{
          const conflict = hasConflict(ex);
          html += `<div class="exam-pill ${ex.type} ${conflict?'has-conflict':''}" title="${escapeHtml(ex.subject)} — ${escapeHtml(ex.hall)}" onclick="editExam(${ex.id})">
            <div class="ep-name">${escapeHtml(ex.subject)}</div>
            <div class="ep-time">${escapeHtml(ex.start)}–${escapeHtml(ex.end)}</div>
            <div class="ep-hall">${escapeHtml(ex.hall)}</div>
          </div>`;
        });
        html += `</td>`;
      });
      html += `</tr>`;
    } else {
      semsWithExams.forEach((sem,si)=>{
        html += `<tr>`;
        if(si===0){
          html += `<td class="matrix-row-label" rowspan="${rowSpan}" style="border-right:3px solid ${dInfo.color}">
            <div class="dept-label" style="color:${dInfo.color}">${escapeHtml(dept)}</div>
            <div class="dept-sub">فصل ${escapeHtml(sem)}</div>
          </td>`;
        }
        DAYS.forEach(day=>{
          const cellExams = wExams.filter(e=>e.dept===dept&&e.sem===sem&&e.day===day);
          html += `<td class="matrix-cell">`;
          cellExams.forEach(ex=>{
            const conflict = hasConflict(ex);
            html += `<div class="exam-pill ${ex.type} ${conflict?'has-conflict':''}" title="${escapeHtml(ex.subject)} — ${escapeHtml(ex.hall)}" onclick="editExam(${ex.id})">
              <div class="ep-name">${escapeHtml(ex.subject)}</div>
              <div class="ep-time">${escapeHtml(ex.start)}–${escapeHtml(ex.end)}</div>
              <div class="ep-hall">${escapeHtml(ex.hall)}</div>
            </div>`;
          });
          html += `</td>`;
        });
        html += `</tr>`;
      });
    }
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

/* ─── TIMELINE ─── */
function renderTimeline(){
  const container = document.getElementById('timelineContainer');
  if(!container) return;
  const wExams = exams.filter(e=>e.week==currentWeek);
  const TL_START = 8*60, TL_END = 16*60, TL_RANGE = TL_END-TL_START;

  container.innerHTML = DAYS.map(day=>{
    const de = wExams.filter(e=>e.day===day).sort((a,b)=>t2m(a.start)-t2m(b.start));
    const bars = de.map((e,i)=>{
      const left = ((t2m(e.start)-TL_START)/TL_RANGE)*100;
      const width = ((t2m(e.end)-t2m(e.start))/TL_RANGE)*100;
      const deptNames = deptList.map(d=>d.name);
      const color = BAR_COLORS[deptNames.indexOf(e.dept) % BAR_COLORS.length];
      return `<div class="tl-bar" style="right:${left}%;width:${width}%;background:${color}30;border:1px solid ${color}60;color:${color}" title="${escapeHtml(e.subject)} ${escapeHtml(e.start)}–${escapeHtml(e.end)}">${escapeHtml(e.subject)}</div>`;
    }).join('');
    return `<div class="tl-row">
      <div class="tl-day-label">${day}</div>
      <div class="tl-track">${bars}${!de.length?'<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:var(--ink-600)">لا امتحانات</span>':''}</div>
    </div>`;
  }).join('');
}

/* ─── HALLS ─── */
function renderHalls(){
  const container = document.getElementById('hallsGrid');
  if(!container) return;
  const wExams = exams.filter(e=>e.week==currentWeek);
  container.innerHTML = HALLS_DATA.map(hall=>{
    const hExams = wExams.filter(e=>e.hall===hall.name);
    const util = Math.min(100, Math.round((hExams.length/5)*100));
    const utilColor = util>80?'var(--rose)':util>50?'var(--amber)':'var(--green)';
    return `
      <div class="hall-card">
        <div class="hall-card-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="hall-icon">🏛️</div>
            <div><div class="hall-name">${escapeHtml(hall.name)}</div><div class="hall-floor">الطابق ${escapeHtml(hall.floor)}</div></div>
          </div>
          <span class="hall-cap">${escapeHtml(hall.capacity)} مقعد</span>
        </div>
        <div class="hall-util-label"><span>الإشغال</span><span style="color:${utilColor}">${util}%</span></div>
        <div class="hall-util-bar"><div class="hall-util-fill" style="width:${util}%;background:${utilColor}"></div></div>
        <div class="hall-exam-list">${hExams.length?hExams.map(e=>`
          <div class="hall-exam-item">
            <span class="hei-name">${escapeHtml(e.subject)}</span>
            <span class="hei-meta">${escapeHtml(e.day)} ${escapeHtml(e.start)}</span>
          </div>
        `).join(''):'<div style="text-align:center;padding:8px;font-size:0.72rem;color:var(--ink-600)">لا توجد امتحانات</div>'}</div>
      </div>
    `;
  }).join('');
}

/* ═══════════════════════════════════════════
   MODAL
═══════════════════════════════════════════ */
function openModal(id=null){
  editingId = id;
  document.getElementById('modalTitle').textContent = id ? '✏️ تعديل الامتحان' : '✚ إضافة امتحان جديد';
  document.getElementById('conflictAlert').classList.remove('visible');

  if(id){
    const e = exams.find(x=>x.id===id);
    if(!e) return;
    document.getElementById('fSubject').value    = e.subject;
    document.getElementById('fDept').value       = e.dept;
    document.getElementById('fSem').value        = e.sem;
    document.getElementById('fType').value       = e.type;
    document.getElementById('fDay').value        = e.day;
    document.getElementById('fWeek').value       = e.week;
    document.getElementById('fStart').value      = e.start;
    document.getElementById('fEnd').value        = e.end;
    document.getElementById('fHall').value       = e.hall;
    document.getElementById('fStudents').value   = e.students;
    document.getElementById('fInstructor').value = e.instructor||'';
  } else {
    document.getElementById('fSubject').value    = '';
    document.getElementById('fInstructor').value = '';
    document.getElementById('fStudents').value   = '';
    document.getElementById('fWeek').value       = currentWeek;
  }
  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('fSubject').focus();
}

function closeModal(){
  document.getElementById('modalBackdrop').classList.remove('open');
}
function handleBackdropClick(e){
  if(e.target===document.getElementById('modalBackdrop')) closeModal();
}

/* ─── Populate form selects ─── */
function populateSelects(){
  // Dept select in modal
  const fDept = document.getElementById('fDept');
  if(fDept){
    fDept.innerHTML = deptList.map(d=>`<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`).join('');
  }
  // Dept filter in schedule table
  const filterDept = document.getElementById('filterDept');
  if(filterDept){
    filterDept.innerHTML = '<option value="">كل الأقسام</option>' +
      deptList.map(d=>`<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`).join('');
  }
  // Room select in modal
  const fHall = document.getElementById('fHall');
  if(fHall){
    fHall.innerHTML = roomsList.map(r=>`<option value="${escapeHtml(r.name)}">${escapeHtml(r.name)} (${escapeHtml(r.capacity)} مقعد)</option>`).join('');
  }
}

async function saveExam(){
  const subject    = document.getElementById('fSubject').value.trim();
  const dept       = document.getElementById('fDept').value;
  const sem        = document.getElementById('fSem').value;
  const type       = document.getElementById('fType').value;
  const day        = document.getElementById('fDay').value;
  const week       = parseInt(document.getElementById('fWeek').value);
  const start      = document.getElementById('fStart').value;
  const end        = document.getElementById('fEnd').value;
  const hall       = document.getElementById('fHall').value;
  const students   = parseInt(document.getElementById('fStudents').value)||0;
  const instructor = document.getElementById('fInstructor').value.trim();

  if(!subject){ toast('⚠️','اسم المادة مطلوب'); return; }
  if(!start||!end){ toast('⚠️','الوقت مطلوب'); return; }
  if(t2m(end)<=t2m(start)){ toast('⚠️','وقت الانتهاء يجب أن يكون بعد وقت البدء'); return; }

  // Local conflict check before saving
  const tempExam = { id: editingId||Date.now(), subject, dept, sem, type, day, week, start, end, hall, students, instructor };
  const conflictCheck = exams.some(e=>
    e.id!==tempExam.id && e.week==tempExam.week && e.day===tempExam.day && e.hall===tempExam.hall &&
    t2m(e.start)<t2m(tempExam.end) && t2m(e.end)>t2m(tempExam.start)
  );
  if(conflictCheck){
    const ca = document.getElementById('conflictAlert');
      document.getElementById('conflictMsg').textContent = `تعارض: القاعة ${escapeHtml(hall)} محجوزة يوم ${escapeHtml(day)} في هذا الوقت!`;
    ca.classList.add('visible');
    return;
  }

  try {
    if(editingId){
      await apiFetch('/exam-schedule/api/exams/'+editingId, {
        method: 'PUT',
        body: { subject, dept, sem, type, day, week, start, end, hall, students, instructor },
      });
      toast('✅','تم تعديل الامتحان');
    } else {
      await apiFetch('/exam-schedule/api/exams', {
        method: 'POST',
        body: { subject, dept, sem, type, day, week, start, end, hall, students, instructor },
      });
      toast('✅','تم إضافة الامتحان');
    }
    closeModal();
    await refreshExams();
    renderAll();
  } catch(e){ /* toast already shown */ }
}

function editExam(id){
  openModal(id);
}

async function deleteExam(id){
  try {
    await apiFetch('/exam-schedule/api/exams/'+id, { method: 'DELETE' });
    toast('🗑️','تم حذف الامتحان');
    await refreshExams();
    renderAll();
  } catch(e){ /* toast already shown */ }
}

/* ═══════════════════════════════════════════
   DRAG & DROP
═══════════════════════════════════════════ */
function onDragStart(evt,id){
  draggedId=id;
  evt.target.classList.add('dragging');
  evt.dataTransfer.effectAllowed='move';
}
function onDragEnd(evt){
  evt.target.classList.remove('dragging');
  draggedId=null;
  document.getElementById('dropZone').classList.remove('drag-over');
}
function handleDropDelete(evt){
  evt.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  if(draggedId){ deleteExam(draggedId); draggedId=null; }
}

/* ═══════════════════════════════════════════
   AI TOOLS
═══════════════════════════════════════════ */
function detectConflicts(){
  const conflicts=[];
  exams.forEach(exam=>{
    if(hasConflict(exam)){
      const other=exams.find(e=>e.id!==exam.id&&e.week==exam.week&&e.day===exam.day&&e.hall===exam.hall&&t2m(e.start)<t2m(exam.end)&&t2m(e.end)>t2m(exam.start));
      if(other) conflicts.push(`${exam.subject} ↔ ${other.subject} (${exam.day} - ${exam.hall})`);
    }
  });
  logAI('🔍','كشف التعارضات', conflicts.length?`اكتشف ${conflicts.length} تعارض: ${conflicts.join('، ')}`:'الجدول سليم — لا توجد تعارضات ✅');
  toast(conflicts.length?'⚠️':'✅', conflicts.length?`${conflicts.length} تعارض مكتشف`:'لا توجد تعارضات');
  renderAll();
}

function optimizeSchedule(){
  let n=0;
  exams.forEach(exam=>{
    if(hasConflict(exam)){
      const free=HALLS_DATA.filter(h=>!exams.some(e=>e.id!==exam.id&&e.week==exam.week&&e.day===exam.day&&e.hall===h.name&&t2m(e.start)<t2m(exam.end)&&t2m(e.end)>t2m(exam.start)));
      if(free.length){ exam.hall=free[0].name; n++; }
    }
  });
  logAI('⚡','تحسين الجدول', n?`أُعيد توزيع ${n} امتحان بنجاح`:'الجدول محسّن بالفعل');
  toast('✨', n?`تم تحسين ${n} امتحان`:'الجدول مثالي');
  renderAll();
}

function autoAssignHalls(){
  let n=0;
  exams.forEach(exam=>{
    const best=HALLS_DATA.filter(h=>h.capacity>=exam.students).sort((a,b)=>a.capacity-b.capacity)[0];
    if(best&&exam.hall!==best.name){
      const ok=!exams.some(e=>e.id!==exam.id&&e.week==exam.week&&e.day===exam.day&&e.hall===best.name&&t2m(e.start)<t2m(exam.end)&&t2m(e.end)>t2m(exam.start));
      if(ok){ exam.hall=best.name; n++; }
    }
  });
  logAI('📊','توزيع القاعات', n?`تم تحسين ${n} قاعة`:'التوزيع مثالي');
  toast('📊', n?`تم تحسين ${n} قاعة`:'التوزيع مثالي');
  renderAll();
}

function logAI(icon,title,msg){
  const log=document.getElementById('aiLog');
  const empty=log.querySelector('.empty-state');
  if(empty) log.innerHTML='';
  const el=document.createElement('div');
  el.className='ai-log-item';
  el.innerHTML=`
    <div class="ai-log-header">
      <span>${icon}</span>
      <span class="ai-log-name">${escapeHtml(title)}</span>
      <span class="ai-log-time">${escapeHtml(new Date().toLocaleTimeString('ar'))}</span>
    </div>
    <div class="ai-log-msg">${escapeHtml(msg)}</div>
  `;
  log.prepend(el);
}

/* ═══════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════ */
function exportCSV(){
  const hdr=['المادة','القسم','الفصل','النوع','اليوم','الأسبوع','البدء','النهاية','القاعة','المحاضر','الطلاب'];
  const rows=exams.map(e=>[e.subject,e.dept,e.sem,e.type,e.day,e.week,e.start,e.end,e.hall,e.instructor||'',e.students]);
  const csv='\uFEFF'+[hdr,...rows].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download=`examflow_week${currentWeek}.csv`;
  a.click();
  toast('📎','تم التصدير');
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
function toast(icon,msg){
  const stack=document.getElementById('toastStack');
  const el=document.createElement('div');
  el.className='toast';
  el.innerHTML=`<span class="toast-icon">${icon}</span><span>${escapeHtml(msg)}</span>`;
  stack.appendChild(el);
  setTimeout(()=>el.remove(),3000);
}

/* ═══════════════════════════════════════════
   REFRESH
═══════════════════════════════════════════ */
async function refreshExams(){
  const activeDept = typeof ACTIVE_DEPT !== 'undefined' ? ACTIVE_DEPT : '';
  await fetchExams();
  // Apply initial department filter if set
  if(activeDept){
    const filterDept = document.getElementById('filterDept');
    if(filterDept) filterDept.value = activeDept;
  }
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
(async function init(){
  await Promise.all([
    fetchDepts(),
    fetchRooms(),
  ]);
  HALLS_DATA = roomsList.map(r=>({ name: r.name, capacity: r.capacity, floor: 1 }));
  populateSelects();
  await refreshExams();
  renderAll();
})();

