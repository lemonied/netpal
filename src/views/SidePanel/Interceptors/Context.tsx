import React from 'react';
import type { RequestRecord, ResponseRecord } from './util';

export interface RecordState {
  id: string;
  request?: RequestRecord;
  response?: ResponseRecord;
}

interface RecordsContextType {
  records: RecordState[];
  setRecords: React.Dispatch<React.SetStateAction<RecordState[]>>;
}
export const RecordsContext = React.createContext<RecordsContextType | null>(null);

export const useRecords = (key: string) => {

  const keyRef = React.useRef(key);
  keyRef.current = key;

  const records = React.useContext(RecordsContext)?.records;
  const setRecords = React.useContext(RecordsContext)?.setRecords;

  const mergedRecords = React.useMemo(() => {
    return records?.filter(record => record.request?.key === key) || [];
  }, [key, records]);

  const clear = React.useCallback(() => {
    setRecords?.(pre => pre.filter(v => v.request?.key !== keyRef.current));
  }, [setRecords]);

  return {
    records: mergedRecords,
    clear,
  };
};
