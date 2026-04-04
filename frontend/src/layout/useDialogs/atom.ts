import { useAtom, type PrimitiveAtom } from "jotai";

export function useDialogsAtom<DialogsOption>(
  dialogAtom: PrimitiveAtom<DialogsOption | null>,
) {
  const [activeDialog, setActiveDialog] = useAtom(dialogAtom);

  return {
    currentActiveDialog: activeDialog,
    activateDialog: (dialogName: DialogsOption) => setActiveDialog(dialogName),
    disableDialog: () => {
      if (activeDialog !== null) {
        setActiveDialog(null);
      }
    },
  };
}
