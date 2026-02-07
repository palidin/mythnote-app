const devUrl = 'http://localhost:5112';

let serverUrl = '';

//@ts-ignore
if (import.meta.env.IS_Dev) {
  serverUrl = devUrl;
}

export const appConfig = {
  // serverUrl: 'http://note.palidin.me',
  serverUrl: serverUrl,
  onlineImageUrl: 'https://image.palidin.io',
  offlineImageUrl: 'https://image.palidin.me',
}

export const TAG_TRASH = '//trash';


export const web = {
  storeKeyPrefix: 'mythnote-zustand:'
}
