import {ControlledMenu, MenuItem, useMenuState} from "@szhsin/react-menu";
import '@szhsin/react-menu/dist/core.css'
import {useEffect} from "react";


export function MyContextMenu({e, items}) {
    const [menuProps, toggleMenu] = useMenuState();

    useEffect(() => {
        toggleMenu(true)
    }, [e, items]);


    function onClose() {
        toggleMenu(false)
    }

    return <div>
        <ControlledMenu menuClassName="my-menu" {...menuProps} anchorPoint={{x: e.clientX, y: e.clientY}}
                        onClose={onClose}>
            {items.map((v,k) => {
                return <MenuItem key={k} onClick={v.onClick}>{v.title}</MenuItem>
            })}
        </ControlledMenu>
    </div>
}
