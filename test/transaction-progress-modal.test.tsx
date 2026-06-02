import React from 'react';
import { render, screen, fireEvent, waitFor } from './test-utils';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import TransactionProgressModal from '../src/app/TransactionProgressModal';

describe('TransactionProgressModal - failure state', () => {
  beforeEach(() => {
    // ensure a clean clipboard mock state
    // @ts-ignore
    global.navigator.clipboard = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies hash with navigator.clipboard when available', async () => {
    const writeText = vi.fn();
    // @ts-ignore
    global.navigator.clipboard = { writeText };

    render(
      <TransactionProgressModal
        open
        onClose={() => {}}
        status="failure"
        txHash="ABC123"
        error={{ retryable: true }}
        onRetry={() => {}}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copy transaction hash/i });
    fireEvent.click(copyBtn);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('ABC123'));
    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });

  it('falls back to execCommand when clipboard not available', async () => {
    const exec = vi.spyOn(document, 'execCommand').mockImplementation(() => true);

    render(
      <TransactionProgressModal
        open
        onClose={() => {}}
        status="failure"
        txHash="DEF456"
        error={{ retryable: false }}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copy transaction hash/i });
    fireEvent.click(copyBtn);

    await waitFor(() => expect(exec).toHaveBeenCalledWith('copy'));
    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });

  it('calls onRetry for retryable failures', async () => {
    const onRetry = vi.fn();
    render(
      <TransactionProgressModal
        open
        onClose={() => {}}
        status="failure"
        txHash="XYZ789"
        error={{ retryable: true }}
        onRetry={onRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: /retry transaction/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });

  it('restores focus to previous element on close', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <div>
        <button data-testid="outside">Outside</button>
        <TransactionProgressModal
          open={false}
          onClose={onClose}
          status="failure"
          txHash="FOC123"
          error={{ retryable: false }}
        />
      </div>
    );

    const outside = screen.getByTestId('outside');
    outside.focus();
    expect(document.activeElement).toBe(outside);

    // open modal
    rerender(
      <div>
        <button data-testid="outside">Outside</button>
        <TransactionProgressModal
          open
          onClose={onClose}
          status="failure"
          txHash="FOC123"
          error={{ retryable: false }}
        />
      </div>
    );

    // close modal
    rerender(
      <div>
        <button data-testid="outside">Outside</button>
        <TransactionProgressModal
          open={false}
          onClose={onClose}
          status="failure"
          txHash="FOC123"
          error={{ retryable: false }}
        />
      </div>
    );

    await waitFor(() => expect(document.activeElement).toBe(outside));
  });
});
