import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  mdiAlert,
  mdiClose,
  mdiLoading,
  mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { toast } from "react-toastify";

interface DeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any>;
  title: string;
  description: string;
  confirmText: string;
  errorMessage: string;
  warningMessage?: string;
}

export const DeleteDialog = ({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  errorMessage,
}: DeleteDialogProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
            <span className="truncate pr-8">{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 md:p-4">
          {description && (
            <div className="bg-darkBorderV1 border-darkBorderV1 border rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-2">
                <Icon path={mdiAlert} size={0.8} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-400">
                  <p className="font-semibold mb-1">Warning:</p>
                  <p>{description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 bg-transparent border-neutral-400/50 text-neutral-300 hover:bg-darkBorderV1"
          >
            <Icon path={mdiClose} size={0.8} />
            <span className="text-neutral-300">Hủy</span>
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Icon path={mdiLoading} size={0.8} spin />
                Đang xóa...
              </>
            ) : (
              <>
                <Icon path={mdiTrashCanOutline} size={0.8} />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
