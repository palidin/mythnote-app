import {createMyStore} from "$source/utils/StoreUtils";

export const useAppStore = createMyStore({

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

export const useNoteStore = createMyStore({
  itemList: [],
  itemIndex: -1,
})

export const useEditorStore = createMyStore({
  sourceEditing: false,
})
