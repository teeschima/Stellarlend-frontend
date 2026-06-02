import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Status = 'pending' | 'success' | 'failure';

export default function TransactionProgressModal({
  open,
  onClose,
  status,
  txHash,
  error,
  onRetry,
}: {
  open: boolean;
  onClose: () => void;
  status: Status;
  txHash?: string;
  error?: { retryable?: boolean; message?: string };
  onRetry?: () => void | Promise<void>;
}) {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);
  const prevFocused = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      prevFocused.current = document.activeElement as HTMLElement | null;
      // Move focus to dialog close for keyboard users
      setTimeout(() => closeRef.current?.focus(), 0);
    } else {
      // restore focus when closed
      prevFocused.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    // announce status via live region
    if (liveRef.current) {
      if (status === 'pending') liveRef.current.textContent = 'Transaction pending';
      if (status === 'success') liveRef.current.textContent = 'Transaction succeeded';
      if (status === 'failure') liveRef.current.textContent = 'Transaction failed';
    }
  }, [status]);

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopyFeedback('Copied');
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (e) {
      setCopyFeedback('Copy failed');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-lg bg-slate-900 text-white shadow-lg">
        <div className="flex items-start justify-between p-4 border-b border-slate-700">
          <div>
            <h2 id="tx-modal-title" className="text-lg font-semibold">Transaction</h2>
            <p className="text-sm text-slate-400">Submission status</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Close dialog"
              ref={closeRef}
              className="text-slate-300 hover:text-white focus:outline-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {status === 'pending' && (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="text-sm text-slate-400">Submitting to Stellar network…</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm">Transaction submitted successfully.</p>
              {txHash && <p className="text-xs font-mono text-slate-300 break-all">{txHash}</p>}
            </div>
          )}

          {status === 'failure' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200">
                <p className="text-sm">{error?.message ?? 'Submission failed.'}</p>
              </div>

              {txHash && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block">Transaction hash</label>
                    <div className="mt-1 p-2 bg-slate-800 rounded font-mono text-sm break-all">{txHash}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => copyToClipboard(txHash)}
                      className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm"
                      aria-label="Copy transaction hash"
                    >
                      Copy
                    </button>
                    <span aria-live="polite" className="text-xs text-slate-300">{copyFeedback}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <a href="/network-error" className="text-sm text-slate-300 hover:underline mr-auto">Network diagnostics</a>
                {error?.retryable ? (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 rounded text-white text-sm"
                    aria-label="Retry transaction"
                  >
                    Retry
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-700 rounded text-white text-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sr-only">
          <div ref={liveRef} aria-live="polite" />
        </div>
      </div>
    </div>
  );
}
