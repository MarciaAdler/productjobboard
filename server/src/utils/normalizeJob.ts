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

export function extractSalaryFromText(text: string | null | undefined): ReturnType<typeof parseSalary> {
  if (!text) return { salaryRaw: null, salaryMin: null, salaryMax: null };

  const patterns = [
    // $120,000 - $150,000 or $120k-$150k
    /\$[\d,]+k?\s*(?:–|-|to)\s*\$[\d,]+k?/i,
    // $120,000/yr or $120k per year
    /\$[\d,]+k?(?:\s*\/\s*(?:yr|year|hour|hr)|\s+per\s+(?:year|hour))?/i,
    // salary: $120,000 or compensation: 120k-150k
    /(?:salary|compensation|pay|base|OTE)[:\s]+\$?[\d,]+k?\s*(?:–|-|to)?\s*\$?[\d,]+k?/i,
    // 120,000 - 150,000 USD
    /[\d]{2,3},\d{3}\s*(?:–|-|to)\s*[\d]{2,3},\d{3}\s*(?:USD|CAD|GBP)?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const result = parseSalary(match[0]);
      if (result.salaryMin) return result;
    }
  }

  return { salaryRaw: null, salaryMin: null, salaryMax: null };
}

// Trim text to maxLen, ending at a paragraph, sentence, or word boundary — never mid-word.
export function trimAtBoundary(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const chunk = text.slice(0, maxLen);
  const para = chunk.lastIndexOf('\n\n');
  if (para > maxLen * 0.6) return chunk.slice(0, para).trimEnd();
  const sentence = chunk.search(/[.!?][^.!?]*$/);
  if (sentence > maxLen * 0.5) return chunk.slice(0, sentence + 1).trimEnd();
  const word = chunk.lastIndexOf(' ');
  return (word > 0 ? chunk.slice(0, word) : chunk).trimEnd();
}

export function daysSince(dateStr: string | number | null | undefined): number {
  if (!dateStr) return 0;
  const posted = typeof dateStr === 'number' ? new Date(dateStr) : new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - posted.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}
