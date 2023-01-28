import {TagFolder} from "../TagFolder";
import React, {useState} from "react";
import {store} from "../../store/store";
import {useMount} from "../../utils/HookUtils";
import {myAgent} from "../../agent/agentType";
import {checkStatusTask, delayRun} from "../../utils/utils";
import {showConfirmModal} from "../../utils/MessageUtils";

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

        setFolders([...folders])
    }

    function cleanup() {

        showConfirmModal('确认要重建数据索引吗？')
            .then(() => {
                store.dataRebuilding = true;
                myAgent.cleanup()
                    .then(() => {
                        return checkStatus();
                    })
            })

    }

    async function checkStatus() {
        let res = await checkStatusTask();
        if (res) {
            store.dataRebuilding = false;
            return Promise.resolve();
        }
        return delayRun(3000)
            .then(() => checkStatus())
    }


    return (
        <div className={"left"}>
            <TagFolder folders={folders} onTagClick={onTagClick}></TagFolder>

            <div className='operation-bar'>
                <button onClick={cleanup}>清空缓存</button>
            </div>
        </div>
    );
}
