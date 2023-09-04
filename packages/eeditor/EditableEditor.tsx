import * as React from 'react'
import {useLayoutEffect, useState} from 'react'
import {createEditor} from '@editablejs/models'
import {
  ContentEditable,
  EditableProvider,
  parseDataTransfer,
  useIsomorphicLayoutEffect,
  withEditable
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

export default function EditableEditor({markdown, onUpdate}) {
  const editor = React.useMemo(() => {
    let editor = withEditable(createEditor())
    editor = withPlugins(editor)
    editor = withHistory(editor)

    editor = withCodeBlock(editor, {
      languages: languages
    })

    return editor;
  }, [])

  useLayoutEffect(() => {
    withMarkdownSerializerPlugin(editor)
    withMarkdownSerializerTransform(editor)
    withMarkdownDeserializerPlugin(editor)
    withMarkdownDeserializerTransform(editor)

    setValue(1)
  }, [editor])

  useIsomorphicLayoutEffect(() => {
    const {onCopy} = editor
    editor.onCopy = event => {
      const {clipboardData, type} = event
      if (!clipboardData) return;
      event.preventDefault();
      const {text} = parseDataTransfer(clipboardData)
      const textFixed = HTMLDecode(text)
      navigator.clipboard.writeText(textFixed)
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
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

function HTMLDecode(text) {
  var temp = document.createElement("div");
  temp.innerHTML = text;
  var output = temp.innerText || temp.textContent;
  temp = null;
  return output;
}
