const $=s=>document.querySelector(s);let universities=[];
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
async function init(){const data=await fetch('universities.json?v=8').then(r=>r.json());universities=data.universities||[];$('#university').innerHTML='<option value="">Wybierz uczelnię z listy…</option>'+universities.map(u=>`<option>${esc(u.Uczelnia)} — ${esc(u['Pełny tytuł kierunku'])}</option>`).join('');}
function submitOpinion(e){e.preventDefault();const uni=$('#university').value,relation=$('#relation').value,comment=$('#comment').value.trim();if(!uni||!comment){alert('Wybierz uczelnię i wpisz opinię.');return}
const now=new Date();const timestamp=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const title=encodeURIComponent(`Nowa opinia: ${uni}`);const body=encodeURIComponent(`Uczelnia/kierunek: ${uni}\nData zgłoszenia: ${timestamp}\nStatus osoby: ${relation}\n\nOpinia:\n${comment}\n\nZgoda: opinia może zostać zmoderowana i opublikowana anonimowo na stronie.`);window.open(`https://github.com/biokoderka/bioinfo-uni/issues/new?title=${title}&body=${body}&labels=opinia`,'_blank','noopener');}
init();$('#opinionForm').addEventListener('submit',submitOpinion);
