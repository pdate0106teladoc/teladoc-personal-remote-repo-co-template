import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OrgConfigLayout from './OrgConfigLayout';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">[Outlet]</div>,
    useParams: () => ({ id: 'ORG123' }),
  };
});

vi.mock('@/components/ConfigHeader/ConfigHeader', () => ({
  default: ({ name, id, label, iconType, actions }: any) => (
    <div data-testid="config-header">
      {name}|{id}|{label}|{iconType}
      {actions && <div data-testid="config-header-actions">{actions}</div>}
    </div>
  ),
}));

vi.mock('@/components/SidebarNavigation/SidebarNav', () => ({
  default: ({ navItems, basePath }: any) => (
    <div data-testid="sidebar-nav">
      {navItems.map((i: any) => i.name).join(',')}|{basePath}
    </div>
  ),
}));

vi.mock('@/components/SyncModal/SyncModal', () => ({
  default: () => <div data-testid="sync-modal">[SyncModal]</div>,
}));

vi.mock('@/components/SyncRibbon/SyncRibbon', () => ({
  default: () => <div data-testid="sync-ribbon">[SyncRibbon]</div>,
}));

vi.mock('@ucc/common-ui', () => ({
  FailSafePage: ({ cardType }: any) => <div data-testid="failsafe-page">{cardType}</div>,
  ValidateRibbon: () => <div data-testid="validate-ribbon">[ValidateRibbon]</div>,
  Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
  showCustomToast: vi.fn(),
  ActionButton: ({ title }: any) => <div data-testid="action-button">{title}</div>,
  SideModal: ({ show, children, title }: any) =>
    show ? <div data-testid="side-modal">{title}{children}</div> : null,
  ValidationSummarySlider: () => <div data-testid="validation-summary-slider" />,
  PlannedLaunchDateRibbon: () => <div data-testid="planned-launch-ribbon" />,
  extractDisplayValue: (value: any) => ({ jsx: <span>{String(value ?? '')}</span>, raw: String(value ?? '') }),
  getUserPermissions: () => [],
  hasPermission: () => true,
  hasAllPermission: () => true,
  CheckMarkCircle: () => <span data-testid="check-mark-circle" />,
}));

vi.mock('@/components/sidebar/TaskCreate', () => ({
  default: () => <div data-testid="edit-config">[EditConfig]</div>,
}));

vi.mock('@/components/sidebar/SubmitUpdateParentForm', () => ({
  default: () => <div data-testid="submit-update-form">[SubmitUpdateForm]</div>,
}));

vi.mock('@/components/Modal/BasicModal', () => ({
  default: () => <div data-testid="basic-modal">[BasicModal]</div>,
}));

vi.mock('@/components/PendingRibbon/PendingRibbon', () => ({
  default: () => <div data-testid="pending-ribbon">[PendingRibbon]</div>,
}));

vi.mock('@/components/Modal/UpdatePlannedLaunchDateModal', () => ({
  default: () => <div data-testid="update-planned-launch-modal">[UpdatePlannedLaunchDateModal]</div>,
}));

vi.mock('@/store/useAuthStore', () => ({
  default: () => ({
    hasAllPermissions: () => true,
    hasPermission: () => true,
  }),
}));

import useConfigStore from '@/store/configStore';
vi.mock('@/store/configStore');

const DEFAULT_CONFIG_STORE = {
  org: {
    orgName: 'Test Org',
    orgId: 'ORG123',
    updatedAt: '2025-09-22T10:00:00Z',
  },
};

function setupConfigStoreMock(store = DEFAULT_CONFIG_STORE) {
  (useConfigStore as any).mockImplementation((selector: any) =>
    selector(store)
  );
}

import useOrgStore from '@/store/useOrgStore';
vi.mock('@/store/useOrgStore');

const mockSetters = {
  setGeneralSettings: vi.fn(),
  setBillingData: vi.fn(),
  setMarketingData: vi.fn(),
  setReportingData: vi.fn(),
  getGeneralSettings: vi.fn(() => null),
  getBillingData: vi.fn(() => null),
  getMarketingData: vi.fn(() => null),
  getReportingData: vi.fn(() => null),
};

(useOrgStore as any).mockReturnValue(mockSetters);

