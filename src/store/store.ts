import {createEntityStore} from "$source/utils/StoreUtils";

export const useAppStore = createEntityStore({

  dataRebuilding: true,

  selectIndexes: [],

  searchData: {
    page: 1,
    limit: 20,
    keywords: '',
    folder: '',
    order: {column: '', direction: ''},
  },
})

export const useTokenStore = createEntityStore({
  access_token: '',
  refresh_token: '',
}, 'token')

export const useNoteStore = createEntityStore({
  itemList: [],
  itemIndex: -1,
  fileFingerprint: null,
  refreshSeed: null,
})


export const useGitConfigStore = createEntityStore({
  repoUrl: '',
  authToken: '',
  syncInterval: 60, // 同步间隔（分钟）
  lastSyncTime: null, // 最后同步时间
  isSyncing: false, // 是否正在同步
}, 'gitConfig')
