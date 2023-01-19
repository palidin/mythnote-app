import ClassicEditor from '@palidin/ckeditor5-markdown-build'
import {useEffect, useState} from "react";
import {markdownConfig} from "../ckeditor/markdownPlugin";
import LocalFileUploadAdapter from "../ckeditor/localFileUploadAdapter";
import {replaceRemoteHostImage} from "../utils/utils2";
import {sharedVariables} from "../state";
import {useMount} from "../utils/HookUtils";


export function RichTextEditor({content, updateBody}) {

    const [editor, setEditor] = useState(null);
    const [sourceEditing, setSourceEditing] = useState();


    useMount(() => {
        ClassicEditor
            .create(document.getElementById('ckeditor-box'), {
                htmlEscaper: markdownConfig,
                simpleUpload: {
                    adapter: LocalFileUploadAdapter,
                    settings: {
                        uploadUrl: 'http://demo.com/upload',
                    },
                },
            })
            .then(ins => {
                sharedVariables.editor = ins;
                setEditor(ins)
                initEditor(ins);

            })
            .catch(e => {
                console.log(e)
            })
    })

    useEffect(() => {
        if (!editor) return
        editor.setData(content)
    }, [content])


    function onDataChange(data: string) {
        updateBody.current(data)
    }

    function initEditor(editor) {

        editor.editing.view.change(writer => {
            writer.setAttribute('spellcheck', 'false', editor.editing.view.document.getRoot());
        });

        editor.model.document.on('change:data', () => {
            onDataChange(editor.getData())
        });

        editor.editing.view.document.on('clipboardInput', (evt, data) => {
            const dataTransfer = data.dataTransfer;
            let content = dataTransfer.getData('text/html');
            if (content) {
                replaceRemoteHostImage(content)
            }
        }, {level: 'high'});


        const sourceEditingPlugin = editor.plugins.get('SourceEditing');
        sourceEditingPlugin.on('change:isSourceEditingMode', (evt, name, isSourceEditingMode) => {
            console.log(isSourceEditingMode)
            setSourceEditing(isSourceEditingMode)
        });

        const wordCountPlugin = editor.plugins.get('WordCount');
        document.getElementById('ckeditor-word-counter').appendChild(wordCountPlugin.wordCountContainer);
    }


    return (
        <>
            <div id={'ckeditor-box'}></div>
            <div id={'ckeditor-word-counter'} className={sourceEditing ? 'hide' : ''}></div>
        </>
    )
}