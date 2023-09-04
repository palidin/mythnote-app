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
      onSearch?.();
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
    />
  )
}
