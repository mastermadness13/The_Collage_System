function filterTable(){
  const action = document.getElementById('actionFilter').value;
  const entity = document.getElementById('entityFilter').value;
  const rows = document.querySelectorAll('#historyBody .history-row');
  let visible = 0;
  rows.forEach(row => {
    const matchAction = !action || row.dataset.action === action;
    const matchEntity = !entity || row.dataset.entity === entity;
    if(matchAction && matchEntity){
      row.style.display = '';
      visible++;
    } else {
      row.style.display = 'none';
    }
  });
  document.getElementById('countBadge').textContent = 'عدد السجلات: ' + visible;
}

function resetFilters(){
  document.getElementById('actionFilter').value = '';
  document.getElementById('entityFilter').value = '';
  filterTable();
}

// Close other details when opening one (optional UX)
document.querySelectorAll('.history-details').forEach(d => {
  d.addEventListener('toggle', function(){
    if(this.open){
      document.querySelectorAll('.history-details[open]').forEach(other => {
        if(other !== this) other.open = false;
      });
    }
  });
});
