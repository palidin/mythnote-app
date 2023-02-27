import React, {useEffect, useRef} from "react";
import {debounce} from "./utils";

export function useMount(fn, deps = []) {
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) {
      return;
    }
    ref.current = true;
    return fn();
  }, deps)
}

export const useDebounceSingleParameter = (callback, delay = 200) => {
  const dispatchValue = (value) => callback?.(value)

  const setValueDebounced = useRef(debounce(dispatchValue, delay))

  return (value) => setValueDebounced.current(value)
}

export const useDebounce = (callback, delay = 800) => {
  const dispatchValue = (...value) => callback?.(...value)

  const setValueDebounced = useRef(debounce(dispatchValue, delay))

  return (...value) => setValueDebounced.current(...value)
}

export const useAutoFocusInput = () => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return inputRef;
};

export function MySelect({columns, onChange, value}) {
  function onChangeOrderColumn(e) {
    onChange(e.target.value)
  }

  return (
    <select onChange={onChangeOrderColumn} value={value}>
      {columns.map(v => (<option key={v}>{v}</option>))}
    </select>
  )

}
