import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export interface PeriodRecord {
  id: string;
  startDate: string;
  endDate: string;
  flow: Exclude<FlowLevel, 'none'>;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  date: string;
  flow: FlowLevel;
  symptoms: string[];
  moods: string[];
  notes: string;
  createdAt: string;
}

interface StoredCycleData {
  version: 1;
  periods: PeriodRecord[];
  dailyLogs: DailyLog[];
}

type PeriodContextValue = {
  periods: PeriodRecord[];
  dailyLogs: DailyLog[];
  isReady: boolean;
  storageError: string | null;
  addPeriod: (period: Omit<PeriodRecord, 'id' | 'createdAt'>) => Promise<PeriodRecord>;
  updatePeriod: (period: PeriodRecord) => Promise<void>;
  deletePeriod: (id: string) => Promise<void>;
  addDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => Promise<DailyLog>;
  updateDailyLog: (log: DailyLog) => Promise<void>;
  deleteDailyLog: (id: string) => Promise<void>;
  findPeriod: (id: string) => PeriodRecord | undefined;
  findDailyLog: (id: string) => DailyLog | undefined;
};

const STORAGE_KEY = 'wlueoy.cycle-data.v1';
const PeriodContext = createContext<PeriodContextValue | undefined>(undefined);
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function PeriodProvider({ children }: PropsWithChildren) {
  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const dataRef = useRef<StoredCycleData>({ version: 1, periods: [], dailyLogs: [] });
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1
          || !('periods' in parsed) || !Array.isArray(parsed.periods)
          || !('dailyLogs' in parsed) || !Array.isArray(parsed.dailyLogs)) {
          throw new Error('Saved cycle data could not be read.');
        }
        if (alive) {
          const restored = parsed as StoredCycleData;
          dataRef.current = restored;
          setPeriods(restored.periods);
          setDailyLogs(restored.dailyLogs);
        }
      })
      .catch(() => {
        if (alive) setStorageError('Saved data could not be loaded. You can continue, but check your device storage.');
      })
      .finally(() => {
        if (alive) setIsReady(true);
      });
    return () => { alive = false; };
  }, []);

  const commit = useCallback((next: StoredCycleData) => {
    dataRef.current = next;
    setPeriods(next.periods);
    setDailyLogs(next.dailyLogs);
    setStorageError(null);
    const write = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)));
    writeQueue.current = write.catch(() => setStorageError('This change could not be saved to device storage.'));
    return write;
  }, []);

  const addPeriod = useCallback(async (input: Omit<PeriodRecord, 'id' | 'createdAt'>) => {
    const period = { ...input, id: makeId(), createdAt: new Date().toISOString() };
    await commit({ ...dataRef.current, periods: [...dataRef.current.periods, period] });
    return period;
  }, [commit]);
  const updatePeriod = useCallback((period: PeriodRecord) => {
    return commit({ ...dataRef.current, periods: dataRef.current.periods.map((item) => item.id === period.id ? period : item) });
  }, [commit]);
  const deletePeriod = useCallback((id: string) => {
    return commit({ ...dataRef.current, periods: dataRef.current.periods.filter((item) => item.id !== id) });
  }, [commit]);
  const addDailyLog = useCallback(async (input: Omit<DailyLog, 'id' | 'createdAt'>) => {
    const existing = dataRef.current.dailyLogs.find((log) => log.date === input.date);
    const log: DailyLog = existing
      ? { ...input, id: existing.id, createdAt: existing.createdAt }
      : { ...input, id: makeId(), createdAt: new Date().toISOString() };
    await commit({ ...dataRef.current, dailyLogs: [...dataRef.current.dailyLogs.filter((item) => item.date !== input.date), log] });
    return log;
  }, [commit]);
  const updateDailyLog = useCallback((log: DailyLog) => {
    return commit({ ...dataRef.current, dailyLogs: [...dataRef.current.dailyLogs.filter((item) => item.id !== log.id && item.date !== log.date), log] });
  }, [commit]);
  const deleteDailyLog = useCallback((id: string) => {
    return commit({ ...dataRef.current, dailyLogs: dataRef.current.dailyLogs.filter((item) => item.id !== id) });
  }, [commit]);

  const value = useMemo<PeriodContextValue>(() => ({
    periods, dailyLogs, isReady, storageError,
    addPeriod, updatePeriod, deletePeriod, addDailyLog, updateDailyLog, deleteDailyLog,
    findPeriod: (id) => periods.find((period) => period.id === id),
    findDailyLog: (id) => dailyLogs.find((log) => log.id === id),
  }), [periods, dailyLogs, isReady, storageError, addPeriod, updatePeriod, deletePeriod, addDailyLog, updateDailyLog, deleteDailyLog]);

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriods() {
  const context = useContext(PeriodContext);
  if (!context) throw new Error('usePeriods must be used inside PeriodProvider');
  return context;
}
