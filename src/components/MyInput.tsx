import {useEffect, useState} from "react";

export function MyInput({value, onChange,  onToggle = null}) {

  const [tempValue, setTempValue] = useState(value ?? '');
  const [isOnComposition, setIsOnComposition] = useState(false);



  useEffect(() => {
    setTempValue(value)
  }, [value])

  function handleComposition(e) {
    if (e.type === 'compositionend') {
      setIsOnComposition(false)
      onChange(e)
    } else {
      setIsOnComposition(true)
    }
  }

  function handleOnChange(e) {
    setTempValue(e.target.value)
    if (!isOnComposition) {
      onChange(e)
    }
  }

  function onToggleHandler(isFocusing = false) {
    onToggle?.(isFocusing)
  }

  return (
    <input
      onFocus={() => onToggleHandler(true)}
      onBlur={() => onToggleHandler(false)}
      type="text"
      defaultValue={tempValue}
      onCompositionStart={handleComposition}
      onCompositionUpdate={handleComposition}
      onCompositionEnd={handleComposition}
      onChange={handleOnChange}
    />
  )
}
