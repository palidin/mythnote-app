import {withHTMLSerializerTransform} from "@editablejs/plugins/serializer/html";
import {withHTMLDeserializerTransform} from "@editablejs/plugins/deserializer/html";
import {HTMLDeserializer} from "@editablejs/deserializer/html";
import {useLayoutEffect} from "react";
import {withMarkdownSerializerPlugin, withMarkdownSerializerTransform} from "@editablejs/plugins/serializer/markdown";
import {
  withMarkdownDeserializerPlugin,
  withMarkdownDeserializerTransform
} from "@editablejs/plugins/deserializer/markdown";
import {useIsomorphicLayoutEffect, writeClipboardData} from "@editablejs/editor";
import {formatTextFromClipboard} from "../utils/editorUtils";
import {withTextSerializerTransform} from "@editablejs/plugins/serializer/text";
import {MarkdownSerializer} from "@editablejs/serializer/markdown";
import {editorSettings} from "../store";
import {MarkdownDeserializer} from "@editablejs/deserializer/markdown";
import {withEmbedTableMarkdownSerializerTransform} from "../table/serializer";
import {withEmbedTableMarkdownDeserializerTransform} from "../table/deserializer";
import {withTableCellHTMLDeserializerTransform, withTableCellHTMLSerializerTransform} from "../table/table-cell";
import {HTMLSerializer} from "@editablejs/serializer/html";

export function useText(editor) {
  useLayoutEffect(() => {
    withTextSerializerTransform(editor)
  }, [editor])
}


export function useMarkdown(editor, fn) {
  useLayoutEffect(() => {
    withMarkdownSerializerPlugin(editor)
    withMarkdownSerializerTransform(editor)
    withMarkdownDeserializerPlugin(editor)
    withMarkdownDeserializerTransform(editor)

    MarkdownSerializer.withEditor(editor, withEmbedTableMarkdownSerializerTransform, {});
    MarkdownDeserializer.withEditor(editor, withEmbedTableMarkdownDeserializerTransform, {});

    withHTMLSerializerTransform(editor)
    withHTMLDeserializerTransform(editor)

    HTMLDeserializer.withEditor(editor, withTableCellHTMLDeserializerTransform, {});
    HTMLSerializer.withEditor(editor, withTableCellHTMLSerializerTransform, {});

    fn();

    editorSettings.editorInstance = editor;
  }, [editor])
}

export function useCopyData(editor) {
  useIsomorphicLayoutEffect(() => {
    const {onCopy} = editor
    editor.onCopy = event => {
      const {clipboardData} = event
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
