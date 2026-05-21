const PM_PATTERNS = [
  /product manager/i,
  /product management/i,
  /principal product/i,
  /group product/i,
  /director of product/i,
  /vp[,\s]+product/i,
  /vice president[,\s]+product/i,
  /head of product/i,
  /chief product/i,
  /associate product/i,
  /senior product/i,
  /staff product/i,
  /lead product/i,
  /growth product/i,
  /\bpm\b/,
];

export function isPMRole(title: string): boolean {
  return PM_PATTERNS.some(pattern => pattern.test(title));
}
