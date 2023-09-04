import * as React from 'react'
import {useLayoutEffect, useState} from 'react'
import {createEditor} from '@editablejs/models'
import {
  ContentEditable,
  EditableProvider,
  useIsomorphicLayoutEffect,
  withEditable,
  writeClipboardData
} from '@editablejs/editor'
import {ContextMenu, useContextMenuEffect, withCodeBlock, withPlugins} from '@editablejs/plugins'
import {Toolbar, ToolbarComponent, useToolbarEffect} from "@editablejs/plugin-toolbar";
import {withMarkdownSerializerPlugin, withMarkdownSerializerTransform} from "@editablejs/plugins/serializer/markdown";
import {MarkdownSerializer} from "@editablejs/serializer/markdown";
import {createToolbarItems} from "./config/tabbar-items";

import './i18n'
import {MarkdownDeserializer} from "@editablejs/deserializer/markdown";
import {useUpdateEffect} from "ahooks";
import {
  withMarkdownDeserializerPlugin,
  withMarkdownDeserializerTransform
} from "@editablejs/plugins/deserializer/markdown";
import {languages} from "./config/codeblock-config";
import {createContextMenuItems} from "./config/context-menu-items";
import {withHistory} from "@editablejs/plugin-history";
import {withHTMLSerializerTransform} from "@editablejs/plugins/serializer/html";
import {withHTMLDeserializerTransform} from "@editablejs/plugins/deserializer/html";
import {HTMLDeserializer} from "@editablejs/deserializer/html";
import {HTMLSerializer} from "@editablejs/serializer/html";
import {withTitleHTMLDeserializerTransform} from "@editablejs/plugin-title/deserializer/html";
import {withTitleHTMLSerializerTransform} from "@editablejs/plugin-title/serializer/html";
import {formatTextFromClipboard} from "./utils/ax";

export default function EditableEditor({markdown, onUpdate}) {
  const editor = React.useMemo(() => {
    let editor = withEditable(createEditor())
    editor = withPlugins(editor)
    editor = withHistory(editor)

    editor = withCodeBlock(editor, {
      languages: languages,
    })

    return editor;
  }, [])

  useLayoutEffect(() => {
    withMarkdownSerializerPlugin(editor)
    withMarkdownSerializerTransform(editor)
    withMarkdownDeserializerPlugin(editor)
    withMarkdownDeserializerTransform(editor)

    withHTMLSerializerTransform(editor) // Adds an HTML serializer transform to the editor
    withHTMLDeserializerTransform(editor) // Adds an HTML deserializer transform to the editor
    HTMLDeserializer.withEditor(editor, withTitleHTMLDeserializerTransform, {})
    HTMLSerializer.withEditor(editor, withTitleHTMLSerializerTransform, {})

    setValue(1)
  }, [editor])

  useIsomorphicLayoutEffect(() => {
    const {onCopy} = editor
    editor.onCopy = event => {
      const {clipboardData, type} = event
      if (!clipboardData) return;
      const textFixed = formatTextFromClipboard(clipboardData)
      clipboardData.setData('text', textFixed)
      writeClipboardData(clipboardData)
      editor.emit('copy', event)
    }
    return () => {
      editor.onPaste = onCopy
    }
  }, [editor])

  useContextMenuEffect(() => {
    ContextMenu.setItems(editor, createContextMenuItems(editor))
  }, editor)

  useToolbarEffect(() => {
    Toolbar.setItems(editor, createToolbarItems(editor))
  }, editor)


  function aaaa(nodes) {
    // const html = nodes.map(node => HTMLSerializer.transformWithEditor(editor, node)).join('')
    const contents = nodes.map(node => MarkdownSerializer.transformWithEditor(editor, node));
    const markdown = contents.map(v => MarkdownSerializer.toMarkdownWithEditor(editor, v)).join('\n')
    onUpdate(markdown)
  }

  function bbbb(markdown) {
    const mdast = MarkdownDeserializer.toMdastWithEditor(editor, markdown)
    return MarkdownDeserializer.transformWithEditor(editor, mdast);
  }

  const [value, setValue] = useState(0);


  useUpdateEffect(() => {
    markdown = markdown.replace(/  \n/g, '\n\n')
    const fragment = bbbb(markdown);
    editor.insertFragment(fragment)
  }, [value])

  return (
    <EditableProvider editor={editor} onChange={aaaa}>
      <ToolbarComponent editor={editor} disabled={false}/>
      <ContentEditable placeholder="Please enter content..."/>
    </EditableProvider>
  )
}
