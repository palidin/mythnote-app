import {parseDataTransfer, readClipboardData} from "@editablejs/editor";
import {MarkdownDeserializer} from "@editablejs/deserializer/markdown";
import {MarkdownSerializer} from "@editablejs/serializer/markdown";
import {Editor} from "@editablejs/models";
import {TextSerializer} from "@editablejs/serializer/text";

export function readCopyText() {
  return readClipboardData()
    .then(clipboardData => {
      return formatTextFromClipboard(clipboardData);
    })
}

export function readSelectText(editor) {
  const elements = Editor.elements(editor)
  const nodes = elements['paragraph'].map(v => v[0]);
  const text = nodes.map(node => TextSerializer.transformWithEditor(editor, node)).join('\n')
  return HTMLDecode(text);
}

export function formatTextFromClipboard(clipboardData: DataTransfer) {
  const {text} = parseDataTransfer(clipboardData)
  return HTMLDecode(text);
}

function HTMLDecode(text) {
  let temp = document.createElement("div");
  temp.innerHTML = text;
  let output = temp.innerText || temp.textContent;
  temp = null;
  return output;
}

export function transformMarkdown2Nodes(markdown, editor) {
  markdown = markdown.replace(/  \n/g, '\n\n')
  const mdast = MarkdownDeserializer.toMdastWithEditor(editor, markdown)
  return MarkdownDeserializer.transformWithEditor(editor, mdast);
}

export function transformNodes2Markdown(nodes, editor) {
  const contents = nodes.map(node => MarkdownSerializer.transformWithEditor(editor, node));
  return contents.map(v => MarkdownSerializer.toMarkdownWithEditor(editor, v)).join('\n')
}
