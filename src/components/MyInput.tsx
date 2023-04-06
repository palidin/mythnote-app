import {useEffect, useState} from "react";

export function MyInput({value, onChange}) {

  const [tempValue, setTempValue] = useState(value);
  const [isOnComposition, setIsOnComposition] = useState(false);

  useEffect(() => {
    setTempValue(value)
  }, [value])

  function handleComposition(e) {
    if (e.type === 'compositionend') {
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

  return (
    <input
      type="text"
      value={tempValue}
      onCompositionStart={handleComposition}
      onCompositionUpdate={handleComposition}
      onCompositionEnd={handleComposition}
      onChange={handleOnChange}
    />
  )
}
