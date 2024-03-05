import * as React from 'react'
import {useState} from 'react'
import {createEditor} from '@editablejs/models'
import {ContentEditable, EditableProvider, withEditable} from '@editablejs/editor'
import {ContextMenu, useContextMenuEffect, withCodeBlock, withImage, withPlugins} from '@editablejs/plugins'
import {Toolbar, ToolbarComponent, useToolbarEffect} from "@editablejs/plugin-toolbar";
import {createToolbarItems} from "./config/tabbar-items";

import './i18n'
import {useUpdateEffect} from "ahooks";
import {languages} from "./config/codeblock-config";
import {createContextMenuItems} from "./config/context-menu-items";
import {withHistory} from "@editablejs/plugin-history";
import {useCopyData, useMarkdown, useText} from "./config/editor-serialize";
import {transformMarkdown2Nodes, transformNodes2Markdown} from "./utils/editorUtils";
import {SideToolbar, useSideToolbarMenuEffect, withSideToolbar} from "@editablejs/plugin-toolbar/side";
import {createSideToolbarItems} from "./config/side-toolbar-items";
import imageCrawler from "$source/utils/imageCrawler";

export default function EditableEditor({markdown, onUpdate}) {
  const editor = React.useMemo(() => {
    let editor = withEditable(createEditor())
    editor = withPlugins(editor)
    editor = withHistory(editor)
    editor = withSideToolbar(editor)

    editor = withImage(editor, {
      onUpload: file => {
        return imageCrawler.upload(file)
      }
    })

    editor = withCodeBlock(editor, {
      // @ts-ignore
      languages: languages,
    })

    return editor;
  }, [])


  useContextMenuEffect(() => {
    ContextMenu.setItems(editor, createContextMenuItems(editor))
  }, editor)

  useToolbarEffect(() => {
    Toolbar.setItems(editor, createToolbarItems(editor))
  }, editor)


  useSideToolbarMenuEffect((...a) => {
    SideToolbar.setItems(editor, createSideToolbarItems(editor, ...a))
  }, editor)

  function onChangeHandler(nodes) {
    const markdown = transformNodes2Markdown(nodes, editor);
    onUpdate(markdown)
  }


  const [isReady, setIsReady] = useState(false);

  const [state, setState] = useState({
    initialValue: null,
    isFinished: false,
  });

  useMarkdown(editor, () => {
    setIsReady(true)
  });
  useText(editor);
  useCopyData(editor);

  useUpdateEffect(() => {
    const fragment = transformMarkdown2Nodes(markdown, editor);
    let value
    if (!fragment || fragment.length == 0) {
      value = null;
    } else {
      value = fragment;
    }

    if (value) {
      onChangeHandler(value)
    }
    setState({
      initialValue: value,
      isFinished: true,
    })
  }, [isReady])

  if (!state.isFinished) {
    return null;
  }


  return (
    <EditableProvider editor={editor}
                      onChange={onChangeHandler}
                      {...(state.initialValue ? {value: state.initialValue} : {})}>
      <ToolbarComponent editor={editor}/>
      <ContentEditable placeholder="Please enter content..." autoFocus={false}/>
    </EditableProvider>
  )
}
