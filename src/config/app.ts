const devUrl = 'http://localhost:5112';

let serverUrl = '';

//@ts-ignore
if (import.meta.env.IS_Dev) {
  serverUrl = devUrl;
}

export const appConfig = {
  serverUrl: serverUrl,
}

export const TAG_TRASH = '//trash';


export const web = {
  storeKeyPrefix: 'mythnote-zustand:'
}
