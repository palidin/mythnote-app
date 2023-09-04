import React, {FC, useCallback} from 'react'
import {Editable, useEditable} from '@editablejs/editor'
import {Editor, Grid} from '@editablejs/models'
import {
  AlignEditor,
  BackgroundColorEditor,
  BlockquoteEditor,
  CodeBlock,
  CodeBlockEditor,
  FontColorEditor,
  FontSizeEditor,
  HeadingEditor,
  HeadingType,
  HrEditor,
  ImageEditor,
  LinkEditor,
  MarkEditor,
  MarkFormat,
  OrderedListEditor,
  TableEditor,
  TaskListEditor,
  UnorderedListEditor,
} from '@editablejs/plugins'
import {HistoryEditor} from '@editablejs/plugin-history'
import {ToolbarItem} from '@editablejs/plugin-toolbar'
import {Icon, IconMap} from '@editablejs/ui'
import {Translation} from 'react-i18next'

import {languages} from "./codeblock-config";
import {editorSettings} from "../store";
import {EMPTY_LINE_WORDS} from "./charlist";
import {readCopyText} from "../utils/ax";

export const AlignDropdown: FC = () => {
  const editor = useEditable()
  const getAlign = useCallback(() => {
    const value = AlignEditor.queryActive(editor)
    switch (value) {
      case 'center':
        return 'alignCenter'
      case 'right':
        return 'alignRight'
      case 'justify':
        return 'alignJustify'
    }
    return 'alignLeft'
  }, [editor])
  const name: keyof typeof IconMap = getAlign()
  return <Icon name={name}/>
}

const marks: MarkFormat[] = ['bold', 'italic', 'underline', 'strikethrough', 'code']


