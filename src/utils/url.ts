export const url2string = (url: URL | string) => {
  return url instanceof window.URL ? url.href : `${url}`;
};

export const transformUrl = (url: string, referTo: string | URL) => {
  return referTo instanceof window.URL ? new URL(url, window.location.href) : url;
};
