import {TagFolder} from "../TagFolder";
import React, {useState} from "react";
import {store} from "../../store/store";
import {useMount} from "../../utils/HookUtils";
import {myAgent} from "../../agent/agentType";

export function Left() {

    const [folders, setFolders] = useState([]);

    useMount(() => {
        myAgent.categoryList()
            .then(res => setFolders(res))
    })

    function onTagClick(folder, keys) {
        let current: any = folders;

        let index = 0;
        for (let key of keys) {
            if (index++ == 0) {
                current = current[key];
            } else {
                current = current.children[key];
            }
        }

        if (!(current.fullname == '' && current.expand && !!store.focusTag)) {
            current.expand = !current.expand;
        }

        store.focusTag = current.fullname;

        console.log(current.fullname)

        setFolders([...folders])
    }

    return (
        <div className={"left"}>
            <TagFolder folders={folders} onTagClick={onTagClick}></TagFolder>
        </div>
    );
}
