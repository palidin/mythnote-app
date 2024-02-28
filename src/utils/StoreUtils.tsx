import {create, createStore as createBaseStore, StoreApi, UseBoundStore, useStore as useBaseStore} from "zustand";
import {createContext, ReactNode, useContext, useRef} from "react";
import {createJSONStorage, persist} from "zustand/middleware";
import {web} from "$source/config/app";

type Setter<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void
type ActionCreator<T> = (set: Setter<T>) => T
type ProviderProps<T, S> = {
  children: ReactNode,
  values?: T | Partial<T>,
  init?: (store: S) => void
};
type ContextActions<T> = {
  updateState: Setter<T>
};

export function createContextStore<T>(initialValues: ActionCreator<T>) {
  type State = T & ContextActions<T>
  type S = StoreApi<State>

  const Context = createContext<S>(null);

  function useStore<R>(selector: (state: State) => R) {
    const storeApi = useContext(Context);
    return useBaseStore(storeApi, selector);
  }

  const Provider = ({children, values, init}: ProviderProps<State, S>) => {
    const storeRef = useRef<S>();
    if (!storeRef.current) {

      const basicValues: ActionCreator<ContextActions<State>> = (set) => ({
        updateState: (partial) => set(partial)
      })

      const store = createBaseStore<State>(
        (set) => ({
          ...initialValues(set),
          ...basicValues(set),
        })
      );
      values && store.setState({...values})
      init && init(store);

      storeRef.current = store;
    }
    return (
      <Context.Provider value={storeRef.current}>
        {children}
      </Context.Provider>
    );
  };

  return {
    useStore,
    Provider,
  };
}

type EntityActions<T> = {
  updateState: Setter<T>
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void
};
type EntityActionCreator<T, S = T & EntityActions<T>> = (set: Setter<S>) => S
type EntityStoreCreator<T> = (initialData: T) => EntityActionCreator<T>
type EntityStoreCreator2 = <T>(initialData: T, saveKey?: string) => UseBoundStore<StoreApi<T & EntityActions<T>>>

export const createEntityStore: EntityStoreCreator2 = (initialData, saveKey) => {
  type T = typeof initialData;
  const storeCreatorFn: EntityStoreCreator<T> = (initialData) => {
    return (set) => {
      const basicValues = (set) => {
        const keys = Object.keys(initialData);
        const setters = Object.fromEntries(keys.map(name => {
          return [
            'set' + name.at(0).toUpperCase() + name.slice(1),
            (value) => set({[name]: value})
          ];
        }));
        return {
          updateState: (partial) => set(partial),
          ...setters,
        } as EntityActions<T>
      };

      return {
        ...initialData,
        ...basicValues(set)
      }
    }
  };
  const storeCreator = storeCreatorFn(initialData);
  if (!saveKey) {
    return create(storeCreator);
  }
  return create(persist(storeCreator, {
    name: web.storeKeyPrefix + saveKey,
    storage: createJSONStorage(() => localStorage),
  }) as EntityActionCreator<T>)
}
