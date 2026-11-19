// Leonida Ledger — filtering and the spoiler rule. Pure functions, no DOM here.
export const KINDS = ['story', 'mission', 'side', 'collectible', 'activity', 'challenge', 'crime', 'money', 'secret'];

export const KIND_LABELS = {
  story: 'Story',
  mission: 'Mission',
  side: 'Side strand',
  collectible: 'Collectible',
  activity: 'Activity',
  challenge: 'Challenge',
  crime: 'Crime',
  money: 'Money',
  secret: 'Secret',
};

// A trophy is spoiler-sensitive when it is part of the story and not yet earned.
export function isSpoilerHidden(trophy, progress, spoilersOn) {
  if (!spoilersOn) return false;
  if (progress.earned[trophy.id]) return false;
  return trophy.kind === 'story' || trophy.kind === 'mission';
}

export function filterTrophies(trophies, state, progress) {
  const query = (state.search || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.grade && trophy.grade !== state.grade) return false;
    if (state.kinds && state.kinds.size > 0 && !state.kinds.has(trophy.kind)) return false;
    if (state.missableOnly && !trophy.missable) return false;
    if (state.unearnedOnly && progress.earned[trophy.id]) return false;
    if (query) {
      const haystack = [trophy.name, trophy.description, trophy.guide, trophy.tip, trophy.kind].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function sortForList(trophies) {
  return [...trophies].sort((a, b) => a.id - b.id);
}

export function nextUp(trophies, progress) {
  // The next trophy to chase: earliest roadmap stage first, then lowest id.
  const remaining = trophies.filter((t) => !progress.earned[t.id]);
  remaining.sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  return remaining[0] || null;
}
