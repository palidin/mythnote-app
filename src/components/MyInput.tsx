import {useEffect, useState} from "react";

export function MyInput({value = '', onChange, onToggle = null}) {

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

  return (
    <input
      onFocus={() => onToggleHandler(true)}
      onBlur={() => onToggleHandler(false)}
      type="text"
      value={tempValue}
      onChange={handleOnChange}
    />
  )
}
