export function parseSalary(raw: string | null | undefined): {
  salaryRaw: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
} {
  if (!raw || raw.trim() === '') {
    return { salaryRaw: null, salaryMin: null, salaryMax: null };
  }

  const amounts: number[] = [];
  const pattern = /\$?([\d,]+)(?:k)?/gi;
  let match;
  while ((match = pattern.exec(raw)) !== null) {
    const numStr = match[1].replace(/,/g, '');
    let num = parseInt(numStr, 10);
    if (/\d+k/i.test(match[0]) || (num < 1000 && raw.toLowerCase().includes('k'))) {
      num = num * 1000;
    }
    // Only treat as salary if >= 30k
    if (num >= 30000) {
      amounts.push(num);
    }
  }

  if (amounts.length === 0) return { salaryRaw: raw, salaryMin: null, salaryMax: null };

  return {
    salaryRaw: raw,
    salaryMin: Math.min(...amounts),
    salaryMax: Math.max(...amounts),
  };
}

export function daysSince(dateStr: string | number | null | undefined): number {
  if (!dateStr) return 0;
  const posted = typeof dateStr === 'number' ? new Date(dateStr) : new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - posted.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}
