import '../assets/style/layout.scss';
import React from "react";
import '../assets/style/contextmenu.css'
import {useMount} from "../utils/HookUtils";
import {Left} from "./layout/Left";
import {Middle} from "./layout/Middle";
import {Right} from "./layout/Right";


export function Layout() {

    useMount(() => {
        document.oncontextmenu = () => {
            return false;
        }

        return () => document.oncontextmenu = null;
    });

    return (
        <div className={"layout"}>
            <Left/>
            <Middle/>
            <Right/>
            <div id={'popup'}></div>
            <div id={'contextmenu'}></div>
        </div>
    )
}

