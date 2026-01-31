const devUrl = 'http://localhost:5112';
const onlineUrl = 'https://note.palidin.io/api';

let serverUrl = isDevelopment() ? devUrl : onlineUrl;

//@ts-ignore
const isPacked = import.meta.env.IS_Packed
if(isPacked){
  serverUrl = '';
}

export const appConfig = {
  // serverUrl: 'http://note.palidin.me',
  serverUrl: serverUrl,
  onlineImageUrl: 'https://image.palidin.io',
  offlineImageUrl: 'https://image.palidin.me',
}

export const TAG_TRASH = '//trash';


function isDevelopment() {
  let href = window.location.href;
  return href.includes('localhost') || href.includes('127.0.0.1') || href.includes('192.168.') || href.endsWith('test.cn')
}



export const web = {
  storeKeyPrefix: 'mythnote-zustand:'
}
