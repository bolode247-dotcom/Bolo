export const getTimeAgo = (createdAt: string) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - created.getTime()) / 1000); // in seconds

  const pluralize = (value: number, unit: string) =>
    `${value} ${unit}${value > 1 ? 's' : ''} ago`;

  if (diff < 60) return pluralize(diff, 'second');

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return pluralize(minutes, 'min');

  const hours = Math.floor(diff / 3600);
  if (hours < 24) return pluralize(hours, 'hr');

  const days = Math.floor(diff / 86400);
  if (days < 7) return pluralize(days, 'day');

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return pluralize(weeks, 'week');

  const months = Math.floor(days / 30);
  if (months < 12) return pluralize(months, 'month');

  const years = Math.floor(days / 365);
  return pluralize(years, 'year');
};

type SalaryInfo = {
  label: string;
  rate: string;
};

export const salaryType = (salaryType: string): SalaryInfo => {
  switch (salaryType) {
    case 'contract':
      return { label: 'Budget', rate: '' };
    case 'hour':
      return { label: 'Payment', rate: '/hr' };
    case 'day':
      return { label: 'Payment', rate: '/day' };
    case 'week':
      return { label: 'Payment', rate: '/week' };
    case 'month':
      return { label: 'Salary', rate: '/month' };
    case 'year':
      return { label: 'Payment', rate: '/year' };
    default:
      return { label: '', rate: '' };
  }
};

export const formatJobType = (type: string) => {
  switch (type) {
    case 'contract':
      return 'Contract';
    case 'part-time':
      return 'Part Time';
    case 'full-time':
      return 'Full Time';
    case 'internship':
      return 'Internship';
    default:
      return '';
  }
};

export const formatSalary = (amount: number | string): string => {
  if (!amount) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString(); // adds commas automatically
};
