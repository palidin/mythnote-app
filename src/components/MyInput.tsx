import {useEffect, useState} from "react";

export function MyInput({value = '', onChange, onToggle = null, onSearch = null}) {

  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    if (tempValue != value) {
      setTempValue(value)
    }
  }, [value])


  function handleOnChange(e) {
    const value = e.target.value;
    setTempValue(value)
    onChange(value)
  }

  function onToggleHandler(isFocusing = false) {
    onToggle?.(isFocusing)
  }

  function onKeydownHandler(e) {
    if (e.key === "Enter") {
      onSearch?.(tempValue);
    }
  }

  return (
    <input
      onFocus={() => onToggleHandler(true)}
      onBlur={() => onToggleHandler(false)}
      type="text"
      value={tempValue}
      onChange={handleOnChange}
      onKeyDown={onKeydownHandler}
      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
      placeholder="搜索笔记..."
    />
  )
}
