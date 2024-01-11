const devUrl = 'http://api-myth-note.test.cn';
const onlineUrl = '/api';

const serverUrl = isDevelopment() ? devUrl : onlineUrl;

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
