import React from 'react';
import { getConfig, saveConfig } from '@/utils';

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
