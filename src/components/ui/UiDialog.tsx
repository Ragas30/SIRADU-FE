// components/ui/UiDialog.tsx
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogBackdrop,
  DialogPositioner,
} from "@chakra-ui/react";
import { ReactNode } from "react";

type UiDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  body: ReactNode;
  footer?: ReactNode;
};

export function UiDialog({
  open,
  onOpenChange,
  trigger,
  title,
  body,
  footer,
}: UiDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogPositioner>
        <DialogBackdrop bg="blackAlpha.600" />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>{body}</DialogBody>
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
