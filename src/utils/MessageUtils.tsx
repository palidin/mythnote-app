import {openNewModal} from "./utils";
import MyControl from "../components/MyControl";
import {InputModal} from "../components/modal/InputModal";
import {ConfirmModal} from "../components/modal/ConfirmModal";

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
