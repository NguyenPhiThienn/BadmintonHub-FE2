import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  mdiAlert,
  mdiCheck,
  mdiClose,
  mdiLoading
} from "@mdi/js";
import Icon from "@mdi/react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  variant?: "default" | "destructive" | "warning";
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isPending = false,
  variant = "default",
}: ConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[450px]">
        <DialogHeader>
          <DialogTitle className={cn(
            "flex items-center gap-2",
            variant === "destructive"
              ? "text-red-400"
              : variant === "warning"
                ? "text-yellow-500"
                : "text-accent",
          )}>
            <Icon
              path={mdiAlert}
              size={0.8}
            />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 md:p-4">
          <p className="text-sm text-neutral-300">{description}</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1"
          >
            <Icon path={mdiClose} size={0.8} />
            {cancelText}
          </Button>
          <Button className="flex-1" onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <Icon path={mdiLoading} size={0.8} spin />
            ) : (
              <Icon path={mdiCheck} size={0.8} />
            )}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
