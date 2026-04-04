import { useState } from "react";

export function useDialogs<DialogsOption>(
  initialActiveDialogValue: DialogsOption | null = null
) {
  const [activeDialog, setActiveDialog] = useState<DialogsOption | null>(
    initialActiveDialogValue
  );
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
