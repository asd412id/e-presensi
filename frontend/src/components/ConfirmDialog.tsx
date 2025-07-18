import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  type?: "warning" | "danger" | "info";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = "Konfirmasi",
  message,
  onConfirm,
  onCancel,
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
  loading = false,
  type = "danger",
}) => {
  const getBgClassByType = () => {
    switch (type) {
      case "danger":
        return "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30";
      case "warning":
        return "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30";
      case "info":
        return "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30";
      default:
        return "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30";
    }
  };

  const getIconByType = () => {
    switch (type) {
      case "warning":
        return (
          <IconAlertTriangle
            className="text-orange-500 dark:text-orange-400"
            size={48}
          />
        );
      case "danger":
        return (
          <IconAlertTriangle
            className="text-red-500 dark:text-red-400"
            size={48}
          />
        );
      case "info":
        return (
          <IconAlertTriangle
            className="text-blue-500 dark:text-blue-400"
            size={48}
          />
        );
      default:
        return (
          <IconAlertTriangle
            className="text-red-500 dark:text-red-400"
            size={48}
          />
        );
    }
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        backdrop: "bg-zinc-900/50 dark:bg-black/70",
        base: "border-none shadow-2xl",
        wrapper: "items-center justify-center",
      }}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      placement="center"
      size="sm"
      onClose={onCancel}
    >
      <ModalContent className="backdrop-blur-xl bg-white/95 dark:bg-zinc-900/95 border-2 border-violet-200/50 dark:border-violet-800/50 shadow-2xl">
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-4 p-6 pb-2">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`p-4 rounded-2xl mb-4 shadow-lg ${getBgClassByType()}`}
                >
                  {getIconByType()}
                </div>
                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                  {title}
                </h2>
              </div>
            </ModalHeader>
            <ModalBody className="px-6 py-2">
              <div className="text-center">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {message}
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="flex gap-3 p-6 pt-4">
              <Button
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-600"
                radius="lg"
                variant="flat"
                onPress={onCancel}
              >
                <IconX size={18} />
                {cancelText}
              </Button>
              <Button
                className={`flex-1 ${type === "danger"
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    : type === "warning"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  } text-white font-semibold shadow-lg`}
                isLoading={loading}
                radius="lg"
                startContent={!loading && <IconCheck size={18} />}
                variant="solid"
                onPress={onConfirm}
              >
                {loading ? "Memproses..." : confirmText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDialog;
