import { describe, it, expect } from 'vitest';
import { renderLoggedInApp } from '../test-utils';

describe('Tier 1 - Feature 03: 3-Column Tablet Landscape Layout', () => {
  it('renders top header anchored at full width', async () => {
    const { container } = await renderLoggedInApp();
    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    expect(header?.className).toContain('shrink-0');
  });

  it('contains horizontal flex workspace container for tablet landscape presentation', async () => {
    const { container } = await renderLoggedInApp();
    const workspace = container.querySelector('.flex-1.flex.overflow-hidden');
    expect(workspace).not.toBeNull();
  });

  it('allocates flex-1 grow space to queue board area', async () => {
    const { container } = await renderLoggedInApp();
    const queueArea = container.querySelector('.flex-1.flex.flex-col');
    expect(queueArea).not.toBeNull();
  });

  it('renders side contextual/demo panel with fixed column width', async () => {
    const { container } = await renderLoggedInApp();
    const aside = container.querySelector('aside');
    expect(aside).not.toBeNull();
    expect(aside?.className).toMatch(/w-80|w-\[.*\]|w-96/);
  });

  it('contains dedicated border separation between central board and sidebar', async () => {
    const { container } = await renderLoggedInApp();
    const aside = container.querySelector('aside');
    expect(aside?.className).toContain('border-l');
  });
});
