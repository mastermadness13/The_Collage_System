const deptMap = {'القسم العام':'d0','قسم الاتصالات':'d1','قسم الحاسوب':'d2','قسم المدني':'d3','قسم المعماري':'d4','قسم النفط':'d5'};
const deptColorIdx = {'القسم العام':0,'قسم الاتصالات':1,'قسم الحاسوب':2,'قسم المدني':3,'قسم المعماري':4,'قسم النفط':5};

let students = [
  {id:1,name:'أحمد محمد المصراتي',dept:'قسم الحاسوب',cls:'3'},
  {id:2,name:'فاطمة علي بلقاسم',dept:'قسم الاتصالات',cls:'2'},
  {id:3,name:'محمد سالم العريبي',dept:'القسم العام',cls:'1'},
  {id:4,name:'نورا خالد الزنتاني',dept:'قسم المعماري',cls:'4'},
  {id:5,name:'عبدالرحمن فوزي الشواشي',dept:'قسم المدني',cls:'2'},
  {id:6,name:'هند ناصر المنصوري',dept:'قسم الحاسوب',cls:'3'},
  {id:7,name:'يوسف عمر الفيتوري',dept:'قسم النفط',cls:'1'},
  {id:8,name:'مريم أحمد الطاهر',dept:'القسم العام',cls:'2'},
  {id:9,name:'خالد إبراهيم بن غشير',dept:'قسم الاتصالات',cls:'4'},
  {id:10,name:'سارة محمود الهاميسي',dept:'قسم الحاسوب',cls:'1'},
  {id:11,name:'عمر سعيد المسخوط',dept:'قسم المدني',cls:'3'},
  {id:12,name:'ليلى حسن أبو السعود',dept:'القسم العام',cls:'1'},
  {id:13,name:'إبراهيم عبدالله الغالي',dept:'قسم النفط',cls:'2'},
  {id:14,name:'آمنة يوسف أبو علي',dept:'قسم المعماري',cls:'3'},
  {id:15,name:'حسن محمد القذافي',dept:'قسم الحاسوب',cls:'4'},
  {id:16,name:'رانيا صالح الفلاح',dept:'قسم الاتصالات',cls:'1'},
  {id:17,name:'طارق علي الدرسي',dept:'القسم العام',cls:'3'},
  {id:18,name:'سمية عمر بن ناصر',dept:'قسم المدني',cls:'2'},
  {id:19,name:'وسام خالد المعتوق',dept:'قسم الحاسوب',cls:'2'},
  {id:20,name:'جنى أحمد الشريف',dept:'قسم النفط',cls:'4'},
  {id:21,name:'معاذ سالم الترهوني',dept:'القسم العام',cls:'1'},
  {id:22,name:'دينا محمود الكيش',dept:'قسم الاتصالات',cls:'3'},
  {id:23,name:'رائد فوزي بن عيسى',dept:'قسم المعماري',cls:'2'},
  {id:24,name:'لمى إبراهيم الزوي',dept:'قسم الحاسوب',cls:'5'},
];

let nextId = 100;
let deleteTargetId = null;
let currentView = 'table';

function getInitials(name){
  const parts = name.split(' ').filter(p=>p.length>2);
  return parts.length>=2 ? parts[0][0]+parts[1][0] : name.substring(0,2);
}

function getColorIdx(dept){return deptColorIdx[dept]||0;}
function getDeptClass(dept){return deptMap[dept]||'d0';}

