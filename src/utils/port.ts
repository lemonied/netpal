
interface PortListenerOption {
  onDisconnect?: (port: chrome.runtime.Port) => void;
  onMessage?: (message: any, port: chrome.runtime.Port) => boolean | void;
}
export const portListener = (option: PortListenerOption, port?: chrome.runtime.Port) => {
  const uninstallers: (() => void)[] = [];
  const uninstall = () => uninstallers.forEach(fn => fn());
  const handleMessage = (message: any, port: chrome.runtime.Port) => {
    const res = option.onMessage?.(message, port);
    if (res === true) {
      uninstall();
    }
  };
  const handleDisconnect = (port: chrome.runtime.Port) => {
    option.onDisconnect?.(port);
    uninstall();
  };
  uninstallers.push(() => {
    port?.onMessage.removeListener(handleMessage);
  }, () => {
    port?.onDisconnect.removeListener(handleDisconnect);
  });
  port?.onMessage.addListener(handleMessage);
  port?.onDisconnect.addListener(handleDisconnect);

  return uninstall;
};
