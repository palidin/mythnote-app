import {create} from 'zustand'
import {createJSONStorage, persist} from "zustand/middleware";

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

type AddSetterToObject<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (v: T[K] | ((old: T[K]) => T[K])) => AtLeastOne<T[K]>
}

export const createMyStore = <T extends object>(initData: T, saveKey: string = null) => {

  if (!saveKey) {
    return create<T & AddSetterToObject<T>>(createStoreFn(initData));
  }

  // @ts-ignore
  return create<T & AddSetterToObject<T>>(persist(createStoreFn(initData), {
    name: 'zustand:' + saveKey,
    storage: createJSONStorage(() => localStorage),
  }))
}

function createStoreFn(initData) {
  return (set) => {
    let wrappedMethods2 = {};
    for (const [k] of Object.entries(initData)) {
      const v = (newValue) => {
        return {[k]: newValue}
      };
      const warpMethod = (value: any) => {
        // @ts-ignore
        set((state) => {
          let oldValue = state[k];
          let newValue
          if (value instanceof Function) {
            newValue = value(oldValue)
          } else {
            newValue = value;
          }
          return v(newValue)
        });
      };
      let setter = "set" + k.charAt(0).toUpperCase() + k.slice(1);
      wrappedMethods2[setter] = warpMethod;
    }

    return {
      ...wrappedMethods2,
      ...initData,
    }
  }
}
