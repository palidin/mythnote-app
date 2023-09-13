import React, {useEffect, useRef} from "react";
import {selectStart} from "./utils";
import {useNoteStore} from "$source/store/store";

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


export function useHotkeyMove() {
  function onKeydown(e) {
    let activeElement = document.activeElement;

    if (activeElement && activeElement.tagName == 'BODY') {
      let key = e.key;
      if (key == 'ArrowDown' || key == 'ArrowUp') {
        let isDown = key == 'ArrowDown';
        let itemIndex = useNoteStore.getState().itemIndex;
        itemIndex = isDown
          ? itemIndex + 1
          : itemIndex - 1;

        if (itemIndex < useNoteStore.getState().itemList.length
          && itemIndex >= 0) {
          useNoteStore.setState({itemIndex})
          selectStart(itemIndex)
        }

        e.preventDefault();
        return false;
      }
    }
  }

  useMount(() => {
    window.addEventListener('keydown', onKeydown);

    return () => {
      document.oncontextmenu = null
      window.removeEventListener('keydown', onKeydown)
    };
  });
}
