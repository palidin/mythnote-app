import {useState} from "react";
import {useAutoFocusInput} from "../../utils/HookUtils";
import {useDialogStateStore} from "$source/store/dialog";

export function InputModal({title, value}) {

  const [bindValue, setBindValue] = useState(value);

  const ref = useAutoFocusInput();
  const onSubmit = useDialogStateStore(state => state.onSubmit);
  const onUpdate = useDialogStateStore(state => state.onUpdate);


  function onChange(e) {
    const targetValue = e.target.value;
    setBindValue(targetValue)
    onUpdate(targetValue)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      const targetValue = e.target.value;
      if (targetValue.trim()) {
        onSubmit();
      }
    }
  }

  return (
    <>
      {title}: <input type="text" value={bindValue} onInput={onChange} onKeyDown={onKeyDown} ref={ref}/>
    </>
  )
}
