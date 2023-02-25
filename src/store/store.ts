import {create} from 'zustand'

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

type AddSetterToObject<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (v: T[K]) => AtLeastOne<T[K]>
}

const createStore = <T extends object>(initData: T) => {

  // @ts-ignore
  return create<T & AddSetterToObject<T>>((set) => {
    let wrappedMethods2 = {};
    for (const [k] of Object.entries(initData)) {
      const v = (newValue) => {
        return {[k]: newValue}
      };
      const warpMethod = (...args: any) => {
        // @ts-ignore
        set(() => v(...args));
      };
      let setter = "set" + k.charAt(0).toUpperCase() + k.slice(1);
      wrappedMethods2[setter] = warpMethod;
    }

    return {
      ...wrappedMethods2,
      ...initData,
    }
  })
}

export const useAppStore = createStore({
  focusTag: '',

  dataRebuilding: true,

  selectIndexes: [],

  searchData: {
    page: 1,
    limit: 20,
    keywords: '',
    folder: '',
  },
})

export const useNoteStore = createStore({
  itemList: [],
  itemIndex: -1,
})
