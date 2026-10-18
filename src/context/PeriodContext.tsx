import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type PeriodRecord = {
  id: number;
  month: string;
  startDate: string;
  endDate: string;
  duration: number;
  startDateKey?: string;
};

export type DailyLog = {
  id: number;
  date: string;
  flow: FlowLevel;
  symptoms: string[];
  moods: string[];
  notes: string;
};

export const initialPeriodHistory: PeriodRecord[] = [
  { id: 1, month: 'July 2026', startDate: '7 Jul', endDate: '12 Jul', duration: 6, startDateKey: '2026-07-07' },
  { id: 2, month: 'August 2026', startDate: '4 Aug', endDate: '9 Aug', duration: 6, startDateKey: '2026-08-04' },
  { id: 3, month: 'September 2026', startDate: '1 Sep', endDate: '6 Sep', duration: 6, startDateKey: '2026-09-01' },
];

type PeriodContextValue = {
  periods: PeriodRecord[];
  dailyLogs: DailyLog[];
  addPeriod: (period: Omit<PeriodRecord, 'id'>) => PeriodRecord;
  addDailyLog: (log: Omit<DailyLog, 'id'>) => DailyLog;
  findPeriod: (id: number) => PeriodRecord | undefined;
  findDailyLog: (id: number) => DailyLog | undefined;
};

const PeriodContext = createContext<PeriodContextValue | undefined>(undefined);

export function PeriodProvider({ children }: PropsWithChildren) {
  const [periods, setPeriods] = useState<PeriodRecord[]>(initialPeriodHistory);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);

  const value = useMemo<PeriodContextValue>(() => {
    const addPeriod = (period: Omit<PeriodRecord, 'id'>) => {
      const nextPeriod: PeriodRecord = { ...period, id: Date.now() };
      setPeriods((currentPeriods) => [...currentPeriods, nextPeriod]);
      return nextPeriod;
    };

    const addDailyLog = (log: Omit<DailyLog, 'id'>) => {
      const nextLog: DailyLog = { ...log, id: Date.now() };
      setDailyLogs((currentLogs) => {
        const withoutSameDate = currentLogs.filter((currentLog) => currentLog.date !== nextLog.date);
        return [...withoutSameDate, nextLog];
      });
      return nextLog;
    };

    const findPeriod = (id: number) => periods.find((period) => period.id === id);
    const findDailyLog = (id: number) => dailyLogs.find((log) => log.id === id);

    return { periods, dailyLogs, addPeriod, addDailyLog, findPeriod, findDailyLog };
  }, [periods, dailyLogs]);

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriods() {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error('usePeriods must be used inside PeriodProvider');
  }
  return context;
}
