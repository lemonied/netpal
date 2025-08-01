import React from 'react';
import type { RequestRecord, ResponseRecord } from '../utils';
import { useRuntimeMessageListener } from '@/hooks';

export interface RecordState {
  id: string;
  request?: RequestRecord;
  response?: ResponseRecord;
}

interface RecordsContextType {
  records: RecordState[];
  setRecords: React.Dispatch<React.SetStateAction<RecordState[]>>;
}
const RecordsContext = React.createContext<RecordsContextType | null>(null);

export const useRecords = () => {

  const records = React.useContext(RecordsContext)?.records;
  const setRecords = React.useContext(RecordsContext)?.setRecords;

  const clear = React.useCallback(() => {
    setRecords?.([]);
  }, [setRecords]);

  return {
    records,
    clear,
  };
};

export const RecordsProvider = (props: React.PropsWithChildren) => {

  const { children } = props;

  const [records, setRecords] = React.useState<RecordState[]>([]);

  useRuntimeMessageListener<RequestRecord | ResponseRecord>('intercept-records', (data) => {
    setRecords(pre => {
      const index = pre.findIndex(v => v.id === data.id);
      if (index > -1) {
        const item = pre[index];
        const ret = pre.slice();
        ret.splice(index, 1, {
          ...item,
          [data.type]: data,
        });
        return ret;
      }
      if (data.type === 'request') {
        return [
          {
            id: data.id,
            [data.type]: data,
          },
          ...pre,
        ];
      }
      return pre;
    });
  });

  return (
    <RecordsContext.Provider
      value={{
        records,
        setRecords,
      }}
    >{children}</RecordsContext.Provider>
  );
};
