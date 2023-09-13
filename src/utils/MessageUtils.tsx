import {openNewModal} from "./utils";
import MyControl from "../components/MyControl";
import {InputModal} from "../components/modal/InputModal";
import {ConfirmModal} from "../components/modal/ConfirmModal";
import {toast} from 'react-toastify';

export function showInputModal(title, value = ''): Promise<string> {
  let params: Record<string, any> = {};

  return new Promise((resolve, reject) => {
    function onUpdateValue(ret) {
      if (ret && params.value) {
        resolve(params.value)
      }
    }

    openNewModal(<MyControl onUpdateValue={onUpdateValue}>
      <InputModal closeModal={undefined} {...{title, value}} updateValue={v => params.value = v}></InputModal>
    </MyControl>)
  })
}

export function showConfirmModal(title) {

  return new Promise((resolve, reject) => {
    function onUpdateValue(ret) {
      if (ret) {
        resolve(ret)
      }
    }

    openNewModal(<MyControl onUpdateValue={onUpdateValue}>
      <ConfirmModal title={title}></ConfirmModal>
    </MyControl>)
  })
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
