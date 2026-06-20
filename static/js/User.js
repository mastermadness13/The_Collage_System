const departments = ['القسم العام','قسم الاتصالات','قسم الحاسوب','قسم المدني','قسم المعماري','قسم النفط','قسم البحث والتطوير'];

let users = [
  {id:1,username:'superadmin',label:'General Department',role:'super_admin',dept:'',created:'2024-09-01'},
  {id:2,username:'ahmed_trips',label:'أحمد المصراتي',role:'admin',dept:'قسم الحاسوب',created:'2024-09-15'},
  {id:3,username:'salem_m',label:'سالم المنصوري',role:'super_admin',dept:'',created:'2024-09-20'},
  {id:4,username:'mohammed_a',label:'محمد العريبي',role:'admin',dept:'قسم الاتصالات',created:'2024-10-01'},
  {id:5,username:'hind_b',label:'هند بلقاسم',role:'admin',dept:'قسم المدني',created:'2024-10-10'},
  {id:6,username:'najla_b',label:'نجلاء بن غشير',role:'admin',dept:'قسم المعماري',created:'2024-10-15'},
  {id:7,username:'khaled_f',label:'خالد الفيتوري',role:'admin',dept:'قسم النفط',created:'2024-11-01'},
  {id:8,username:'fatima_t',label:'فاطمة الطاهر',role:'admin',dept:'قسم البحث والتطوير',created:'2024-12-01'},
];

let nextId = 100;
let deleteTargetId = null;
let openMenuId = null;

function getAvatarClass(id){return 'a'+(id%7);}
function getInitial(name){return name.charAt(0).toUpperCase();}
function getRoleLabel(role){return role==='super_admin'?'<span class="role-pill super">مشرف عام</span>':'<span class="role-pill admin">أدمن قسم</span>';}
function getDeptDisplay(dept){return dept?`<span class="dept-badge">${dept}</span>`:'<span style="color:var(--text-muted);font-size:12px">غير مرتبط</span>';}

