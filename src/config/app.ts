const devUrl = 'http://api-myth-note.test.cn';
const onlineUrl = 'http://note.palidin.io/api';

// const serverUrl = isDevelopment() ? devUrl : onlineUrl;
const serverUrl =  onlineUrl;

export const appConfig = {
  // serverUrl: 'http://note.palidin.me',
  serverUrl: serverUrl,
  onlineImageUrl: 'https://image.palidin.io',
  offlineImageUrl: 'http://image.palidin.me',
}

export const TAG_TRASH = '//trash';


function isDevelopment() {
  let href = window.location.href;
  return href.includes('localhost') || href.includes('127.0.0.1') || href.includes('192.168.') || href.endsWith('test.cn')
}


export const web = {
  storeKeyPrefix: 'mythnote-zustand:'
}
