import {useAppStore} from "../store/store";
import {openContextMenu} from "../utils/utils";
import {MyContextMenu} from "./MyContextMenu";
import React from "react";
import {showConfirmModal, showInputModal} from "../utils/MessageUtils";
import {myAgent} from "../agent/agentType";
import clsx from "clsx";


const ChevronRightIcon = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 512"
    fill="currentColor"
    className={className}
    {...props}
    width="1em"
    height="1em"
  >
    <path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/>
  </svg>
);

export function TagFolder({folders, onTagClick, keys = [], keyword = ''}) {

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

  const renderHighlightedText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="text-yellow-400 font-bold">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <ul className="list-none m-0 p-0">
        {folders.map((v, k) => {
          const hasChildren = v.children && v.children.length > 0;
          const isActive = v.fullname == focusTag;
          const isExpanded = v.expand;

          // 判断是否应该显示数量：只有一级目录且count是有效正数
          const isFirstLevel = keys.length === 0;
          let shouldShowCount = true;

          if (isFirstLevel) {
            const countValue = v.count;
            if (countValue != null && countValue !== '') {
              const countNum = Number(countValue);
              if (Number.isFinite(countNum) && countNum > 0) {
                shouldShowCount = true;
              }
            }
          }

          return (
            <li key={k} className="select-none">
              <div
                onContextMenu={(e) => openFileManageContextMenu(e, v)}
                className={clsx(
                  'flex flex-row items-center px-3 py-2 rounded-lg cursor-pointer transition-colors text-title',
                  'hover:bg-[#2d3748]',
                  {
                    'bg-[#2d3748]': isActive,
                  }
                )}
                title={v.name}
                onClick={() => onTagClick(v.fullname, [...keys, k])}
              >
                <div className="flex-1 min-w-0 flex items-center">
                  <span>{renderHighlightedText(v.name, keyword)}</span>
                  {shouldShowCount && (
                    <span className='ml-1 text-xs text-white/60'>({v.count})</span>
                  )}
                </div>
                {hasChildren && (
                  <div className="flex items-center ml-2">
                    <ChevronRightIcon
                      className={clsx(
                        'text-xs text-white/75 transition-transform duration-200',
                        {
                          'rotate-90': isExpanded,
                          'rotate-0': !isExpanded,
                        }
                      )}
                    />
                  </div>
                )}
              </div>

              {hasChildren && isExpanded && (
                <div className="ml-4 mt-1">
                  <TagFolder
                    folders={v.children}
                    onTagClick={onTagClick}
                    keys={[...keys, k]}
                    keyword={keyword}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
