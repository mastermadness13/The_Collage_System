// Theme
function setTheme(theme){
  document.body.setAttribute('data-theme',theme);
  document.querySelectorAll('[data-theme-btn]').forEach(b=>b.classList.toggle('active',b.dataset.themeBtn===theme));
  localStorage.setItem('theme',theme);
}

// Sidebar toggle
document.getElementById('sidebarToggle').addEventListener('click',()=>{
  if(window.innerWidth<=900){
    document.getElementById('appSidebar').classList.toggle('mobile-open');
  }
});

// Back to top
window.addEventListener('scroll',()=>{
  document.getElementById('backToTop').classList.toggle('show',window.scrollY>300);
});

// Date/Time
function updateDateTime(){
  const now=new Date();
  const days=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  document.getElementById('currentDay').textContent=now.getDate();
  document.getElementById('currentMonth').textContent=days[now.getDay()]+' · '+months[now.getMonth()]+' '+now.getFullYear();
  document.getElementById('currentTime').textContent=now.toLocaleTimeString('ar-LY',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
updateDateTime();
setInterval(updateDateTime,1000);

// Animate progress bars on load
window.addEventListener('load',()=>{
  document.querySelectorAll('.progress-fill').forEach(el=>{
    const w=el.style.width;
    el.style.width='0%';
    setTimeout(()=>{el.style.width=w},300);
  });
  document.querySelectorAll('.bar').forEach(el=>{
    const h=el.style.height;
    el.style.height='4px';
    setTimeout(()=>{el.style.height=h},500);
  });
});