import api from '@/api/apiService';
vi.mock('@/api/apiService');
(api.get as any) = vi.fn().mockResolvedValue({
  data: {
    organizationGeneralSettings: {},
    organizationBilling: {},
    organizationMarketing: {},
    organizationReporting: {},
  },
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => (store[key] = value),
    clear: () => (store = {}),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


describe('<OrgConfigLayout />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupConfigStoreMock();
  });

  it('renders ConfigHeader with correct props', async () => {
    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toHaveTextContent(
        'Test Org|ORG123|Org hierarchy ID|Org'
      );
    });
  });

  it('renders all sidebar navigation items in order', async () => {
    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('sidebar-nav')).toHaveTextContent(
        'General settings,Billing,Marketing,Reporting,Eligibility,Opportunities,Hierarchy,Contacts,Comments,History,Opportunities,Change requests,Files,History|/CCC/org-detail'
      );
    });
  });

  it('renders the <Outlet /> placeholder', async () => {
    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    });
  });

  it('conditionally renders SyncModal if lastSynced is old', async () => {
    const staleTime = new Date(Date.now() - 11 * 60 * 1000).toISOString();
    localStorage.setItem(
      'syncJob_ORG123',
      JSON.stringify({ lastSynced: staleTime })
    );

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('sync-modal')).toBeInTheDocument();
    });
  });

  it('does NOT render SyncModal if recently synced', async () => {
    const recentTime = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    localStorage.setItem(
      'syncJob_ORG123',
      JSON.stringify({ lastSynced: recentTime })
    );

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('sync-modal')).not.toBeInTheDocument();
  });

  it('always renders SyncRibbon if orgId is present', async () => {
    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('sync-ribbon')).toBeInTheDocument();
    });
  });

  it('renders ValidateRibbon when orgId is present', async () => {
    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('validate-ribbon')).toBeInTheDocument();
    });
  });

  it('calls API when org data is missing in store', async () => {
    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/client-configurations/organizations/ORG123'
      );
      expect(mockSetters.setGeneralSettings).toHaveBeenCalled();
      expect(mockSetters.setBillingData).toHaveBeenCalled();
      expect(mockSetters.setMarketingData).toHaveBeenCalled();
      expect(mockSetters.setReportingData).toHaveBeenCalled();
    });
  });

  it('applies correct container class names', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });

    expect(container.querySelector('.org-config-main-layout')).toBeTruthy();
    expect(container.querySelector('.org-config-content')).toBeTruthy();
  });

  it('handles API error and shows toast', async () => {
    const showToastSpy = vi.fn();
    const toastModule = await import('@ucc/common-ui');
    vi.spyOn(toastModule, 'showCustomToast').mockImplementation(showToastSpy);

    (api.get as any).mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(showToastSpy).toHaveBeenCalledWith({
        type: ToastType.Error,
        title: 'Failed',
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      });
    });
  });

  it('renders FailSafePage when API fails and not on excluded page', async () => {
    (api.get as any).mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter initialEntries={['/CCC/org-detail/ORG123/general-settings']}>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('failsafe-page')).toBeInTheDocument();
      expect(screen.getByTestId('failsafe-page')).toHaveTextContent('dataFailed');
    });
  });

  it('uses existing store data when available (else branch)', async () => {
    // Mock store to return existing data
    const existingData = {
      orgName: 'Existing Org',
      orgId: 'ORG456',
    };

    mockSetters.getGeneralSettings.mockReturnValueOnce(existingData as any);
    mockSetters.getBillingData.mockReturnValueOnce({ billing: 'data' } as any);
    mockSetters.getMarketingData.mockReturnValueOnce({ marketing: 'data' } as any);
    mockSetters.getReportingData.mockReturnValueOnce({ reporting: 'data' } as any);

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });

    // Org data API should not be called when data exists in store
    expect(api.get).not.toHaveBeenCalledWith('/client-configurations/organizations/ORG123');
    expect(mockSetters.getGeneralSettings).toHaveBeenCalledWith('ORG123');
    expect(mockSetters.getBillingData).toHaveBeenCalledWith('ORG123');
    expect(mockSetters.getMarketingData).toHaveBeenCalledWith('ORG123');
    expect(mockSetters.getReportingData).toHaveBeenCalledWith('ORG123');
  });

  it('renders Outlet when API succeeds', async () => {
    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
      expect(screen.queryByTestId('failsafe-page')).not.toBeInTheDocument();
    });
  });

  it('does not render SyncModal when orgUpdatedAt is missing', async () => {
    setupConfigStoreMock({
      org: {
        orgName: 'Test Org',
        orgId: 'ORG123',
        updatedAt: '', // Empty updatedAt
      },
    });

    localStorage.clear(); // Ensure diffMinutes will be null

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('sync-modal')).toBeInTheDocument();
  });

  it('handles localStorage with no lastSynced field', async () => {
    localStorage.setItem('syncJob_ORG123', JSON.stringify({ someOtherField: 'value' }));

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });

    // Should still work without lastSynced
    expect(screen.getByTestId('sync-ribbon')).toBeInTheDocument();
  });

  it('renders SyncModal when diffMinutes is null (no localStorage)', async () => {
    // No localStorage, so diffMinutes will be null and condition orgId && orgUpdatedAt && (diffMinutes === null || diffMinutes > 10) is true
    localStorage.clear();

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('sync-modal')).toBeInTheDocument();
    });
  });

  it('handles API response with missing optional fields', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        organizationGeneralSettings: undefined,
        organizationBilling: undefined,
        organizationMarketing: undefined,
        organizationReporting: undefined,
      },
    });

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });

    // Should still render with empty objects as fallback
    expect(mockSetters.setGeneralSettings).toHaveBeenCalledWith('ORG123', {});
    expect(mockSetters.setBillingData).toHaveBeenCalledWith('ORG123', {});
    expect(mockSetters.setMarketingData).toHaveBeenCalledWith('ORG123', {});
    expect(mockSetters.setReportingData).toHaveBeenCalledWith('ORG123', {});
  });
});

