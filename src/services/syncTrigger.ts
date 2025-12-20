
let triggerSync: (() => void) | null = null;

export const registerSyncTrigger = (fn: () => void) => {
  triggerSync = fn;
};

export const requestSync = () => {
  triggerSync?.();
}