const $=s=>document.querySelector(s);let universities=[];
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

async function init(){
  const data=await fetch('universities.json?v=8').then(r=>r.json());
  universities=data.universities||[];
  $('#university').innerHTML='<option value="">Wybierz uczelnię z listy…</option>'+universities.map(u=>`<option>${esc(u.Uczelnia)} — ${esc(u['Pełny tytuł kierunku'])}</option>`).join('');
  const now=new Date();
  const ts=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  $('#timestamp').value=ts;
}

$('#opinionForm').addEventListener('submit',async function(e){
  e.preventDefault();
  const uni=$('#university').value;
  const comment=$('#comment').value.trim();
  if(!uni||!comment){alert('Wybierz uczelnię i wpisz opinię.');return}
  $('#subject').value=`Nowa opinia: ${uni}`;
  const btn=this.querySelector('button[type="submit"]');
  btn.textContent='Wysyłanie…';btn.disabled=true;
  try{
    const res=await fetch(this.action,{method:'POST',body:new FormData(this),headers:{'Accept':'application/json'}});
    if(res.ok){
      this.style.display='none';
      $('#thanks').style.display='block';
    } else {
      alert('Coś poszło nie tak. Spróbuj ponownie lub napisz na biokoderka@gmail.com.');
      btn.textContent='Wyślij opinię';btn.disabled=false;
    }
  } catch(err){
    alert('Błąd połączenia. Spróbuj ponownie.');
    btn.textContent='Wyślij opinię';btn.disabled=false;
  }
});

init();
