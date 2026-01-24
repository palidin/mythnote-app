import React, {useEffect} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {Markdown} from 'tiptap-markdown';

// 基础扩展
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import {common, createLowlight} from 'lowlight';

// --- 新增 GFM 相关组件 ---
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
// StarterKit 默认包含了 Strike (删除线)，但如果需要独立配置可按需引入
import './eclipse-theme.css';

const lowlight = createLowlight(common);

interface EditorProps {
  markdown?: string;
  updateBody?: (markdown: string) => void;
}


// 1. 定义一个处理函数来修正图片属性
const ImageExtended = Image.extend({
  // 覆盖原本的属性定义，确保 alt 始终为字符串
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: '', // 默认为空字符串而非 null
        renderHTML: attributes => ({
          alt: attributes.alt,
        }),
        parseHTML: element => element.getAttribute('alt') || '',
      },
      title: {
        default: '',
        renderHTML: attributes => ({
          title: attributes.title,
        }),
        parseHTML: element => element.getAttribute('title') || '',
      },
    }
  },
});

const TiptapEditor: React.FC<EditorProps> = ({markdown = '', updateBody}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 禁用默认 codeBlock 以配合 lowlight
        codeBlock: false,
      }),
      ImageExtended.configure({
        inline: true, // 允许图片行内显示
        allowBase64: true, // 允许粘贴/直接使用 base64 图片
        HTMLAttributes: {
          class: 'rounded-lg shadow-md max-w-full h-auto my-4', // 给图片添加样式
        },
      }),
      // 1. 代码高亮
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
        HTMLAttributes: {class: 'hljs shadow-sm border rounded-md my-5'},
      }),
      // 2. 表格系统 (GFM)
      Table.configure({resizable: true}),
      TableRow,
      TableHeader,
      TableCell,
      // 3. 任务列表 (GFM: - [ ] Task)
      TaskList,
      TaskItem.configure({
        nested: true, // 允许嵌套任务
      }),
      // 4. 超链接 (GFM: 自动识别 URL)
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline underline-offset-4 cursor-pointer',
        },
      }),
      // 5. 占位符 (提升 UX)
      Placeholder.configure({
        placeholder: '输入内容，或使用 Markdown 语法...',
      }),
      // 6. Markdown 序列化支持
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: markdown,
    onUpdate: ({editor}) => {
      // @ts-ignore
      const output = editor.storage.markdown.getMarkdown();
      updateBody?.(output);
    },
  });

  useEffect(() => {
    // @ts-ignore
    if (editor && markdown !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(markdown);
    }
  }, [markdown, editor]);

  if (!editor) return null;

  return (
    <div className="editor-wrapper border rounded-lg overflow-hidden bg-white shadow-sm">
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-6 focus:outline-none"
      />
    </div>
  );
};

export default TiptapEditor;