function renderUsers(list){
  const tbody = document.getElementById('usersTableBody');
  document.getElementById('resultCount').textContent = list.length;
  if(!list.length){
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">لا توجد نتائج</div><div class="empty-state-sub">جرّب تغيير معايير البحث أو الفلترة</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = list.map((u,i)=>`
    <tr>
      <td><span class="row-num">${i+1}</span></td>
      <td>
        <div class="user-cell">
          <div class="table-avatar ${getAvatarClass(u.id)}">${getInitial(u.label)}</div>
          <div>
            <div class="user-name">${u.label}</div>
            <div class="user-label">@${u.username}</div>
          </div>
        </div>
      </td>
      <td>${getDeptDisplay(u.dept)}</td>
      <td>${getRoleLabel(u.role)}</td>
      <td><span class="date-cell">${u.created}</span></td>
      <td>
        <div class="actions-cell">
          <div class="action-dropdown">
            <button class="btn btn-sm btn-outline-secondary action-trigger" onclick="toggleMenu(event,${u.id})">⋮ إجراءات</button>
            <div class="action-menu" id="menu-${u.id}">
              <a class="action-link" onclick="openEditModal(${u.id})">✏️ تعديل البيانات</a>
              <a class="action-link" onclick="openPassModal(${u.id})">🔐 إعادة تعيين كلمة المرور</a>
              <div class="action-divider"></div>
              <a class="action-link danger" onclick="deleteTargetId=${u.id};confirmDelete()">🗑 حذف المستخدم</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('');
}

function toggleMenu(e,id){
  e.stopPropagation();
  const menu = document.getElementById('menu-'+id);
  const wasOpen = menu.classList.contains('show');
  document.querySelectorAll('.action-menu.show').forEach(m=>m.classList.remove('show'));
  if(!wasOpen) menu.classList.add('show');
  openMenuId = wasOpen?null:id;
}

document.addEventListener('click',()=>{
  document.querySelectorAll('.action-menu.show').forEach(m=>m.classList.remove('show'));
  openMenuId = null;
});

function filterUsers(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const role = document.getElementById('roleFilter').value;
  const dept = document.getElementById('deptFilter').value;
  let filtered = users.filter(u=>{
    const matchQ = !q || u.username.toLowerCase().includes(q) || u.label.toLowerCase().includes(q);
    const matchRole = !role || u.role === role;
    const matchDept = !dept || u.dept === dept;
    return matchQ && matchRole && matchDept;
  });
  renderUsers(filtered);
}

function resetFilters(){
  document.getElementById('searchInput').value='';
  document.getElementById('roleFilter').value='';
  document.getElementById('deptFilter').value='';
  filterUsers();
}

function updateStats(){
  document.getElementById('statTotal').textContent = users.length;
  document.getElementById('statSuper').textContent = users.filter(u=>u.role==='super_admin').length;
  document.getElementById('statAdmin').textContent = users.filter(u=>u.role==='admin').length;
}

// Password strength
function checkStrength(val,fillId){
  const fill = document.getElementById(fillId);
  let score = 0;
  if(val.length >= 6) score++;
  if(val.length >= 10) score++;
  if(/[A-Z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;
  const pct = Math.min(score*20,100);
  fill.style.width = pct+'%';
  if(pct <= 20) fill.style.background = '#dc2626';
  else if(pct <= 40) fill.style.background = '#f59e0b';
  else if(pct <= 60) fill.style.background = '#d97706';
  else if(pct <= 80) fill.style.background = '#059669';
  else fill.style.background = '#047857';
}

// ADD
function openAddModal(){
  document.getElementById('addUsername').value='';
  document.getElementById('addLabel').value='';
  document.getElementById('addPassword').value='';
  document.getElementById('addPasswordConfirm').value='';
  document.getElementById('addRole').value='admin';
  document.getElementById('addDept').value='';
  document.getElementById('addStrength').style.width='0';
  document.getElementById('addModal').classList.add('show');
  document.body.style.overflow='hidden';
}
function closeAddModal(){document.getElementById('addModal').classList.remove('show');document.body.style.overflow='';}

function addUser(){
  const username = document.getElementById('addUsername').value.trim();
  const label = document.getElementById('addLabel').value.trim();
  const pass = document.getElementById('addPassword').value;
  const passC = document.getElementById('addPasswordConfirm').value;
  const role = document.getElementById('addRole').value;
  const dept = document.getElementById('addDept').value;
  if(!username||!label||!pass){showToast('error','يرجى ملء جميع الحقول المطلوبة');return;}
  if(pass!==passC){showToast('error','كلمتا المرور غير متطابقتين');return;}
  if(pass.length<6){showToast('error','كلمة المرور يجب أن تكون 6 أحرف على الأقل');return;}
  if(users.find(u=>u.username===username)){showToast('error','اسم المستخدم موجود مسبقاً');return;}
  const today = new Date().toISOString().slice(0,10);
  users.push({id:nextId++,username,label,role,dept,created:today});
  showToast('success',`تم إضافة المستخدم "${label}" بنجاح`);
  closeAddModal();
  updateStats();
  filterUsers();
}

// EDIT
function openEditModal(id){
  const u = users.find(x=>x.id===id);
  if(!u) return;
  document.getElementById('editId').value=u.id;
  document.getElementById('editModalMeta').textContent='@'+u.username;
  document.getElementById('editUsername').value=u.username;
  document.getElementById('editLabel').value=u.label;
  document.getElementById('editRole').value=u.role;
  document.getElementById('editDept').value=u.dept;
  document.getElementById('editModal').classList.add('show');
  document.body.style.overflow='hidden';
}
function closeEditModal(){document.getElementById('editModal').classList.remove('show');document.body.style.overflow='';}

function saveEdit(){
  const id = parseInt(document.getElementById('editId').value);
  const username = document.getElementById('editUsername').value.trim();
  const label = document.getElementById('editLabel').value.trim();
  const role = document.getElementById('editRole').value;
  const dept = document.getElementById('editDept').value;
  if(!username||!label){showToast('error','يرجى ملء جميع الحقول المطلوبة');return;}
  const idx = users.findIndex(u=>u.id===id);
  if(idx!==-1){
    if(users.find(u=>u.username===username&&u.id!==id)){showToast('error','اسم المستخدم موجود مسبقاً');return;}
    users[idx]={...users[idx],username,label,role,dept};
  }
  showToast('success','تم تعديل بيانات المستخدم بنجاح');
  closeEditModal();
  updateStats();
  filterUsers();
}

// PASSWORD
function openPassModal(id){
  const u = users.find(x=>x.id===id);
  if(!u) return;
  document.getElementById('passUserId').value=u.id;
  document.getElementById('passModalMeta').textContent='تغيير كلمة المرور لـ @'+u.username;
  document.getElementById('newPassword').value='';
  document.getElementById('newPasswordConfirm').value='';
  document.getElementById('passStrength').style.width='0';
  document.getElementById('passwordModal').classList.add('show');
  document.body.style.overflow='hidden';
}
function closePassModal(){document.getElementById('passwordModal').classList.remove('show');document.body.style.overflow='';}

function changePassword(){
  const pass = document.getElementById('newPassword').value;
  const passC = document.getElementById('newPasswordConfirm').value;
  if(!pass){showToast('error','يرجى إدخال كلمة المرور الجديدة');return;}
  if(pass!==passC){showToast('error','كلمتا المرور غير متطابقتين');return;}
  if(pass.length<6){showToast('error','كلمة المرور يجب أن تكون 6 أحرف على الأقل');return;}
  showToast('success','تم تغيير كلمة المرور بنجاح');
  closePassModal();
}

// DELETE
function confirmDelete(){document.getElementById('confirmOverlay').classList.add('show');}
function closeConfirm(){document.getElementById('confirmOverlay').classList.remove('show');}
function executeDelete(){
  if(deleteTargetId){
    const u = users.find(x=>x.id===deleteTargetId);
    users = users.filter(x=>x.id!==deleteTargetId);
    showToast('success',`تم حذف المستخدم "${u?u.label:''}" بنجاح`);
    deleteTargetId=null;
    closeConfirm();
    updateStats();
    filterUsers();
  }
}

// EXPORT CSV
function exportCSV(){
  let csv = 'ID,Username,Label,Role,Department,Created\n';
  users.forEach(u=>{
    csv += `${u.id},"${u.username}","${u.label}","${u.role}","${u.dept}","${u.created}"\n`;
  });
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url;a.download='users_export.csv';a.click();
  URL.revokeObjectURL(url);
  showToast('success','تم تنزيل ملف CSV بنجاح');
}

// TOAST
let toastTimer;
function showToast(type,msg){
  const t=document.getElementById('toast');
  const icon=document.getElementById('toastIcon');
  const m=document.getElementById('toastMsg');
  t.className='notification-toast '+type;
  m.textContent=msg;
  icon.textContent=type==='success'?'✓':type==='error'?'✕':'⚠';
  clearTimeout(toastTimer);
  requestAnimationFrame(()=>{t.classList.add('show');toastTimer=setTimeout(()=>t.classList.remove('show'),3500);});
}

// EVENTS
window.addEventListener('scroll',()=>{document.getElementById('backToTop').classList.toggle('show',window.scrollY>300);});
document.getElementById('addModal').addEventListener('click',function(e){if(e.target===this)closeAddModal();});
document.getElementById('editModal').addEventListener('click',function(e){if(e.target===this)closeEditModal();});
document.getElementById('passwordModal').addEventListener('click',function(e){if(e.target===this)closePassModal();});
document.getElementById('confirmOverlay').addEventListener('click',function(e){if(e.target===this)closeConfirm();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('confirmOverlay').classList.contains('show'))closeConfirm();
    else if(document.getElementById('editModal').classList.contains('show'))closeEditModal();
    else if(document.getElementById('addModal').classList.contains('show'))closeAddModal();
    else if(document.getElementById('passwordModal').classList.contains('show'))closePassModal();
  }
});
document.getElementById('globalSearch').addEventListener('input',function(){
  document.getElementById('searchInput').value=this.value;
  filterUsers();
});

// INIT
filterUsers();
updateStats();
