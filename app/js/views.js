// Leonida Ledger — rendering. Builds the list, the guide pane, the roadmap,
// the missables page and the settings page from the trophy data and the saved progress.
import { isSpoilerHidden, KIND_LABELS } from './filters.js';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function gradeMedal(grade) {
  const letter = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] || '?';
  return `<span class="medal ${esc(grade)}" title="${esc(grade)}">${letter}</span>`;
}

export function trophyRow(trophy, progress, spoilersOn) {
  const earned = Boolean(progress.earned[trophy.id]);
  const hidden = isSpoilerHidden(trophy, progress, spoilersOn);
  const name = hidden ? 'Hidden story trophy — earn it to reveal' : trophy.name;
  const desc = hidden ? 'Spoiler mode is on. This story trophy stays hidden until you earn it.' : trophy.description;
  const tags = [`<span class="tag">${esc(trophy.grade)}</span>`, `<span class="tag">${esc(KIND_LABELS[trophy.kind] || trophy.kind)}</span>`];
  if (trophy.hidden) tags.push('<span class="tag hidden">Hidden on PSN</span>');
  if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
  if (trophy.target) tags.push(`<span class="tag">PSN target: ${esc(trophy.target)}</span>`);
  return `<article class="trophy${earned ? ' earned' : ''}" data-id="${trophy.id}">
    <input type="checkbox" class="check" data-earn="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark ${esc(name)} earned">
    <div>
      <h3>${gradeMedal(trophy.grade)} ${esc(name)}</h3>
      <p class="official${hidden ? ' spoiler-hidden' : ''}">${esc(desc)}</p>
      <div class="meta">${tags.join(' ')}</div>
    </div>
    <div class="actions"><button class="guide-btn" type="button" data-guide="${trophy.id}">Guide</button></div>
  </article>`;
}

export function renderList(container, trophies, progress, spoilersOn) {
  if (trophies.length === 0) {
    container.innerHTML = '<p class="empty">No trophies match these filters. Clear the search or a filter to see the full list.</p>';
    return;
  }
  container.innerHTML = trophies.map((t) => trophyRow(t, progress, spoilersOn)).join('');
}

export function renderDetail(body, trophy, progress, spoilersOn, sources) {
  if (!trophy) {
    body.innerHTML = '<p class="empty">Select a trophy to read its guide, tip and sources.</p>';
    return;
  }
  const earned = Boolean(progress.earned[trophy.id]);
  const hidden = isSpoilerHidden(trophy, progress, spoilersOn);
  const note = progress.notes[trophy.id] || '';
  const sourceItems = sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join('');
  body.innerHTML = `
    <h3>${gradeMedal(trophy.grade)} ${esc(hidden ? 'Hidden story trophy' : trophy.name)}</h3>
    <p class="official">${esc(hidden ? 'Spoiler mode is on. Earn this trophy to reveal its name and description.' : trophy.description)}</p>
    <p><span class="tag">${esc(trophy.grade)}</span> <span class="tag">${esc(KIND_LABELS[trophy.kind] || trophy.kind)}</span>${trophy.missable ? ' <span class="tag missable">Missable</span>' : ''}${trophy.hidden ? ' <span class="tag hidden">Hidden on PSN</span>' : ''}</p>
    ${hidden ? '' : `<p class="guide">${esc(trophy.guide)}</p><p class="tip"><strong>Tip:</strong> ${esc(trophy.tip)}</p>`}
    <p><strong>Status:</strong> ${earned ? 'Earned ✓' : 'Not yet earned'}</p>
    <label for="trophy-note">Your note</label>
    <textarea id="trophy-note" class="note-box" rows="2" placeholder="Where you found it, what worked…" data-note="${trophy.id}">${esc(note)}</textarea>
    <div class="sources"><strong>Sources</strong><ul>${sourceItems}<li>Guide: our own advice from the official description, not yet checked in the game.</li></ul></div>`;
}

export function renderRoadmap(container, roadmap, trophies, progress) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  container.innerHTML = `<p class="hint">${esc(roadmap.note)}</p>` + roadmap.stages.map((stage, index) => {
    const earned = stage.trophies.filter((id) => progress.earned[id]).length;
    const items = stage.trophies.map((id) => {
      const t = byId.get(id);
      if (!t) return '';
      return `<li class="${progress.earned[id] ? 'earned' : ''}">${esc(t.name)} <span class="tag">${esc(t.grade)}</span>${t.missable ? ' <span class="tag missable">Missable</span>' : ''}</li>`;
    }).join('');
    return `<section class="stage"><header><h3>${esc(stage.title)}</h3><span class="stage-progress">${earned}/${stage.trophies.length} earned</span></header>
      <p>${esc(stage.goal)}</p><p class="hint">${esc(stage.step)}</p><ol>${items}</ol></section>`;
  }).join('');
}

export function renderMissables(container, trophies, progress) {
  const list = trophies.filter((t) => t.missable);
  const earned = list.filter((t) => progress.earned[t.id]).length;
  container.innerHTML = `<div class="callout"><h2>Missable trophies — ${earned}/${list.length} done</h2>
    <p>Nothing in the official descriptions confirms a trophy that can never be earned again, so these flags mark one-time moments: do each one the first time it appears, before the moment passes. Every flag here is our own reading of the official description, not yet checked in the game.</p></div>`
    + list.map((t) => trophyRow(t, progress, false)).join('');
}

export function renderSettings(container, next) {
  container.innerHTML = `<div class="settings-grid">
    <section class="panel"><h2>Next up</h2>
      ${next ? `<p><strong>${esc(next.name)}</strong> — ${esc(next.description)}</p><p class="hint">${esc(next.tip)}</p>` : '<p>Every trophy is earned. The platinum is yours — Leonida Legend.</p>'}
    </section>
    <section class="panel"><h2>How this guide is built</h2>
      <p>All 55 trophies carry their official name, description and grade as PlayStation publishes them, and a guide in our own words that cites its sources. The roadmap and the missable flags are built from the official descriptions alone.</p>
      <p>Your progress and notes are saved in this browser (localStorage). Export backs them up to a file; import restores them. The app makes no network request at all.</p>
    </section>
    <section class="panel"><h2>Spoiler mode</h2>
      <p>When spoiler mode is on, story and mission trophies you have not earned yet show as “Hidden story trophy” — no name, no description, no guide — until you earn them. Collectibles, activities and crime trophies are never hidden by it.</p>
    </section>
    <section class="panel"><h2>About the list</h2>
      <p>55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze. 28 are hidden on PlayStation until earned. Counts PSN tracks include 250 stunts, 42 Shooting Range challenges, 14 drone-race locations, 100 WAiNK It locations, 52 areas of Leonida and 500 choices.</p>
    </section>
  </div>`;
}
