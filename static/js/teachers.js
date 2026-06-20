const departments=['القسم العام','قسم الاتصالات','قسم البحث والتطوير والمناهج','قسم الحاسوب','قسم المدني','قسم المعماري','قسم النفط'];
const deptClassMap={};departments.forEach((d,i)=>deptClassMap[d]='dept-'+i);

const coursesData=[
{id:83,name:'برمجة حاسوب',code:'ت101',dept:'قسم الحاسوب',year:1,theo:5,prac:5,total:10,accred:'',vocab:''},
{id:33,name:'دوائر كهربائية',code:'ت102',dept:'قسم الاتصالات',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:34,name:'دوائر الكترونية',code:'ت103',dept:'قسم الاتصالات',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:35,name:'مبادئ هندسة الكترونية',code:'ت104',dept:'قسم الاتصالات',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:36,name:'عمارة الحاسوب',code:'ت105',dept:'قسم الحاسوب',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:81,name:'تطبيقات الحاسوب',code:'ت106',dept:'قسم الحاسوب',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:1,name:'هندسة وصفية',code:'ع101',dept:'القسم العام',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:2,name:'أسس كهرباء',code:'ع102',dept:'القسم العام',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:84,name:'رياضة 2',code:'ع102',dept:'قسم الحاسوب',year:1,theo:3,prac:0,total:3,accred:'رياضة 1',vocab:''},
{id:90,name:'رياضة 2',code:'ع102',dept:'قسم الاتصالات',year:1,theo:3,prac:0,total:3,accred:'رياضة1',vocab:''},
{id:3,name:'استاتيكا',code:'ع103',dept:'القسم العام',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:4,name:'تقنية ورش',code:'ع104',dept:'القسم العام',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:93,name:'رياضة 2، 3',code:'ع105',dept:'القسم العام',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:6,name:'كتابة تقارير',code:'ع106',dept:'القسم العام',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:7,name:'مصطلحات فنية',code:'ع107',dept:'القسم العام',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:8,name:'فيزياء نسبية',code:'ع108',dept:'القسم العام',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:82,name:'رياضة 1',code:'ع109',dept:'القسم العام',year:1,theo:3,prac:0,total:3,accred:'',vocab:''},
{id:85,name:'رسم هندسي',code:'ع110',dept:'القسم العام',year:1,theo:1,prac:3,total:4,accred:'',vocab:''},
{id:86,name:'اللغة الانجليزية',code:'ع111',dept:'القسم العام',year:1,theo:3,prac:0,total:3,accred:'',vocab:''},
{id:87,name:'فيزياء نظري',code:'ع112',dept:'القسم العام',year:1,theo:3,prac:0,total:3,accred:'',vocab:''},
{id:88,name:'فيزياء عملي',code:'ع113',dept:'القسم العام',year:1,theo:0,prac:3,total:3,accred:'',vocab:''},
{id:89,name:'كيمياء',code:'ع114',dept:'القسم العام',year:1,theo:3,prac:0,total:3,accred:'',vocab:''},
{id:91,name:'حاسب آلي ( عملي )',code:'ع115',dept:'القسم العام',year:1,theo:0,prac:3,total:3,accred:'',vocab:''},
{id:92,name:'حاسب آلي ( نظري )',code:'ع116',dept:'القسم العام',year:1,theo:3,prac:0,total:3,accred:'',vocab:''},
{id:9,name:'مقدمة هندسة نفط',code:'ه101',dept:'قسم النفط',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:10,name:'جيولوجيا عامة',code:'ه102',dept:'قسم النفط',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:11,name:'كيمياء عضوية',code:'ه103',dept:'قسم النفط',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:12,name:'جيولوجيا نفط',code:'ه104',dept:'قسم النفط',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:68,name:'تاريخ عمارة',code:'ه105',dept:'قسم المعماري',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:69,name:'قوانين المباني',code:'ه106',dept:'قسم المعماري',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:70,name:'مواد الانشاء',code:'ه107',dept:'قسم المدني',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:71,name:'تنسيق مواقع',code:'ه108',dept:'قسم المعماري',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:72,name:'تخطيط اقليمي',code:'ه109',dept:'قسم المعماري',year:1,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:37,name:'الكترونات رقمية',code:'ت201',dept:'قسم الاتصالات',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:38,name:'ورشة الكترونية',code:'ت202',dept:'قسم الاتصالات',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:39,name:'معالجات دقيقة',code:'ت203',dept:'قسم الاتصالات',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:40,name:'نظم قواعد البيانات',code:'ت204',dept:'قسم الحاسوب',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:41,name:'البرمجة المرئية',code:'ت205',dept:'قسم الحاسوب',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:42,name:'وسائط متعددة',code:'ت206',dept:'قسم الحاسوب',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:43,name:'نظم التشغيل',code:'ت207',dept:'قسم الحاسوب',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:44,name:'تحليل البيانات باستخدام Excel',code:'ت208',dept:'قسم الحاسوب',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:45,name:'إحصاء واحتمالات',code:'ت209',dept:'قسم الحاسوب',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:13,name:'ديناميكا حرارية',code:'ه201',dept:'قسم النفط',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:14,name:'ميكانيكا موائع',code:'ه202',dept:'قسم النفط',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:15,name:'سريان الموائع',code:'ه203',dept:'قسم النفط',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:16,name:'خواص موائع المكمن',code:'ه204',dept:'قسم النفط',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:17,name:'خواص صخور المكمن',code:'ه205',dept:'قسم النفط',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:18,name:'صخور رسوبية',code:'ه206',dept:'قسم النفط',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:19,name:'جيولوجيا تركيبية',code:'ه207',dept:'قسم النفط',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:20,name:'معدات حقول النفط',code:'ه208',dept:'قسم النفط',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:73,name:'خرسانة مسلحة',code:'ه209',dept:'قسم المدني',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:74,name:'انشاء مباني',code:'ه210',dept:'قسم المدني',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:75,name:'انظمة تكيف',code:'ه211',dept:'قسم المعماري',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:76,name:'ميكانيكا الجوامد',code:'ه212',dept:'قسم المدني',year:2,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:46,name:'نظم اتصالات',code:'ت301',dept:'قسم الاتصالات',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:47,name:'هوائيات',code:'ت302',dept:'قسم الاتصالات',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:48,name:'انظمة تحكم',code:'ت303',dept:'قسم الاتصالات',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:49,name:'انظمة مقسمات والهواتف',code:'ت304',dept:'قسم الاتصالات',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:50,name:'معالجة اشارة رقمية',code:'ت305',dept:'قسم الاتصالات',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:51,name:'اتصالات رقمية',code:'ت306',dept:'قسم الاتصالات',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:52,name:'انظمة الهواتف المحمولة',code:'ت307',dept:'قسم الاتصالات',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:53,name:'برمجة الانترنت',code:'ت308',dept:'قسم الحاسوب',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:54,name:'تراكيب البيانات والخوارزميات',code:'ت309',dept:'قسم الحاسوب',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:55,name:'تصميم منطقي',code:'ت310',dept:'قسم الحاسوب',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:21,name:'حفر وتصميم الابار',code:'ه301',dept:'قسم النفط',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:22,name:'تقنية سوائل الحفر',code:'ه302',dept:'قسم النفط',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:23,name:'هندسة انتاج',code:'ه303',dept:'قسم النفط',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:24,name:'هندسة غاز',code:'ه304',dept:'قسم النفط',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:25,name:'تطبيقات الحاسوب في الهندسة النفطية',code:'ه305',dept:'قسم النفط',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:26,name:'التآكل في الصناعات النفطية',code:'ه306',dept:'قسم النفط',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:77,name:'تصميم معماري',code:'ه307',dept:'قسم المعماري',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:78,name:'كميات والمواصفات',code:'ه308',dept:'قسم المدني',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:79,name:'اسكان وتصميم حضري',code:'ه309',dept:'قسم المعماري',year:3,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:56,name:'أمن البرمجيات',code:'ت401',dept:'قسم الحاسوب',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:57,name:'التجارة الالكترونية',code:'ت402',dept:'قسم الحاسوب',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:58,name:'اختبار وجودة البرمجيات',code:'ت403',dept:'قسم الحاسوب',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:59,name:'قواعد بيانات متقدمة',code:'ت404',dept:'قسم الحاسوب',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:60,name:'مواضيع مختارة',code:'ت405',dept:'قسم الحاسوب',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:61,name:'أسس هندسة البرمجيات',code:'ت406',dept:'قسم الحاسوب',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:62,name:'تحليل متطلبات البرمجيات',code:'ت407',dept:'قسم الحاسوب',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:63,name:'شبكات الحاسوب',code:'ت408',dept:'قسم الحاسوب',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:64,name:'وسائط نقل',code:'ت409',dept:'قسم الاتصالات',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:65,name:'أجهزة قياس كهربائية',code:'ت410',dept:'قسم الاتصالات',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:66,name:'فيزياء 2',code:'ت411',dept:'قسم الاتصالات',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:67,name:'كهرومغناطيسية',code:'ت412',dept:'قسم الاتصالات',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:27,name:'طرق تحسين ابار النفط',code:'ه401',dept:'قسم النفط',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:28,name:'صيانة واصلاح الابار',code:'ه402',dept:'قسم النفط',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:29,name:'تقييم المكامن النفطية',code:'ه403',dept:'قسم النفط',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:30,name:'استكمال ابار النفط',code:'ه404',dept:'قسم النفط',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:31,name:'اقتصاديات هندسة نفط',code:'ه405',dept:'قسم النفط',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
{id:80,name:'ادارة مشاريع هندسية',code:'ه406',dept:'قسم المدني',year:4,theo:0,prac:0,total:0,accred:'',vocab:''},
];

let courses=JSON.parse(JSON.stringify(coursesData));
let nextId=1000;
let deleteTargetId=null;

function renderCourses(list){
  const tbody=document.getElementById('coursesBody');
  const empty=document.getElementById('emptyState');
  if(!list.length){tbody.innerHTML='';empty.style.display='block';document.getElementById('resultCount').textContent='0';return;}
  empty.style.display='none';
  document.getElementById('resultCount').textContent=list.length;
  tbody.innerHTML=list.map((c,i)=>{
    const dc=deptClassMap[c.dept]||'dept-0';
    const hoursHtml=c.total>0?`${c.total} <div class="hours-sub">(${c.theo} ن / ${c.prac} ع)</div>`:`0 <div class="hours-sub">(0 ن / 0 ع)</div>`;
    const accred=c.accred||'<span style="color:var(--text-muted)">غير محدد</span>';
    const vocab=c.vocab?`<span style="color:var(--primary);cursor:pointer" onclick="event.stopPropagation();showVocab(${c.id})">📄 عرض</span>`:'—';
    return `<tr onclick="openEditModal(${c.id})" tabindex="0">
      <td><span class="row-num">${i+1}</span></td>
      <td><span class="course-code">${c.code}</span></td>
      <td style="font-weight:600;text-align:right;padding-right:16px">${c.name}</td>
      <td><span class="dept-badge ${dc}">${c.dept}</span></td>
      <td><span class="year-badge">السنة ${c.year}</span></td>
      <td><span class="hours-cell">${hoursHtml}</span></td>
      <td>${accred}</td>
      <td>${vocab}</td>
      <td class="no-print"><div class="actions-cell">
        <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation();openEditModal(${c.id})">تعديل</button>
        <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation();deleteTargetId=${c.id};confirmDelete()">حذف</button>
      </div></td></tr>`;
  }).join('');
}

function applyFilters(){
  const q=document.getElementById('searchQuery').value.trim().toLowerCase();
  const dept=document.getElementById('deptFilter').value;
  const year=document.getElementById('yearFilter').value;
  const filtered=courses.filter(c=>{
    if(dept&&c.dept!==dept)return false;
    if(year&&c.year!==parseInt(year))return false;
    if(q){const hay=(c.name+' '+c.code).toLowerCase();if(!hay.includes(q))return false;}
    return true;
  });
  renderCourses(filtered);
}

function resetFilters(){
  document.getElementById('searchQuery').value='';
  document.getElementById('deptFilter').value='';
  document.getElementById('yearFilter').value='';
  renderCourses(courses);
}

function calcTotal(){
  const t=parseInt(document.getElementById('fTheo').value)||0;
  const p=parseInt(document.getElementById('fPrac').value)||0;
  document.getElementById('fTotal').value=t+p;
}

function openAddModal(){
  document.getElementById('editId').value='';
  document.getElementById('modalTitle').innerHTML='📝 إضافة مقرر جديد';
  document.getElementById('modalMeta').textContent='';
  document.getElementById('deleteBtn').style.display='none';
  document.getElementById('fName').value='';
  document.getElementById('fCode').value='';
  document.getElementById('fDept').value='القسم العام';
  document.getElementById('fYear').value='1';
  document.getElementById('fTheo').value='0';
  document.getElementById('fPrac').value='0';
  document.getElementById('fTotal').value='0';
  document.getElementById('fAccred').value='';
  document.getElementById('fSyllabus').value='';
  document.getElementById('fVocab').value='';
  document.getElementById('editModal').classList.add('show');
  document.body.style.overflow='hidden';
}

function openEditModal(id){
  const c=courses.find(x=>x.id===id);if(!c)return;
  document.getElementById('editId').value=c.id;
  document.getElementById('modalTitle').innerHTML='✏️ تعديل المقرر';
  document.getElementById('modalMeta').textContent=`الرمز: ${c.code} · ${c.dept}`;
  document.getElementById('deleteBtn').style.display='inline-flex';
  document.getElementById('fName').value=c.name;
  document.getElementById('fCode').value=c.code;
  document.getElementById('fDept').value=c.dept;
  document.getElementById('fYear').value=c.year;
  document.getElementById('fTheo').value=c.theo;
  document.getElementById('fPrac').value=c.prac;
  document.getElementById('fTotal').value=c.total;
  document.getElementById('fAccred').value=c.accred;
  document.getElementById('fSyllabus').value='';
  document.getElementById('fVocab').value=c.vocab||'';
  document.getElementById('editModal').classList.add('show');
  document.body.style.overflow='hidden';
}

function closeModal(){document.getElementById('editModal').classList.remove('show');document.body.style.overflow='';}

function saveCourse(e){
  if(e)e.preventDefault();
  const id=document.getElementById('editId').value;
  const name=document.getElementById('fName').value.trim();
  const code=document.getElementById('fCode').value.trim();
  const dept=document.getElementById('fDept').value;
  const year=parseInt(document.getElementById('fYear').value);
  const theo=parseInt(document.getElementById('fTheo').value)||0;
  const prac=parseInt(document.getElementById('fPrac').value)||0;
  const accred=document.getElementById('fAccred').value.trim();
  const vocab=document.getElementById('fVocab').value.trim();
  if(!name||!code){showToast('error','يرجى إدخال اسم ورمز المقرر');return false;}
  if(id){
    const idx=courses.findIndex(c=>c.id===parseInt(id));
    if(idx!==-1)courses[idx]={...courses[idx],name,code,dept,year,theo,prac,total:theo+prac,accred,vocab};
    showToast('success','تم تعديل المقرر بنجاح');
  }else{
    courses.push({id:nextId++,name,code,dept,year,theo,prac,total:theo+prac,accred,vocab});
    showToast('success','تم إضافة المقرر بنجاح');
  }
  updateStats();applyFilters();closeModal();return false;
}

function confirmDelete(){document.getElementById('confirmOverlay').classList.add('show');}
function closeConfirm(){document.getElementById('confirmOverlay').classList.remove('show');}
function executeDelete(){
  if(deleteTargetId){
    courses=courses.filter(c=>c.id!==deleteTargetId);
    showToast('success','تم حذف المقرر بنجاح');
    deleteTargetId=null;closeConfirm();closeModal();updateStats();applyFilters();
  }
}

function showVocab(id){const c=courses.find(x=>x.id===id);if(c)showToast('success',`مفردات "${c.name}": ${c.vocab||'غير متوفرة'}`);}

function openUploadModal(){document.getElementById('excelFile').value='';document.getElementById('uploadText').textContent='انقر لاختيار ملف Excel';document.getElementById('uploadModal').classList.add('show');document.body.style.overflow='hidden';}
function closeUploadModal(){document.getElementById('uploadModal').classList.remove('show');document.body.style.overflow='';}
function handleFileSelect(input){if(input.files&&input.files[0])document.getElementById('uploadText').textContent='📎 '+input.files[0].name;}
function importExcel(){const f=document.getElementById('excelFile').files[0];if(!f){showToast('warning','يرجى اختيار ملف أولاً');return;}showToast('success','تم استيراد المقررات من الملف بنجاح');closeUploadModal();}
function downloadExcel(){showToast('success','جاري تنزيل ملف Excel...');}

function updateStats(){
  document.getElementById('statTotal').textContent=courses.length;
  document.getElementById('statHours').textContent=courses.reduce((s,c)=>s+(c.total||0),0);
}

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

function setTheme(theme){
  document.body.setAttribute('data-theme',theme);
  document.querySelectorAll('[data-theme-btn]').forEach(b=>b.classList.toggle('active',b.dataset.themeBtn===theme));
  localStorage.setItem('theme',theme);
}

document.getElementById('sidebarToggle').addEventListener('click',()=>{
  if(window.innerWidth<=768)document.getElementById('appSidebar').classList.toggle('mobile-open');
  else document.body.classList.toggle('sidebar-collapsed');
});

document.getElementById('accountBtn').addEventListener('click',e=>{e.stopPropagation();document.getElementById('accountDropdown').classList.toggle('show');});
document.addEventListener('click',()=>document.getElementById('accountDropdown').classList.remove('show'));
window.addEventListener('scroll',()=>document.getElementById('backToTop').classList.toggle('show',window.scrollY>300));

document.getElementById('editModal').addEventListener('click',function(e){if(e.target===this)closeModal();});
document.getElementById('uploadModal').addEventListener('click',function(e){if(e.target===this)closeUploadModal();});
document.getElementById('confirmOverlay').addEventListener('click',function(e){if(e.target===this)closeConfirm();});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('confirmOverlay').classList.contains('show'))closeConfirm();
    else if(document.getElementById('editModal').classList.contains('show'))closeModal();
    else if(document.getElementById('uploadModal').classList.contains('show'))closeUploadModal();
  }
});

document.getElementById('globalSearch').addEventListener('input',function(){document.getElementById('searchQuery').value=this.value;applyFilters();});

(function init(){
  const saved=localStorage.getItem('theme')||'light';
  setTheme(saved);
  renderCourses(courses);
  updateStats();
})();