export const createToolbarItems = (editor: Editable) => {
  const items: ToolbarItem[] = [
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.undo')}</Translation>,
      disabled: !HistoryEditor.canUndo(editor),
      icon: <Icon name="undo"/>,
      onToggle: () => {
        HistoryEditor.undo(editor)
      },
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.redo')}</Translation>,
      disabled: !HistoryEditor.canRedo(editor),
      icon: <Icon name="redo"/>,
      onToggle: () => {
        HistoryEditor.redo(editor)
      },
    },
  ]
  const markItems: ToolbarItem[] = marks.map(mark => ({
    type: 'button',
    title: <Translation>{t => t(`playground.editor.plugin.${mark}`)}</Translation>,
    active: MarkEditor.isActive(editor, mark),
    icon: <Icon name={mark}/>,
    onToggle: () => {
      MarkEditor.toggle(editor, mark)
    },
  }))
  items.push('separator', ...markItems)
  items.push(
    'separator',
    {
      type: 'dropdown',
      title: <Translation>{t => t('playground.editor.plugin.heading')}</Translation>,
      items: [
        {
          value: 'paragraph',
          content: <Translation>{t => t('playground.editor.plugin.paragraph')}</Translation>,
        },
        {
          value: 'heading-one',
          content: <Translation>{t => t('playground.editor.plugin.heading-one')}</Translation>,
        },
        {
          value: 'heading-two',
          content: <Translation>{t => t('playground.editor.plugin.heading-two')}</Translation>,
        },
        {
          value: 'heading-three',
          content: <Translation>{t => t('playground.editor.plugin.heading-three')}</Translation>,
        },
        {
          value: 'heading-four',
          content: <Translation>{t => t('playground.editor.plugin.heading-four')}</Translation>,
        },
        {
          value: 'heading-five',
          content: <Translation>{t => t('playground.editor.plugin.heading-five')}</Translation>,
        },
        {
          value: 'heading-six',
          content: <Translation>{t => t('playground.editor.plugin.heading-six')}</Translation>,
        },
      ],
      value: HeadingEditor.queryActive(editor) ?? 'paragraph',
      onSelect: value => {
        HeadingEditor.toggle(editor, value as HeadingType)
      },
    },
  )
  items.push(
    'separator',
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.link')}</Translation>,
      active: LinkEditor.isActive(editor),
      onToggle: () => {
        LinkEditor.open(editor)
      },
      icon: <Icon name="link"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.image')}</Translation>,
      active: ImageEditor.isActive(editor),
      onToggle: () => {
        ImageEditor.open(editor)
      },
      icon: <Icon name="image"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.blockquote')}</Translation>,
      active: BlockquoteEditor.isActive(editor),
      onToggle: () => {
        BlockquoteEditor.toggle(editor)
      },
      icon: <Icon name="blockquote"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.unordered-list')}</Translation>,
      active: !!UnorderedListEditor.queryActive(editor),
      onToggle: () => {
        UnorderedListEditor.toggle(editor)
      },
      icon: <Icon name="unorderedList"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.ordered-list')}</Translation>,
      active: !!OrderedListEditor.queryActive(editor),
      onToggle: () => {
        OrderedListEditor.toggle(editor)
      },
      icon: <Icon name="orderedList"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.task-list')}</Translation>,
      active: !!TaskListEditor.queryActive(editor),
      onToggle: () => {
        TaskListEditor.toggle(editor)
      },
      icon: <Icon name="taskList"/>,
    },
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.table')}</Translation>,
      disabled: !!TableEditor.isActive(editor),
      onToggle: () => {
        TableEditor.insert(editor)
      },
      icon: <Icon name="table"/>,
    },
    'separator',
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.hr')}</Translation>,
      active: HrEditor.isActive(editor),
      onToggle: () => {
        HrEditor.insert(editor)
      },
      icon: <Icon name="hr"/>,
    },
    'separator',
    {
      type: 'button',
      title: 'Line break',
      active: false,
      onToggle: () => {
        editor.insertText("\n" + EMPTY_LINE_WORDS);
      },
      icon: <LinkEnterIcon/>,
    },
    'separator',
    {
      type: 'button',
      title: <Translation>{t => t('playground.editor.plugin.code-block')}</Translation>,
      active: CodeBlockEditor.isActive(editor),
      onToggle: () => {
        if (CodeBlockEditor.isActive(editor)) {
          return;
        }
        editor.cut();
        setTimeout(() => {
          readCopyText()
            .then(text => {
              CodeBlockEditor.insert(editor, {
                code: text,
                language: editorSettings.defaultLanguage,
              })
            })
        }, 100)
      },
      icon: <Icon name="codeBlock"/>,
    },
  )

  const isCodeBlock = CodeBlockEditor.isActive(editor);

  if (isCodeBlock) {
    const elements = Editor.elements(editor)
    const children = elements[CODEBLOCK_KEY]
    const element = children[0][0] as CodeBlock;

    items.push({
      type: 'dropdown',
      title: <Translation>{t => t('playground.editor.plugin.codeblock-language-type')}</Translation>,
      items: languages.map(v => ({
        value: v.value,
        content: v.content,
      })),
      value: element.language,
      onSelect: value => {
        editorSettings.defaultLanguage = value;
        CodeBlockEditor.updateCodeBlock(editor, element, {language: value})
      },
    },)
  }

  const grid = Grid.above(editor)
  if (grid) {
    items.push(
      'separator',
      {
        type: 'button',
        title: <Translation>{t => t('playground.editor.base.merge-cells')}</Translation>,
        disabled: !Grid.canMerge(editor, grid),
        onToggle: () => {
          Grid.mergeCell(editor, grid)
        },
        icon: <Icon name="tableMerge"/>,
      },
      {
        type: 'button',
        title: <Translation>{t => t('playground.editor.base.split-cells')}</Translation>,
        icon: <Icon name="tableSplit"/>,
        disabled: !Grid.canSplit(editor, grid),
        onToggle: () => {
          Grid.splitCell(editor, grid)
        },
      },
    )
  }
  return items
}
const CODEBLOCK_KEY = 'codeblock'

const LinkEnterIcon = React.memo<JSX.IntrinsicElements['svg']>(function IconRss(props) {
  return (
    <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
         width="14" height="14">
      <path
        d="M900.181333 385.792v-192a39.978667 39.978667 0 1 0-80 0v192a221.098667 221.098667 0 0 1-65.194666 157.44 221.184 221.184 0 0 1-157.397334 65.152H258.218667l112.384-112.298667a40.106667 40.106667 0 0 0-28.288-68.266666 39.808 39.808 0 0 0-28.330667 11.690666l-178.474667 178.474667a40.021333 40.021333 0 0 0 0 56.618667l183.68 183.808a39.978667 39.978667 0 1 0 56.618667-56.618667L262.4 688.384h335.189333a300.586667 300.586667 0 0 0 214.016-88.576 300.16 300.16 0 0 0 88.576-214.016z"
        fill="#000000"></path>
    </svg>
  )
})
