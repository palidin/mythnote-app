import {Editable, parseDataTransfer} from "@editablejs/editor";
import {MarkdownDeserializer} from "@editablejs/deserializer/markdown";
import {MarkdownSerializer} from "@editablejs/serializer/markdown";
import {Editor, Transforms} from "@editablejs/models";
import {TextSerializer} from "@editablejs/serializer/text";
import {CodeBlock} from "@editablejs/plugins";
import {xTableColumn} from "../table/embed-table-constant";

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

export function getCodeBlockElement(editor) {
  const elements = Editor.elements(editor)
  const children = elements['codeblock']
  return children[0][0] as CodeBlock;
}

export function updateTableElement(editor, element, options) {
  editor.normalizeSelection(selection => {
    if (editor.selection !== selection) editor.selection = selection
    Transforms.setNodes(
      editor,
      {
        ...options,
      },
      {
        at: Editable.findPath(editor, element),
        hanging: false,
      },
    )
  })
}

export function isActiveTable(editor) {
  const elements = Editor.elements(editor)
  const children = elements['table']
  return children[0][0][xTableColumn];
}

export function createHtmlNode(htmlStr) {
  let div = document.createElement("div");
  div.innerHTML = htmlStr.trim();
  return div.childNodes[0];
}

export function createParagraphWithNodes(nodes) {
  let div = document.createElement("p");
  for (const node of nodes) {
    div.appendChild(node);
  }
  return div;
}
