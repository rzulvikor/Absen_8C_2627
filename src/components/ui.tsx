import { useEffect, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useStore } from "../store";

/* ---------- Kepala halaman ---------- */

export function PageHead({
  kicker,
  title,
  desc,
  accent = "text-cyan-300",
  children,
}: {
  kicker: string;
  title: string;
  desc?: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between mb-7">
      <div className="max-w-2xl">
        <p className={`font-mono text-[11px] tracking-[0.22em] uppercase ${accent} mb-2`}>
          <span className="inline-block w-6 h-px bg-current align-middle mr-2 opacity-70" />
          {kicker}
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight m-0">
          {title}
        </h2>
        {desc && <p className="mt-3 text-slate-400 text-sm leading-relaxed">{desc}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3 items-center">{children}</div>}
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        aria-label="Tutup"
        className="absolute inset-0 bg-[#030a14]/78 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`anim-pop relative glass rounded-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[88vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-100/10">
          <h3 className="font-display font-bold text-lg m-0">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:text-pink-300 hover:bg-pink-300/10 transition"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto table-wrap">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Dialog konfirmasi ---------- */

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Ya, lanjutkan",
  danger,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex gap-4">
        <div
          className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${
            danger ? "bg-pink-300/12 text-pink-300" : "bg-cyan-300/12 text-cyan-300"
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-sm text-slate-300 leading-relaxed">{body}</div>
      </div>
      <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-cyan-100/15 hover:bg-cyan-100/5 transition"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 ${
            danger
              ? "bg-pink-400 text-[#2a0517] hover:brightness-110"
              : "bg-cyan-300 text-[#071426] hover:brightness-110"
          }`}
        >
          {busy ? "Memproses…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Host toast ---------- */

export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`anim-toast glass rounded-xl pl-3 pr-2 py-3 flex items-start gap-3 text-sm shadow-2xl border ${
            t.type === "success"
              ? "border-lime-300/40"
              : t.type === "error"
                ? "border-pink-400/45"
                : "border-cyan-300/35"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-lime-300 shrink-0 mt-px" />
          ) : t.type === "error" ? (
            <XCircle className="w-5 h-5 text-pink-300 shrink-0 mt-px" />
          ) : (
            <Info className="w-5 h-5 text-cyan-300 shrink-0 mt-px" />
          )}
          <p className="m-0 leading-snug text-slate-100">{t.msg}</p>
          <button
            onClick={() => dismissToast(t.id)}
            className="ml-auto text-slate-500 hover:text-white transition shrink-0"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
