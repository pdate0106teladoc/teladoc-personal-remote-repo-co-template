import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the store and utilities
const mockStartSync = vi.fn();
vi.mock('@/store/useSyncStore', () => ({
  __esModule: true,
  default: () => ({ startSync: mockStartSync }),
}));

vi.mock('@/store/killSwitchStore', () => ({
  useKillSwitchStore: () => ({ killSwitchStatus: false }),
}));

vi.mock('@ucc/common-ui', () => ({
  SyncModal: ({ show, onSync, onClose, lastUpdatedAt }: any) =>
    show ? (
      <div>
        <span>Data may be out of sync</span>
        <span>You may be seeing outdated information.</span>
        <span>{lastUpdatedAt}</span>
        <button onClick={onSync}>Sync Now</button>
        <button onClick={onClose}>Later</button>
        <button aria-label="Close" onClick={onClose}>X</button>
      </div>
    ) : null,
}));

import SyncModal from './SyncModal';

describe('SyncModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when id is missing', () => {
    const { container } = render(
      <SyncModal type="organization" lastUpdatedAt="2025-01-01T22:00:00Z" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when lastUpdatedAt is missing', () => {
    const { container } = render(
      <SyncModal id="org1" type="organization" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal when id and lastUpdatedAt are provided', () => {
    render(
      <SyncModal id="group1" type="group" lastUpdatedAt="2025-01-01T22:00:00Z" />
    );
    expect(screen.getByText('Data may be out of sync')).toBeInTheDocument();
    expect(screen.getByText('You may be seeing outdated information.')).toBeInTheDocument();
  });

  it('passes lastUpdatedAt to the underlying modal', () => {
    render(
      <SyncModal id="org1" type="organization" lastUpdatedAt="2025-01-01T22:00:00Z" />
    );
    expect(screen.getByText('2025-01-01T22:00:00Z')).toBeInTheDocument();
  });

  it('calls startSync with correct args and closes on Sync Now', () => {
    render(
      <SyncModal id="grp-123" type="group" lastUpdatedAt="2025-01-01T22:00:00Z" />
    );
    const syncButton = screen.getByRole('button', { name: 'Sync Now' });
    fireEvent.click(syncButton);
    expect(mockStartSync).toHaveBeenCalledWith('group', 'grp-123');
    expect(screen.queryByText('Data may be out of sync')).not.toBeInTheDocument();
  });

  it('closes modal on Later click', () => {
    render(
      <SyncModal id="org2" type="organization" lastUpdatedAt="2025-01-01T22:00:00Z" />
    );
    const laterButton = screen.getByRole('button', { name: 'Later' });
    fireEvent.click(laterButton);
    expect(screen.queryByText('Data may be out of sync')).not.toBeInTheDocument();
  });

  it('closes modal when clicking close icon', () => {
    render(
      <SyncModal id="org3" type="organization" lastUpdatedAt="2025-01-01T22:00:00Z" />
    );
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(screen.queryByText('Data may be out of sync')).not.toBeInTheDocument();
  });
});