import { ToastType, ERROR_MESSAGES } from '@/constants';

describe('<OrgConfigLayout /> - edit mode and permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupConfigStoreMock();
  });

  it('renders ConfigHeader in all modes', async () => {
    render(
      <MemoryRouter initialEntries={['/CCC/org-detail/ORG123/general-settings']}>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });
  });

  it('does not render PendingRibbon when no pending changes', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/tasks/organization/')) return Promise.resolve([]);
      return Promise.resolve({
        data: {
          organizationGeneralSettings: {},
          organizationBilling: {},
          organizationMarketing: {},
          organizationReporting: {},
        },
      });
    });

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('pending-ribbon')).not.toBeInTheDocument();
  });

  it('renders PendingRibbon when pending changes exist', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/tasks/organization/'))
        return Promise.resolve([{ taskId: 'T-1', updatedBy: 'User A' }]);
      return Promise.resolve({
        data: {
          organizationGeneralSettings: {},
          organizationBilling: {},
          organizationMarketing: {},
          organizationReporting: {},
        },
      });
    });

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pending-ribbon')).toBeInTheDocument();
    });
  });

  it('renders ActionButton with "Select action" in view mode', async () => {
    render(
      <MemoryRouter initialEntries={['/CCC/org-detail/ORG123/general-settings']}>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('action-button')).toHaveTextContent('Select action');
    });
  });

  it('does not render ActionButton when user lacks edit permission', async () => {
    const ucc = await import('@ucc/common-ui');
    vi.spyOn(ucc, 'hasPermission' as any).mockReturnValue(false);

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('action-button')).not.toBeInTheDocument();

    vi.spyOn(ucc, 'hasPermission' as any).mockReturnValue(true);
  });

  it('renders FailSafePage unauthorized when hasAllPermission returns false', async () => {
    const ucc = await import('@ucc/common-ui');
    vi.spyOn(ucc, 'hasAllPermission' as any).mockReturnValue(false);

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('failsafe-page')).toHaveTextContent('unauthorized');
    });

    vi.spyOn(ucc, 'hasAllPermission' as any).mockReturnValue(true);
  });

  it('does not render ValidateRibbon on excluded page (opportunities)', async () => {
    render(
      <MemoryRouter initialEntries={['/CCC/org-detail/ORG123/opportunities']}>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });
  });

  it('renders org-config-content without edit-mode class in view mode', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('config-header')).toBeInTheDocument();
    });

    const content = container.querySelector('.org-config-content');
    expect(content).not.toHaveClass('edit-mode');
  });

  it('renders Loader when loading is true', () => {
    mockSetters.getGeneralSettings.mockReturnValue(null);
    (api.get as any).mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('handles pending task fetch error gracefully', async () => {
    const showToastSpy = vi.fn();
    const toastModule = await import('@ucc/common-ui');
    vi.spyOn(toastModule, 'showCustomToast').mockImplementation(showToastSpy);

    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/tasks/organization/'))
        return Promise.reject(new Error('pending task error'));
      return Promise.resolve({
        data: {
          organizationGeneralSettings: {},
          organizationBilling: {},
          organizationMarketing: {},
          organizationReporting: {},
        },
      });
    });

    render(
      <MemoryRouter>
        <OrgConfigLayout />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(showToastSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: ToastType.Error }),
      );
    });
  });
});
