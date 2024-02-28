import {createContextStore} from "$source/utils/StoreUtils";

export interface DialogState {
  onUpdate: (data:any) => void,
  onSubmit: () => void,
}


const {Provider, useStore} = createContextStore<DialogState>((set) => ({
  onSubmit: null,
  onUpdate: null,
}));

export {
  Provider as DialogStateProvider,
  useStore as useDialogStateStore,
}
