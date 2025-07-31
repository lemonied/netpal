import React from 'react';
import type { RequestRecord, ResponseRecord } from './util';
import { getConfig, saveConfig } from '@/utils';

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

export interface Config {
  enableDebug: boolean;
}
export interface ConfigContextType {
  config: Config;
  setConfig?: React.Dispatch<React.SetStateAction<Config>>;
}
export const ConfigContext = React.createContext<ConfigContextType>({
  config: {
    enableDebug: true,
  },
});
interface ConfigProviderProps {
  children?: React.ReactNode;
}
export const ConfigProvider = (props: ConfigProviderProps) => {

  const { children } = props;

  const [ready, setReady] = React.useState(false);

  const [config, set] = React.useState<Config>(() => {
    return {
      enableDebug: true,
    };
  });
  const configRef = React.useRef(config);

  const setConfig = React.useCallback<React.Dispatch<React.SetStateAction<Config>>>((config) => {
    if (typeof config === 'function') {
      configRef.current = config(configRef.current);
    } else {
      configRef.current = config;
    }
    set(configRef.current);
    saveConfig(configRef.current);
  }, []);

  React.useEffect(() => {
    getConfig().then(res => {
      if (res) {
        setConfig(res);
        setReady(true);
      }
    });
  }, [setConfig]);

  if (!ready) {
    return null;
  }

  return (
    <ConfigContext.Provider
      value={{
        config,
        setConfig,
      }}
    >{children}</ConfigContext.Provider>
  );
};
export const useConfig = () => React.useContext(ConfigContext);
