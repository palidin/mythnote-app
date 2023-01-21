import {useState} from "react";
import {useAutoFocusInput} from "../../utils/HookUtils";

export function InputModal({title, value, updateValue, closeModal}) {

    const [bindValue, setBindValue] = useState(value);

    const ref = useAutoFocusInput();


    function onChange(e) {
        let targetValue = e.target.value;
        setBindValue(targetValue)
        updateValue(targetValue)
    }

    function onKeyDown(e) {
        if (e.key === 'Enter') {
            console.log('do validate')
            closeModal();
        }
    }

    return (
        <>
            {title}: <input type="text" value={bindValue} onInput={onChange} onKeyDown={onKeyDown} ref={ref}/>
        </>
    )
}