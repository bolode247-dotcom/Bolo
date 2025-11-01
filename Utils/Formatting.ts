import { Message } from '@/types/genTypes';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(utc);

export const formatTimestamp = (createdAt: string): string => {
  const date = dayjs(createdAt);

  if (date.isToday()) return date.format('HH:mm'); // 24h
  if (date.isYesterday()) return 'Yesterday';
  return date.format('DD/MM/YYYY'); // older dates
};

export const formatTimeStampv2 = (createdAt: string): string => {
  const date = dayjs(createdAt).utc();

  if (date.isToday()) {
    return date.fromNow(); // ✅ Now works ("3 hours ago")
  }

  if (date.isYesterday()) {
    return 'Yesterday';
  }

  return date.format('D MMMM, YYYY'); // ✅ "28 October, 2025"
};

export const groupMessagesByDate = (messages: Message[]) => {
  return messages.reduce(
    (groups, message) => {
      const date = dayjs(message.$createdAt);
      let label = '';

      if (date.isToday()) label = 'Today';
      else if (date.isYesterday()) label = 'Yesterday';
      else label = date.format('DD/MM/YYYY'); // older messages

      if (!groups[label]) groups[label] = [];
      groups[label].push(message);
      return groups;
    },
    {} as Record<string, Message[]>,
  );
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
