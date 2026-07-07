import { toast as sonnerToast } from "sonner";

/**
 * Adapter de notificações.
 *
 * Isola a biblioteca de toast (sonner) do restante da aplicação:
 * features e páginas dependem apenas desta interface, permitindo
 * trocar a implementação sem tocar na lógica de negócio.
 */
export interface ToastAdapter {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

export const toast: ToastAdapter = {
  success: (message, description) =>
    sonnerToast.success(message, { description }),
  error: (message, description) => sonnerToast.error(message, { description }),
  info: (message, description) => sonnerToast.info(message, { description }),
};