function renderTable(list){
  const tbody = document.getElementById('studentsTableBody');
  document.getElementById('resultCount').textContent = list.length;
  if(!list.length){
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">لا توجد نتائج</div><div class="empty-state-sub">جرّب تغيير معايير البحث أو الفلترة</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = list.map((s,i)=>{
    const ci = getColorIdx(s.dept);
    const dc = getDeptClass(s.dept);
    const initials = getInitials(s.name);
    return `<tr>
      <td><span class="row-num">${i+1}</span></td>
      <td>
        <div class="student-cell">
          <div class="student-avatar a${ci}">${initials}</div>
          <div>
            <div class="student-name">${s.name}</div>
            <div class="student-id">ID: ${String(s.id).padStart(4,'0')}</div>
          </div>
        </div>
      </td>
      <td><span class="dept-badge ${dc}">${s.dept}</span></td>
      <td><span class="class-badge">الفصل ${s.cls}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-outline-primary" onclick="openEditModal(${s.id})">تعديل</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteTargetId=${s.id};confirmDelete()">حذف</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function renderCards(list){
  const grid = document.getElementById('studentsCardsGrid');
  document.getElementById('cardsResultCount').textContent = list.length;
  if(!list.length){
    grid.innerHTML = '<div style="grid-column:1/-1"><div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">لا توجد نتائج</div><div class="empty-state-sub">جرّب تغيير معايير البحث أو الفلترة</div></div></div>';
    return;
  }
  grid.innerHTML = list.map(s=>{
    const ci = getColorIdx(s.dept);
    return `<div class="student-card">
      <div class="student-card-accent c${ci}"></div>
      <div class="student-card-body">
        <div class="student-card-header">
          <div class="student-card-avatar a${ci}">${getInitials(s.name)}</div>
          <div>
            <div class="student-card-name">${s.name}</div>
            <div class="student-card-sub">ID: ${String(s.id).padStart(4,'0')}</div>
          </div>
        </div>
        <div class="student-card-info">
          <div class="student-card-row">
            <span class="student-card-row-label">🏛 القسم</span>
            <span class="student-card-row-value">${s.dept}</span>
          </div>
          <div class="student-card-row">
            <span class="student-card-row-label">📅 الفصل</span>
            <span class="student-card-row-value">الفصل ${s.cls}</span>
          </div>
        </div>
        <div class="student-card-footer">
          <button class="btn btn-outline-primary btn-sm" onclick="openEditModal(${s.id})">✏️ تعديل</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteTargetId=${s.id};confirmDelete()">🗑 حذف</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterStudents(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const dept = document.getElementById('deptFilter').value;
  const cls = document.getElementById('classFilter').value;
  let filtered = students.filter(s=>{
    const matchQ = !q || s.name.toLowerCase().includes(q);
    const matchDept = !dept || s.dept === dept;
    const matchCls = !cls || s.cls === cls;
    return matchQ && matchDept && matchCls;
  });
  renderTable(filtered);
  renderCards(filtered);
}

function resetFilters(){
  document.getElementById('searchInput').value = '';
  document.getElementById('deptFilter').value = '';
  document.getElementById('classFilter').value = '';
  filterStudents();
}

function switchView(view, btn){
  currentView = view;
  document.querySelectorAll('.view-toggle-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tableView').style.display = view==='table'?'':'none';
  document.getElementById('cardsView').style.display = view==='cards'?'':'none';
}

function updateStats(){
  document.getElementById('statTotal').textContent = students.length;
}

function openAddModal(){
  document.getElementById('addName').value = '';
  document.getElementById('addDept').value = 'القسم العام';
  document.getElementById('addClass').value = '1';
  document.getElementById('addModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeAddModal(){
  document.getElementById('addModal').classList.remove('show');
  document.body.style.overflow = '';
}

function addStudent(){
  const name = document.getElementById('addName').value.trim();
  const dept = document.getElementById('addDept').value;
  const cls = document.getElementById('addClass').value;
  if(!name){showToast('error','يرجى إدخال اسم الطالب');return;}
  students.push({id:nextId++, name, dept, cls});
  showToast('success','تم إضافة الطالب بنجاح');
  closeAddModal();
  updateStats();
  filterStudents();
}

function openEditModal(id){
  const s = students.find(x=>x.id===id);
  if(!s) return;
  document.getElementById('editId').value = s.id;
  document.getElementById('editModalMeta').textContent = s.name;
  document.getElementById('editName').value = s.name;
  document.getElementById('editDept').value = s.dept;
  document.getElementById('editClass').value = s.cls;
  document.getElementById('editModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeEditModal(){
  document.getElementById('editModal').classList.remove('show');
  document.body.style.overflow = '';
}

function saveEdit(){
  const id = parseInt(document.getElementById('editId').value);
  const name = document.getElementById('editName').value.trim();
  const dept = document.getElementById('editDept').value;
  const cls = document.getElementById('editClass').value;
  if(!name){showToast('error','يرجى إدخال اسم الطالب');return;}
  const idx = students.findIndex(s=>s.id===id);
  if(idx!==-1) students[idx] = {...students[idx], name, dept, cls};
  showToast('success','تم تعديل بيانات الطالب بنجاح');
  closeEditModal();
  filterStudents();
}

function confirmDelete(){
  document.getElementById('confirmOverlay').classList.add('show');
}
function closeConfirm(){
  document.getElementById('confirmOverlay').classList.remove('show');
}
function executeDelete(){
  if(deleteTargetId){
    const s = students.find(x=>x.id===deleteTargetId);
    students = students.filter(x=>x.id!==deleteTargetId);
    showToast('success',`تم حذف "${s?s.name:'الطالب'}" بنجاح`);
    deleteTargetId = null;
    closeConfirm();
    closeEditModal();
    updateStats();
    filterStudents();
  }
}

let toastTimer;
function showToast(type,msg){
  const t = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const m = document.getElementById('toastMsg');
  t.className = 'notification-toast '+type;
  m.textContent = msg;
  icon.textContent = type==='success'?'✓':type==='error'?'✕':'⚠';
  clearTimeout(toastTimer);
  requestAnimationFrame(()=>{t.classList.add('show');toastTimer=setTimeout(()=>t.classList.remove('show'),3500);});
}

window.addEventListener('scroll',()=>{
  document.getElementById('backToTop').classList.toggle('show',window.scrollY>300);
});

document.getElementById('addModal').addEventListener('click',function(e){if(e.target===this)closeAddModal();});
document.getElementById('editModal').addEventListener('click',function(e){if(e.target===this)closeEditModal();});
document.getElementById('confirmOverlay').addEventListener('click',function(e){if(e.target===this)closeConfirm();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('confirmOverlay').classList.contains('show'))closeConfirm();
    else if(document.getElementById('editModal').classList.contains('show'))closeEditModal();
    else if(document.getElementById('addModal').classList.contains('show'))closeAddModal();
  }
});

document.getElementById('globalSearch').addEventListener('input',function(){
  document.getElementById('searchInput').value = this.value;
  filterStudents();
});

filterStudents();
updateStats();
