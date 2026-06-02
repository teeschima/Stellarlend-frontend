**Transaction Failure Pattern**

- **Purpose:** Describe the UI pattern for transaction submission failures and recovery affordances.
- **Location:** `src/app/TransactionProgressModal.tsx`

Summary

- Show clear failure state when Stellar submission fails.
- Provide a retry CTA for transient, retryable failures (RPC/timeouts).
- Provide an accessible copy-to-clipboard control for the transaction hash so users can paste diagnostics in support tickets or browser devtools.
- Include a link to the network diagnostics page (`/network-error`) for deeper troubleshooting.

Accessibility & behavior

- Announce status transitions via an `aria-live` region (pending → success → failure).
- Copy control uses the asynchronous `navigator.clipboard.writeText` when available and falls back to a hidden `textarea` + `document.execCommand('copy')` path.
- Provide visible success feedback (short-living) and expose the same message via `aria-live` for screen readers.
- When the modal opens, store the previously focused element and return focus to it when the modal closes.

When to show Retry

- Show the `Retry` CTA only when the failure is considered transient (e.g., RPC timeout). Terminal failures (invalid signatures, bad ops) should not show retry.

Testing notes

- Unit tests should mock `navigator.clipboard.writeText` and also test the fallback path (mock `document.execCommand`).
- Test that `onRetry` is invoked for retryable failures.
- Test focus return: set focus to an off-modal control, open modal, then close and assert focus returns.
