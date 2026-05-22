export function formatTimeAgo(postedAt: string): string {
  const diffMs = Date.now() - new Date(postedAt).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diffMs / 86400000);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1mo ago' : `${months}mo ago`;
}

export function timeAgoColor(postedAt: string): string {
  const diffMs = Date.now() - new Date(postedAt).getTime();
  const hours = diffMs / 3600000;
  if (hours < 24) return 'bg-green-100 text-green-800';
  if (hours < 24 * 7) return 'bg-blue-100 text-blue-800';
  if (hours < 24 * 30) return 'bg-gray-100 text-gray-600';
  return 'bg-gray-50 text-gray-400';
}

export function formatSalary(min: number | null, max: number | null, raw: string | null): string | null {
  if (min && max && min !== max) {
    return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k`;
  }
  if (min) return `$${(min / 1000).toFixed(0)}k+`;
  if (raw) return raw;
  return null;
}

export const ATS_LABELS: Record<string, string> = {
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  ashby: 'Ashby',
  smartrecruiters: 'SmartRecruiters',
  workable: 'Workable',
  workday: 'Workday',
  recruitee: 'Recruitee',
  personio: 'Personio',
  bamboohr: 'BambooHR',
  jobvite: 'Jobvite',
  icims: 'iCIMS',
  jazzhr: 'JazzHR',
  ultipro: 'UltiPro',
  adp: 'ADP',
  successfactors: 'SuccessFactors',
  pinpoint: 'Pinpoint',
  manatal: 'Manatal',
};
