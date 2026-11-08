import type { DailyLog, PeriodRecord } from '@/context/PeriodContext';
import { addDays, differenceInDays, fromDateKey, startOfDay, toDateKey } from '@/utils/date';

export interface CycleSummary {
  nextPeriodDate: Date | null;
  cycleDay: number | null;
  daysUntilNextPeriod: number | null;
  averageCycleLength: number | null;
  cycleLengths: number[];
  averagePeriodLength: number | null;
  cycleVariation: number | null;
  hasEnoughData: boolean;
}

export function getCycleSummary(periods: PeriodRecord[], dailyLogs: DailyLog[], today: Date): CycleSummary {
  const startsFromPeriods = periods.map((period) => period.startDate).filter(isDateKey);
  const bleedingDates = new Set(dailyLogs.filter((log) => log.flow !== 'none').map((log) => log.date));
  const startsFromLogs = [...bleedingDates].filter((key) => !bleedingDates.has(toDateKey(addDays(fromDateKey(key), -1)))
    && !periods.some((period) => period.startDate <= key && period.endDate >= key));
  const starts = [...new Set([...startsFromPeriods, ...startsFromLogs])].sort();
  const cycleLengths = starts.slice(1).map((key, index) => differenceInDays(fromDateKey(starts[index]), fromDateKey(key)));
  const recentLengths = cycleLengths.slice(-6).filter((length) => length > 0);
  const avg = recentLengths.length ? Math.round(recentLengths.reduce((sum, n) => sum + n, 0) / recentLengths.length) : null;
  const variation = recentLengths.length > 1 ? Math.max(...recentLengths) - Math.min(...recentLengths) : null;
  const sortedPeriods = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const durations = sortedPeriods.map((period) => differenceInDays(fromDateKey(period.startDate), fromDateKey(period.endDate)) + 1).filter((n) => n > 0 && n <= 30).slice(-6);
  const averagePeriodLength = durations.length ? Math.round(durations.reduce((sum, n) => sum + n, 0) / durations.length) : null;
  const todayKey = toDateKey(startOfDay(today));
  const lastStartKey = starts.at(-1);
  if (!lastStartKey) return { nextPeriodDate: null, cycleDay: null, daysUntilNextPeriod: null, averageCycleLength: avg, cycleLengths: recentLengths, averagePeriodLength, cycleVariation: variation, hasEnoughData: false };

  const daysSinceStart = differenceInDays(fromDateKey(lastStartKey), fromDateKey(todayKey));
  const cycleDay = daysSinceStart >= 0 && avg ? (daysSinceStart % avg) + 1 : null;
  const nextPeriodDate = avg && recentLengths.length >= 1
    ? addDays(fromDateKey(lastStartKey), Math.max(avg, Math.ceil((daysSinceStart + 1) / avg) * avg))
    : null;
  return {
    nextPeriodDate,
    cycleDay,
    daysUntilNextPeriod: nextPeriodDate ? Math.max(0, differenceInDays(fromDateKey(todayKey), nextPeriodDate)) : null,
    averageCycleLength: avg,
    cycleLengths: recentLengths,
    averagePeriodLength,
    cycleVariation: variation,
    hasEnoughData: recentLengths.length > 0,
  };
}

function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toDateKey(fromDateKey(value)) === value;
}

export function getPeriodForDate(periods: PeriodRecord[], dateKey: string) {
  return periods.find((period) => period.startDate <= dateKey && period.endDate >= dateKey);
}
