// VS Code-ish fuzzy scorer: subsequence match with bonuses for
// consecutive runs, word boundaries (/ - _ . and camel humps) and prefix.
// Returns null on no-match, higher = better.

export function fuzzyScore(query: string, text: string): number | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (q.length === 0) return 0;
  let score = 0;
  let ti = 0;
  let run = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    let found = -1;
    for (let i = ti; i < t.length; i++) {
      if (t[i] === ch) {
        found = i;
        break;
      }
    }
    if (found < 0) return null;
    const gap = found - ti;
    const prev = found > 0 ? t[found - 1] : "";
    const boundary =
      found === 0 || prev === "/" || prev === "-" || prev === "_" || prev === "." || prev === " ";
    const camel = found > 0 && /[a-z]/.test(prev) && /[A-Z]/.test(text[found]);
    if (gap === 0) {
      run += 1;
      score += 10 + run * 5 + (boundary ? 8 : 0) + (camel ? 6 : 0);
    } else {
      run = 0;
      score += (boundary ? 6 : 0) - Math.min(gap, 6);
    }
    if (qi === 0 && found === 0) score += 12;
    ti = found + 1;
  }
  // Prefer shorter candidates on ties.
  score -= Math.max(0, t.length - q.length) * 0.2;
  return score;
}
