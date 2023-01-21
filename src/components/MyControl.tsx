import * as React from 'react';
import 'rc-dialog/assets/index.css';
import Dialog from "rc-dialog/es/Dialog";
import {destroyModal} from "../utils/utils";

const MyControl = ({children, onUpdateValue}) => {
    const [visible, setVisible] = React.useState(true);
    const [destroyOnClose, setDestroyOnClose] = React.useState(false);

    const onClick = () => {
        onUpdateValue(true);
        setVisible(true);
        destroyModal();
    };

    const onClose = () => {
        onUpdateValue(false);
        setVisible(false);
        destroyModal();
    };


    const dialog = (
        <Dialog
            title={"信息"}
            footer={[
                <button type="button" className="btn btn-default" key="close" onClick={onClose}>
                    Cancle
                </button>,
                <button type="button" className="btn btn-primary" key="save" onClick={onClick}>
                    Okay
                </button>,
            ]}
            destroyOnClose={destroyOnClose}
            onClose={onClose}
            visible={visible}
        >
            {/*<InnerRender></InnerRender>*/}
            {/*{children}*/}
            {React.cloneElement(children, {closeModal: onClick})}
        </Dialog>
    );

    return (
        <div style={{margin: 20}}>
            {dialog}
        </div>
    );
};

export default MyControl;