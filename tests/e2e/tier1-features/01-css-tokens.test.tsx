import { describe, it, expect } from 'vitest';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 1 - Feature 01: Tablet CSS Foundation & Tokens', () => {
  it('renders root container configured for full tablet viewport height', async () => {
    const { container } = await renderLoggedInApp();
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    // Verify container sets full height and screen bounds
    expect(root.className).toMatch(/h-screen|100dvh|min-h-screen/);
  });

  it('applies dark theme background palette to tablet workspace', async () => {
    const { container } = await renderLoggedInApp();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/bg-slate-950|bg-slate-900/);
  });

  it('constrains horizontal and vertical overflow to prevent tablet page bouncing', async () => {
    const { container } = await renderLoggedInApp();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('overflow-hidden');
  });

  it('uses monospaced or tabular font numerals for jitter-free counters', async () => {
    await renderLoggedInApp();
    // Clock and ticket numbers should apply monospace or tabular numerals
    const monoElements = document.querySelectorAll('.font-mono, [style*="tabular-nums"]');
    expect(monoElements.length).toBeGreaterThan(0);
  });

  it('enforces sans-serif font family token on main tablet shell', async () => {
    const { container } = await renderLoggedInApp();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('font-sans');
  });
});
