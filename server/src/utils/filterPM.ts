const PRODUCT_PATTERNS = [
  // Manager / Management
  /product manager/i,
  /product management/i,
  // Designer / Design
  /product designer/i,
  /product design/i,
  // Owner / Analyst / Scientist / Strategist / Operations
  /product owner/i,
  /product analyst/i,
  /product scientist/i,
  /product strategist/i,
  /product operations/i,
  /product ops/i,
  /product marketing/i,
  // Seniority-prefixed product roles (e.g. "Senior Product", "Staff Product")
  /principal product/i,
  /group product/i,
  /associate product/i,
  /senior product/i,
  /staff product/i,
  /lead product/i,
  /growth product/i,
  // Leadership
  /director of product/i,
  /vp[,\s]+product/i,
  /vice president[,\s]+product/i,
  /head of product/i,
  /chief product/i,
  // Shorthand
  /\bpm\b/,
  /\bcpo\b/,
];

export function isPMRole(title: string): boolean {
  return PRODUCT_PATTERNS.some(pattern => pattern.test(title));
}
