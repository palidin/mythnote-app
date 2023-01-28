import '../assets/style/layout.scss';
import React from "react";
import '../assets/style/contextmenu.css'
import {useMount} from "../utils/HookUtils";
import {Left} from "./layout/Left";
import {Middle} from "./layout/Middle";
import {Right} from "./layout/Right";
import {myAgent} from "../agent/agentType";
import {store} from "../store/store";
import {checkStatusTask} from "../utils/utils";


export function Layout() {

    useMount(() => {
        document.oncontextmenu = () => {
            return false;
        }

        checkStatusTask()
            .then(ok => {
                store.dataRebuilding = !ok;
            })

        return () => document.oncontextmenu = null;
    });

    if (store.dataRebuilding) {
        return '数据索引中...';
    }

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

