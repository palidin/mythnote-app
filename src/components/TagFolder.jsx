import React from "react";

export function TagFolder({folders, onTagClick}) {
    return (
        <>
            <ul className={'list-tag'}>
                {folders.map((v, k) => {
                    return <React.Fragment key={k}>
                        <li>
                            <div onClick={() => onTagClick(v.fullname)}>{v.name}</div>
                            {v.children && v.children.length ?
                                <TagFolder folders={v.children} onTagClick={onTagClick}></TagFolder> : ''}
                        </li>
                    </React.Fragment>
                })}
            </ul>
        </>
    );
}