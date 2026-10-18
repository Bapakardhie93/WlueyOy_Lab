import type { DailyLog, PeriodRecord } from '@/context/PeriodContext';
import {
  addDays,
  differenceInDays,
  fromDateKey,
  startOfDay,
  toDateKey,
} from '@/utils/date';

const DEFAULT_CYCLE_LENGTH = 28;

function getLoggedPeriodStartKeys(dailyLogs: DailyLog[]) {
  const periodDates = new Set(
    dailyLogs
      .filter((log) => log.flow !== 'none')
      .map((log) => log.date),
  );

  return [...periodDates]
    .filter((dateKey) => !periodDates.has(toDateKey(addDays(fromDateKey(dateKey), -1))))
    .sort();
}

function getPeriodStartKeys(periods: PeriodRecord[], dailyLogs: DailyLog[]) {
  const storedPeriodStarts = periods
    .map((period) => period.startDateKey)
    .filter((dateKey): dateKey is string => Boolean(dateKey));

  return [...new Set([...storedPeriodStarts, ...getLoggedPeriodStartKeys(dailyLogs)])]
    .sort();
}

export type CyclePrediction = {
  nextPeriodDate: Date;
  cycleDay: number;
  daysUntilNextPeriod: number;
  averageCycleLength: number;
};

export function getCyclePrediction(
  periods: PeriodRecord[],
  dailyLogs: DailyLog[],
  today: Date,
): CyclePrediction {
  const periodStartKeys = getPeriodStartKeys(periods, dailyLogs);
  const periodStartDates = periodStartKeys.map(fromDateKey);
  const cycleLengths = periodStartDates.slice(1).map((date, index) =>
    differenceInDays(periodStartDates[index], date),
  );
  const averageCycleLength = cycleLengths.length
    ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
    : DEFAULT_CYCLE_LENGTH;

  const normalizedToday = startOfDay(today);
  const lastPeriodStart = periodStartDates.at(-1) ?? normalizedToday;
  let nextPeriodDate = addDays(lastPeriodStart, averageCycleLength);
  const daysSinceLastPeriod = differenceInDays(lastPeriodStart, normalizedToday);

  while (nextPeriodDate < normalizedToday) {
    nextPeriodDate = addDays(nextPeriodDate, averageCycleLength);
  }

  return {
    nextPeriodDate,
    cycleDay: Math.max(1, (daysSinceLastPeriod % averageCycleLength) + 1),
    daysUntilNextPeriod: Math.max(0, differenceInDays(normalizedToday, nextPeriodDate)),
    averageCycleLength,
  };
}
