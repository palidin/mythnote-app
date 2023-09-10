import classNames from "classnames";
import {useAppStore} from "../store/store";
import {openContextMenu} from "../utils/utils";
import {MyContextMenu} from "./MyContextMenu";
import React from "react";
import {showConfirmModal, showInputModal} from "../utils/MessageUtils";
import {myAgent} from "../agent/agentType";

export function TagFolder({folders, onTagClick, keys = []}) {

  function openFileManageContextMenu(e, value) {
    e.preventDefault();
    e.stopPropagation();
    if (keys.length == 0) return;
    let items = [
      {'title': '重命名', onClick: () => openAddTagModal(value)},
      {'title': '删除', onClick: () => openDeleteTagModal(value)},
    ]
    openContextMenu(<MyContextMenu e={e} items={items}></MyContextMenu>)
  }

  function openAddTagModal(item) {
    showInputModal('重命名标签', item.fullname)
      .then(res => {
        return myAgent.categoryRename(item.fullname, res)
      })
      .then(() => {
        location.reload();
      })
  }

  function openDeleteTagModal(item) {
    showConfirmModal(`确认删除标签"${item.fullname}"吗`)
      .then(() => {
        return myAgent.categoryDelete(item.fullname)
      })
      .then(() => {
        location.reload();
      })
  }

  const focusTag = useAppStore(state => state.searchData.folder);

  return (
    <>
      <ul className={'list-tag'}>
        {folders.map((v, k) => (
          <li key={k} className={classNames('tag-item', {
            folder: v.children && v.children.length,
            expand: v.expand,
            active: v.fullname == focusTag,
          })}>
            <div
              onContextMenu={(e) => openFileManageContextMenu(e, v)}
              className='name text-title'
              title={v.name}
              onClick={() => onTagClick(v.fullname, [...keys, k])}>
              <span>{v.name} </span>
              <i className="icon fa-solid fa-chevron-right hide"></i>
            </div>
            {v.children && v.children.length && v.expand ?
              <TagFolder folders={v.children} onTagClick={onTagClick}
                         keys={[...keys, k]}></TagFolder> : ''}
          </li>
        ))}
      </ul>
    </>
  );
}
