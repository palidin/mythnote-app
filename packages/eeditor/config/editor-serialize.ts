import {withHTMLSerializerTransform} from "@editablejs/plugins/serializer/html";
import {withHTMLDeserializerTransform} from "@editablejs/plugins/deserializer/html";
import {HTMLDeserializer} from "@editablejs/deserializer/html";
import {withTitleHTMLDeserializerTransform} from "@editablejs/plugin-title/deserializer/html";
import {HTMLSerializer} from "@editablejs/serializer/html";
import {withTitleHTMLSerializerTransform} from "@editablejs/plugin-title/serializer/html";
import {useLayoutEffect} from "react";
import {withMarkdownSerializerPlugin, withMarkdownSerializerTransform} from "@editablejs/plugins/serializer/markdown";
import {
  withMarkdownDeserializerPlugin,
  withMarkdownDeserializerTransform
} from "@editablejs/plugins/deserializer/markdown";
import {useIsomorphicLayoutEffect, writeClipboardData} from "@editablejs/editor";
import {formatTextFromClipboard} from "../utils/editorUtils";

export function useHtml(editor) {
  useLayoutEffect(() => {
    withHTMLSerializerTransform(editor) // Adds an HTML serializer transform to the editor
    withHTMLDeserializerTransform(editor) // Adds an HTML deserializer transform to the editor
    HTMLDeserializer.withEditor(editor, withTitleHTMLDeserializerTransform, {})
    HTMLSerializer.withEditor(editor, withTitleHTMLSerializerTransform, {})
  }, [editor])
}

export function useMarkdown(editor, fn) {
  useLayoutEffect(() => {
    withMarkdownSerializerPlugin(editor)
    withMarkdownSerializerTransform(editor)
    withMarkdownDeserializerPlugin(editor)
    withMarkdownDeserializerTransform(editor)
    fn();
  }, [editor])
}

export function useCopyData(editor) {
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
}
