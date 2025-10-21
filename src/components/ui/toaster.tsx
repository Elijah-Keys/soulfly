import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, onClick, ...props }) {
        const activate = (e: React.MouseEvent | React.TouchEvent) => {
          // Don't navigate when tapping the close button
          const el = e.target as HTMLElement;
          if (el.closest("[data-no-nav]")) return;
          onClick?.();
        };

        return (
          <Toast
            key={id}
            {...props}
            // make the whole toast tappable without changing visuals
            role="button"
            tabIndex={0}
            onClick={activate}
            onTouchEnd={activate}
            className="pointer-events-auto"
            style={{ cursor: onClick ? "pointer" : undefined, touchAction: "manipulation" }}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>

            {action}

            {/* prevent the close button from triggering navigation */}
            <ToastClose data-no-nav onClick={(e) => e.stopPropagation()} />
          </Toast>
        );
      })}

      {/* Sit above fixed headers/footers without changing look */}
      <ToastViewport className="z-[99999]" />
    </ToastProvider>
  );
}
