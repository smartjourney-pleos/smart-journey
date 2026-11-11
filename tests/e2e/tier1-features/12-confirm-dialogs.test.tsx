import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { SettingsModal } from '../../../src/components/SettingsModal';
import { createMockStore } from '../test-utils';

describe('Tier 1 - Feature 12: Tablet Safe Confirmation Dialogs', () => {
  it('does not render modal content into DOM when isOpen is false', () => {
    const store = createMockStore();
    render(
      <SettingsModal
        isOpen={false}
        settings={store.settings}
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    expect(screen.queryByText('매장 대기 시간 설정')).toBeNull();
  });

  it('renders modal with backdrop overlay when isOpen is true', () => {
    const store = createMockStore();
    const { container } = render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    expect(screen.getByText('매장 대기 시간 설정')).toBeDefined();
    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.className).toContain('bg-ink/50');
    expect(backdrop?.className).not.toContain('backdrop-blur');
  });

  it('invokes onClose when cancel button is clicked without saving', () => {
    const store = createMockStore();
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={onClose}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /취소/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('invokes onClose when X button is clicked', () => {
    const store = createMockStore();
    const onClose = vi.fn();
    const { container } = render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={onClose}
        onSave={() => {}}
      />
    );
    const closeBtn = container.querySelector('button.text-ink-2');
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('submits updated settings payload and closes dialog on save', () => {
    const store = createMockStore();
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={onClose}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));
    expect(onSave).toHaveBeenCalledWith({
      minutesPerTeam: 5,
      arrivalBufferMin: 10,
      manualWaitMin: null,
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
