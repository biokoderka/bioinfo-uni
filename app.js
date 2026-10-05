// BioInfoUni — wyszukiwarka kierunków + opinie
// Dane: universities.json (programs → offers per stopień), reviews.json (review.program = program.id)

const $ = s => document.querySelector(s);
let programs = [], reviews = [];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}
function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : null; }
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
}

const LEVEL_CLASS = { 'I stopień': 'pill-i', 'II stopień': 'pill-ii', 'II stopień – specjalność': 'pill-ii', 'studia podyplomowe': 'pill-podyp' };
const levelGroup = l => l.startsWith('II') ? 'II' : l.startsWith('I') ? 'I' : 'podyplomowe';
const levelShort = l => ({ 'I stopień': 'I st.', 'II stopień': 'II st.', 'II stopień – specjalność': 'II st. (specjalność)', 'studia podyplomowe': 'podyplomowe' }[l] || l);

function hasPath(p) {  // I i II stopień tego samego kierunku na tej samej uczelni
  const g = p.offers.map(o => levelGroup(o.level));
  return g.includes('I') && g.includes('II');
}

function link(url, label) {
  const u = safeUrl(url);
  return u ? `<a class="btn" target="_blank" rel="noopener" href="${esc(u)}">${label}</a>` : '';
}

function renderStats() {
  const offers = programs.reduce((n, p) => n + p.offers.length, 0);
  const unis = new Set(programs.map(p => p.university)).size;
  const cities = new Set(programs.map(p => p.city)).size;
  $('#top').innerHTML =
    `<div class="panel stat"><b>${offers}</b><small>programów studiów</small></div>` +
    `<div class="panel stat"><b>${unis}</b><small>uczelni · ${cities} miast</small></div>` +
    `<div class="panel stat"><b>${reviews.length}</b><small>opinii</small></div>`;
}

function fillCityFilter() {
  const cities = [...new Set(programs.map(p => p.city))].sort((a, b) => a.localeCompare(b, 'pl'));
  $('#city').innerHTML = '<option value="">Wszystkie miasta</option>' + cities.map(c => `<option>${esc(c)}</option>`).join('');
}

function offerBlock(o) {
  const rows = [
    ['Czas trwania', o.duration], ['Tytuł', o.degree], ['Rekrutacja', o.admission], ['Oferta na rok', o.year], ['Uwagi', o.note],
  ].filter(([, v]) => v);
  return `<div class="offer">
    <div class="offer-head"><span class="pill ${LEVEL_CLASS[o.level] || ''}">${esc(o.level)}</span></div>
    <table>${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</table>
    <div class="links">${link(o.url, 'Oferta')}${link(o.curriculum_url, 'Program / przedmioty')}${link(o.schedule_url, 'Plan zajęć')}</div>
  </div>`;
}

function reviewBlock(r) {
  const meta = [r.year, r.level ? levelShort(r.level) : null,
    r.source && !r.source.includes('studentów') ? r.source.replace(/^opinia od /, '') : null].filter(Boolean);
  return `<div class="review">${meta.map(m => `<span class="pill">${esc(m)}</span>`).join(' ')}<p>${esc(r.comment)}</p></div>`;
}

function card(p) {
  const rs = p._reviews;
  const id = 'd-' + p.id;
  const levels = p.offers.map(o =>
    `<span class="pill ${LEVEL_CLASS[o.level] || ''}">${esc(levelShort(o.level))} · ${esc(o.degree || '')}${o.duration ? ' · ' + esc(o.duration) : ''}</span>`).join('');
  const shared = p.offers.length > 1 && rs.length
    ? '<p class="hint">Opinie dotyczą kierunku na tej uczelni — przy każdej widać stopień, jeśli autor go podał.</p>' : '';
  return `<article class="card" id="${esc(p.id)}">
    <h2>${esc(p.university)}${p.faculty ? ` <span class="faculty">${esc(p.faculty)}</span>` : ''}</h2>
    <div class="small"><b>${esc(p.name)}</b> · ${esc(p.city)}</div>
    <div class="meta">${levels}<span class="pill">opinii: ${rs.length}</span>${hasPath(p) ? '<span class="pill good">I + II stopień na miejscu</span>' : ''}</div>
    ${p.note ? `<p class="small">${esc(p.note)}</p>` : ''}
    <div class="links"><button data-toggle="${id}">Szczegóły${rs.length ? ' i opinie' : ''}</button>
      <a class="btn" href="submit.html?program=${encodeURIComponent(p.id)}">✦ Dodaj opinię</a></div>
    <div class="details" id="${id}">
      ${p.offers.map(offerBlock).join('')}
      <h3 class="reviews-title">Opinie (${rs.length})</h3>
      ${rs.length ? '<div class="notice"><strong>Uwaga:</strong> opinie są anonimowe, subiektywne i nie są oficjalnym stanowiskiem uczelni.</div>' + shared + rs.map(reviewBlock).join('')
                  : '<p class="small">Brak opinii — <a href="submit.html?program=' + encodeURIComponent(p.id) + '">dodaj pierwszą</a>.</p>'}
    </div>
  </article>`;
}

function render() {
  const q = norm($('#q').value.trim());
  const lvl = $('#type').value, city = $('#city').value, path = $('#path').checked, sort = $('#sort').value;
  let list = programs.filter(p => {
    if (lvl && !p.offers.some(o => levelGroup(o.level) === lvl)) return false;
    if (city && p.city !== city) return false;
    if (path && !hasPath(p)) return false;
    if (q && !p._search.includes(q)) return false;
    return true;
  });
  list.sort((a, b) =>
    sort === 'name' ? a.university.localeCompare(b.university, 'pl') :
    sort === 'city' ? a.city.localeCompare(b.city, 'pl') || a.university.localeCompare(b.university, 'pl') :
    b._reviews.length - a._reviews.length || a.university.localeCompare(b.university, 'pl'));
  $('#count').textContent = `${list.length} z ${programs.length} kierunków`;
  $('#cards').innerHTML = list.length ? list.map(card).join('') : '<div class="panel empty">Brak wyników dla tych filtrów.</div>';
  document.querySelectorAll('[data-toggle]').forEach(btn => btn.onclick = () => {
    const el = document.getElementById(btn.dataset.toggle);
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
  });
}

function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const cardEl = document.getElementById(id);
  const det = document.getElementById('d-' + id);
  if (cardEl && det) { det.style.display = 'block'; cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

async function init() {
  const [u, r] = await Promise.all([
    fetch('universities.json?v=9').then(x => x.json()),
    fetch('reviews.json?v=9').then(x => x.json()),
  ]);
  programs = u.programs || [];
  reviews = r.reviews || [];
  const byProgram = {};
  reviews.forEach(rv => (byProgram[rv.program] ||= []).push(rv));
  programs.forEach(p => {
    p._reviews = (byProgram[p.id] || []).sort((a, b) => String(b.year || '').localeCompare(String(a.year || '')));
    p._search = norm([p.university, p.short, p.faculty, p.name, p.city,
      ...p.offers.flatMap(o => [o.level, o.degree, o.admission]), ...p._reviews.map(x => x.comment)].join(' '));
  });
  renderStats();
  fillCityFilter();
  render();
  ['q', 'type', 'city', 'path', 'sort'].forEach(id => $('#' + id).addEventListener('input', render));
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
}

init().catch(e => {
  $('#cards').innerHTML = '<div class="panel empty">Nie udało się wczytać danych — odśwież stronę.</div>';
  console.error(e);
});
