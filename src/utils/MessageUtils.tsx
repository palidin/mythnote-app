import {showModal} from "./utils";
import {InputModal} from "../components/modal/InputModal";
import {ConfirmModal} from "../components/modal/ConfirmModal";
import {toast} from 'react-toastify';
import React from "react";
import {FormDialog} from "$source/components/FormDialog";
import {MarkdownEditor} from "$source/MarkdownEditor";

export function showInputModal(title, value = ''): Promise<string> {
  return new Promise(resolve => {
    showModal(<FormDialog>
      <InputModal title={title} value={value}></InputModal>
    </FormDialog>)
      .then(r => {
        let text = r ?? '';
        text = text.trim();
        if (!text) {
          return;
        }
        resolve(text);
      })
  })
}

export function showConfirmModal(title) {
  return showModal(<FormDialog>
    <ConfirmModal title={title}></ConfirmModal>
  </FormDialog>)
}


export function showEditableMarkdownModal(title, markdown) {
  return showModal(<FormDialog title={"编辑: " + title} className={'markdown-dialog w-1/2'}>
    <MarkdownEditor text={markdown}/>
  </FormDialog>)
}


export function showSuccessMessage(msg) {
  toast(msg, {
    position: "top-right",
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    theme: "colored",
    type: 'success',
  });
}

export function showErrorMessage(msg) {
  toast(msg, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    theme: "colored",
    type: 'error',
  });
}
