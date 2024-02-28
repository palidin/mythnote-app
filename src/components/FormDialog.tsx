import * as React from 'react';
import {useState} from 'react';
import 'rc-dialog/assets/index.css';
import Dialog from "rc-dialog/es/Dialog";
import {DialogStateProvider} from "$source/store/dialog";
import {useMemoizedFn} from "ahooks";


interface MyControlProps {
  children: any
  onUpdateValue?: any
  title?: string
  onSubmit?: (any) => void
}

export function FormDialog({children, onSubmit = null, title = '信息'}: MyControlProps) {
  const [visible, setVisible] = React.useState(true);


  const onConfirm = useMemoizedFn(() => {
    setVisible(false)
    onSubmit(data)
  })

  function onCancel() {
    setVisible(false)
  }

  const [data, setData] = useState(null)

  const dialog = (
    <Dialog
      title={title}
      footer={[
        <button type="button" className="btn btn-default" key="close" onClick={onCancel}>
          取消
        </button>,
        <button type="button" className="btn btn-primary" key="save" onClick={onConfirm}>
          确认
        </button>,
      ]}
      destroyOnClose={true}
      onClose={onCancel}
      visible={visible}
    >
      <DialogStateProvider init={state => state.setState({onSubmit: onConfirm, onUpdate: setData})}>
        {children}
      </DialogStateProvider>

    </Dialog>
  );

  return (
    <div style={{margin: 20}}>
      {dialog}
    </div>
  );
};


