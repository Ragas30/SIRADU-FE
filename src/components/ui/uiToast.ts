// components/ui/uiToast.ts

import { toaster } from "./toaster";

export const uiToast = {
  success: (title: string) => toaster.create({ title, type: "success" }),
  info: (title: string) => toaster.create({ title, type: "info" }),
  error: (title: string) => toaster.create({ title, type: "error" }),
};
