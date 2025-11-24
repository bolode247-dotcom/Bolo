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
  const date = dayjs(createdAt);

  // Always return time in HH:mm (24-hour format)
  return date.format('HH:mm');
};

export const formatDate = (date?: Date) =>
  date ? dayjs(date).format('ddd, DD MMM YYYY') : '';

export const formatTime = (time?: Date) =>
  time ? dayjs(time).format('hh:mm A') : '';

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

export const paymentType = (paymentType: string): SalaryInfo => {
  switch (paymentType) {
    case 'contract':
      return { label: 'Budget', rate: '' };
    case 'hour':
      return { label: 'Payment', rate: '/hr' };
    case 'day':
      return { label: 'Payment', rate: '/d' };
    case 'week':
      return { label: 'Payment', rate: '/wk' };
    case 'month':
      return { label: 'Salary', rate: '/m' };
    case 'year':
      return { label: 'Payment', rate: '/yr' };
    default:
      return { label: '', rate: '' };
  }
};

export const formatSalaryRange = (
  minSalary?: number | string,
  maxSalary?: number | string,
  currency: string = 'CFA',
): string => {
  const hasMin = !!(minSalary && Number(minSalary) > 0);
  const hasMax = !!(maxSalary && Number(maxSalary) > 0);

  if (!hasMin && !hasMax) return 'N/A';

  const min = hasMin ? formatSalary(minSalary!) : '';
  const max = hasMax ? formatSalary(maxSalary!) : '';

  if (hasMin && hasMax) return `${min}-${max} ${currency}`;
  return `${min || max} ${currency}`;
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
  if (!amount || isNaN(Number(amount))) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1)}B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}k`;
  } else {
    return num.toString();
  }
};

export const getInitials = (name?: string) => {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// src/utils/colors.ts
export const pastelColors = [
  '#E0D7FF',
  '#D7F5E0',
  '#FFF3D7',
  '#FFD7E0',
  '#FDE7D7',
  '#D7F0FF',
  '#FFE0F0',
  '#E0FFF3',
  '#FFF0D7',
  '#D7FFE0',
  '#F0D7FF',
];

/**
 * Returns a random pastel color from the palette.
 * @param fallback - A fallback color if something goes wrong.
 */
export const getRandomPastelColor = (fallback: string = '#EAEAEA') => {
  const index = Math.floor(Math.random() * pastelColors.length);
  return pastelColors[index] || fallback;
};
