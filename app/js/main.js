// Leonida Ledger — boot and wiring. Loads the trophy data, renders the views,
// and keeps the filters, the spoiler setting and the saved progress in sync.
import { loadProgress, saveProgress, loadSettings, saveSettings, earnedCount, countByGrade, exportProgress, importProgress } from './store.js';
import { KINDS, KIND_LABELS, filterTrophies, sortForList, nextUp } from './filters.js';
import { renderList, renderDetail, renderRoadmap, renderMissables, renderSettings } from './views.js';

const state = {
  view: 'tracker',
  search: '',
  grade: '',
  kinds: new Set(),
  missableOnly: false,
  unearnedOnly: false,
  selectedId: null,
};

let trophies = [];
let trophySources = [];
let roadmap = null;
let progress = loadProgress();
let settings = loadSettings();

const $ = (id) => document.getElementById(id);

function applyViewFromHash() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('guide/')) {
    state.selectedId = Number(hash.slice('guide/'.length)) || null;
    state.view = 'tracker';
  } else if (['tracker', 'roadmap', 'missables', 'settings'].includes(hash)) {
    state.view = hash;
  }
}

function renderHeader() {
  const earned = earnedCount(progress, trophies);
  $('earned-count').textContent = String(earned);
  $('progress-fill').style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const c = countByGrade(progress, trophies, grade);
    return `${grade[0].toUpperCase()}${grade.slice(1)} ${c.earned}/${c.total}`;
  });
  $('grade-counts').textContent = parts.join(' · ');
}

function renderAll() {
  renderHeader();
  document.querySelectorAll('#view-nav button').forEach((button) => {
    button.setAttribute('aria-current', button.dataset.view === state.view ? 'true' : 'false');
  });
  $('trophy-list').hidden = state.view !== 'tracker';
  $('roadmap-view').hidden = state.view !== 'roadmap';
  $('missables-view').hidden = state.view !== 'missables';
  $('settings-view').hidden = state.view !== 'settings';
  $('filters-panel').style.display = state.view === 'tracker' ? '' : 'none';
  // With the filters column hidden, the main view takes its space.
  document.querySelector('.layout').style.gridTemplateColumns = state.view === 'tracker' ? '' : '1fr 320px';
  const titles = { tracker: 'All trophies', roadmap: 'Roadmap to the platinum', missables: 'Missable trophies', settings: 'Settings & about' };
  $('view-title').textContent = titles[state.view];
  if (state.view === 'tracker') {
    const filtered = sortForList(filterTrophies(trophies, state, progress));
    renderList($('trophy-list'), filtered, progress, settings.spoilers);
    $('count-line').textContent = `Showing ${filtered.length} of 55 trophies · ${earnedCount(progress, trophies)} earned`;
  } else if (state.view === 'roadmap') {
    renderRoadmap($('roadmap-view'), roadmap, trophies, progress);
    $('count-line').textContent = 'Five stages, in order';
  } else if (state.view === 'missables') {
    renderMissables($('missables-view'), trophies, progress);
    $('count-line').textContent = `${trophies.filter((t) => t.missable).length} flagged missable`;
  } else {
    renderSettings($('settings-view'), nextUp(trophies, progress));
    $('count-line').textContent = 'Next up, sources and settings';
  }
  const selected = trophies.find((t) => t.id === state.selectedId) || null;
  renderDetail($('detail-body'), selected, progress, settings.spoilers, trophySources);
}

function buildKindChips() {
  $('kind-chips').innerHTML = KINDS.map((kind) => `<button type="button" class="chip" data-kind="${kind}" aria-pressed="false">${KIND_LABELS[kind]}</button>`).join('');
}

function wireEvents() {
  $('search').addEventListener('input', (event) => { state.search = event.target.value; renderAll(); });
  $('grade-filter').addEventListener('change', (event) => { state.grade = event.target.value; renderAll(); });
  $('kind-chips').addEventListener('click', (event) => {
    const button = event.target.closest('[data-kind]');
    if (!button) return;
    const kind = button.dataset.kind;
    if (state.kinds.has(kind)) state.kinds.delete(kind); else state.kinds.add(kind);
    button.setAttribute('aria-pressed', String(state.kinds.has(kind)));
    renderAll();
  });
  $('missable-only').addEventListener('change', (event) => { state.missableOnly = event.target.checked; renderAll(); });
  $('unearned-only').addEventListener('change', (event) => { state.unearnedOnly = event.target.checked; renderAll(); });
  $('spoiler-toggle').addEventListener('change', (event) => {
    settings.spoilers = event.target.checked;
    saveSettings(settings);
    renderAll();
  });
  $('view-nav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-view]');
    if (!button) return;
    state.view = button.dataset.view;
    location.hash = `#/${state.view}`;
    renderAll();
  });
  document.addEventListener('click', (event) => {
    const earnBox = event.target.closest('[data-earn]');
    if (earnBox) {
      const id = Number(earnBox.dataset.earn);
      if (earnBox.checked) progress.earned[id] = true; else delete progress.earned[id];
      saveProgress(progress);
      renderAll();
      return;
    }
    const guideButton = event.target.closest('[data-guide]');
    if (guideButton) {
      state.selectedId = Number(guideButton.dataset.guide);
      location.hash = `#/guide/${state.selectedId}`;
      renderAll();
      $('detail-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  document.addEventListener('input', (event) => {
    const noteBox = event.target.closest('[data-note]');
    if (!noteBox) return;
    const id = Number(noteBox.dataset.note);
    if (noteBox.value.trim()) progress.notes[id] = noteBox.value.slice(0, 500);
    else delete progress.notes[id];
    saveProgress(progress);
  });
  $('export-btn').addEventListener('click', () => {
    const blob = new Blob([exportProgress(progress)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leonida-ledger-progress.json';
    link.click();
    URL.revokeObjectURL(url);
  });
  $('import-btn').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      progress = importProgress(await file.text());
      saveProgress(progress);
      renderAll();
    } catch (error) {
      alert(`Could not import that file: ${error.message}`);
    }
    event.target.value = '';
  });
  $('reset-btn').addEventListener('click', () => {
    if (!confirm('Reset all earned trophies and notes? This cannot be undone.')) return;
    progress = { earned: {}, notes: {} };
    saveProgress(progress);
    renderAll();
  });
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea, select')) return;
    if (event.key === '/') { event.preventDefault(); $('search').focus(); }
    if (event.key === '1') { state.view = 'tracker'; location.hash = '#/tracker'; renderAll(); }
    if (event.key === '2') { state.view = 'roadmap'; location.hash = '#/roadmap'; renderAll(); }
    if (event.key === '3') { state.view = 'missables'; location.hash = '#/missables'; renderAll(); }
    if (event.key.toLowerCase() === 's') {
      settings.spoilers = !settings.spoilers;
      saveSettings(settings);
      $('spoiler-toggle').checked = settings.spoilers;
      renderAll();
    }
  });
  window.addEventListener('hashchange', () => { applyViewFromHash(); renderAll(); });
}

async function boot() {
  const [trophyData, roadmapData] = await Promise.all([
    fetch('data/trophies.json').then((response) => response.json()),
    fetch('data/roadmap.json').then((response) => response.json()),
  ]);
  trophies = trophyData.trophies;
  trophySources = trophyData.sources || [];
  roadmap = roadmapData;
  $('spoiler-toggle').checked = settings.spoilers;
  buildKindChips();
  applyViewFromHash();
  wireEvents();
  renderAll();
}

boot();
