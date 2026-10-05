const $ = s => document.querySelector(s);
let programs = [];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}
const today = () => new Date().toISOString().slice(0, 10);

function fillLevels() {
  const p = programs.find(x => x.id === $('#program').value);
  const opts = (p ? p.offers : []).map(o => `<option>${esc(o.level)}</option>`).join('');
  $('#level').innerHTML = '<option value="">— nie chcę podawać / ogólnie o kierunku —</option>' + opts;
  // a single-offer programme doesn't need the question
  $('#level').closest('form').querySelector('label[for="level"]').style.display = p && p.offers.length > 1 ? '' : 'none';
  $('#level').style.display = p && p.offers.length > 1 ? '' : 'none';
}

async function init() {
  const data = await fetch('universities.json?v=9').then(r => r.json());
  programs = (data.programs || []).slice().sort((a, b) => a.university.localeCompare(b.university, 'pl'));
  $('#program').innerHTML = '<option value="">Wybierz kierunek z listy…</option>' +
    programs.map(p => `<option value="${esc(p.id)}">${esc(p.short)} — ${esc(p.name)} (${esc(p.city)})</option>`).join('');
  const pre = new URLSearchParams(location.search).get('program');
  if (pre && programs.some(p => p.id === pre)) $('#program').value = pre;
  fillLevels();
  $('#program').addEventListener('change', fillLevels);
  $('#timestamp').value = today();
}

$('#opinionForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const p = programs.find(x => x.id === $('#program').value);
  const comment = $('#comment').value.trim();
  if (!p || !comment) { alert('Wybierz kierunek i wpisz opinię.'); return; }
  const relation = $('#relation').value;
  $('#uczelnia_name').value = `${p.university} — ${p.name}`;
  $('#subject').value = `Nowa opinia: ${p.short} — ${p.name}`;
  // paste-ready block for GitHub → Actions → "Add review" → review_json
  $('#admin_json').value = JSON.stringify({
    program: p.id,
    level: $('#level').value || null,
    year: today().slice(0, 4),
    source: relation.startsWith('osoba prowadząca') ? 'opinia od osoby prowadzącej zajęcia'
          : relation.startsWith('inna') ? 'inna perspektywa' : 'opinia od studentów i absolwentów',
    comment,
  });
  const btn = this.querySelector('button[type="submit"]');
  btn.textContent = 'Wysyłanie…'; btn.disabled = true;
  try {
    const res = await fetch(this.action, { method: 'POST', body: new FormData(this), headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      this.style.display = 'none';
      $('#thanks').style.display = 'block';
    } else {
      alert('Coś poszło nie tak. Spróbuj ponownie lub napisz na biokoderka@gmail.com.');
      btn.textContent = 'Wyślij opinię'; btn.disabled = false;
    }
  } catch (err) {
    alert('Błąd połączenia. Spróbuj ponownie.');
    btn.textContent = 'Wyślij opinię'; btn.disabled = false;
  }
});

init();
