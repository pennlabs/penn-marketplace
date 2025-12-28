import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function FormDialog({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = "md",
  children,
}: FormDialogProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }[maxWidth];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={maxWidthClass}>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

