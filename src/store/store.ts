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
  token: '',
}, 'token')

export const useNoteStore = createEntityStore({
  itemList: [],
  itemIndex: -1,
  fileFingerprint: null,
  refreshSeed: null,
})


export const useServerStore = createEntityStore({
  url: null,
})
