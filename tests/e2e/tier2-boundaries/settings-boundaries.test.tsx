import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { SettingsModal } from '../../../src/components/SettingsModal';
import { createMockStore } from '../test-utils';

describe('Tier 2 - Settings Boundaries & Wait Time Overrides', () => {
  it('handles minimum minutes per team boundary (1 minute)', () => {
    const store = createMockStore({
      settings: { minutesPerTeam: 1, arrivalBufferMin: 10, manualWaitMin: null },
    });
    const onSave = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ minutesPerTeam: 1 })
    );
  });

  it('handles maximum minutes per team boundary (60 minutes)', () => {
    const store = createMockStore({
      settings: { minutesPerTeam: 60, arrivalBufferMin: 10, manualWaitMin: null },
    });
    const onSave = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ minutesPerTeam: 60 })
    );
  });

  it('handles minimum arrival buffer boundary (0 minutes)', () => {
    const store = createMockStore({
      settings: { minutesPerTeam: 5, arrivalBufferMin: 0, manualWaitMin: null },
    });
    const onSave = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ arrivalBufferMin: 0 })
    );
  });

  it('allows enabling manual wait time override with custom minutes', () => {
    const store = createMockStore({
      settings: { minutesPerTeam: 5, arrivalBufferMin: 10, manualWaitMin: null },
    });
    const onSave = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    // Toggle checkbox for manual wait override
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Save
    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ manualWaitMin: 20 })
    );
  });

  it('allows disabling manual wait time override to revert back to dynamic calculation', () => {
    const store = createMockStore({
      settings: { minutesPerTeam: 5, arrivalBufferMin: 10, manualWaitMin: 45 },
    });
    const onSave = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        settings={store.settings}
        onClose={() => {}}
        onSave={onSave}
      />
    );
    // Initially checked, click to uncheck
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole('button', { name: /설정 저장/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ manualWaitMin: null })
    );
  });
});
