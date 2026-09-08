import { render, screen } from '@testing-library/react';
import OpportunityDrawer from '@/components/sidebar/OpportunityDrawer';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DisplayRow to render label and value
vi.mock('@/components/DisplayRow/DisplayRow', () => ({
  __esModule: true,
  default: ({ label, value }: any) => <div data-testid="display-row">{`${label}: ${value}`}</div>
}));
// Mock SidebarRowWrapper, CustomTable, and FailSafePage from @ucc/common-ui
vi.mock('@ucc/common-ui', async () => {
  const actual = await vi.importActual<any>('@ucc/common-ui');
  return {
    ...actual,
    SidebarRowWrapper: ({ children }: any) => <div data-testid="sidebar-row">{children}</div>,
    CustomTable: ({ data }: any) => (
      <div data-testid="custom-table">
        {data.map((row: any, i: number) => (
          <div key={i} data-testid={`table-row-${i}`}>{JSON.stringify(row)}</div>
        ))}
      </div>
    ),
    FailSafePage: ({ cardType }: any) => <div data-testid="fail-safe">{cardType}</div>,
  };
});
// Mock react-bootstrap Tabs and Tab
vi.mock('react-bootstrap', () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  Tab: ({ children, title, eventKey }: any) => <div data-testid={`tab-${eventKey}`}><span>{title}</span>{children}</div>,
  Button: ({ children, onClick }: any) => <button data-testid="back-button" onClick={onClick}>{children}</button>
}));
// Mock arrowleft asset
vi.mock('@/assets/index', () => ({ arrowleft: 'arrow.svg' }));
vi.mock('@/assets/index', () => ({
  arrowleft: 'arrow.svg',
  ComingsoonIcon: 'comingsoon.svg',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('OpportunityDrawer', () => {
  const baseData = {
    name: 'TestProduct',
    account: 'Acct1',
    currentMembershipFee: 100,
    totalVisitFee: 200,
    bundleType: 'BT',
    consultType: 'CT',
    consultFees: 10,
    currency: 'USD',
    feeType: 'FT',
    quantity: 2,
    participantQuantity: 3,
    status: 'Active',
    startDate: '2023-01-01',
    products: [
      { productName: 'ProdA', id: '1', account: 'AcctA' },
      { productName: 'ProdB', id: '2', account: 'AcctB' }
    ]
  } as any;
  const opportunityTab = {
    eventKey: 'opp', title: 'Opportunities', fields: [
      { key: 'name', label: 'Name' },
      { key: 'account', label: 'Account' }
    ],
    tabWithBox: false,
    tableRequired: true,
    tableData: [{ id: 'O1', value: 'V1' }],
    tableColumns: [] as any[],
    tableHeader: 'OppTable'
  } as any;
  const boxTab = {
    eventKey: 'prod', title: 'Products', fields: [
      { key: 'productName', label: 'Product Name' },
      { key: 'account', label: 'Account' }
    ],
    tabWithBox: true
  };

  it('renders display rows and table for non-box tab', () => {
    render(<OpportunityDrawer tabs={[opportunityTab]} data={baseData} />);
    // Should render two DisplayRow for fields
    const rows = screen.getAllByTestId('display-row');
    expect(rows[0]).toHaveTextContent('Name: TestProduct');
    expect(rows[1]).toHaveTextContent('Account: Acct1');
    // Should render table header and row
    expect(screen.getByText('OppTable')).toBeInTheDocument();
    expect(screen.getByTestId('table-row-0')).toHaveTextContent(JSON.stringify({ id: 'O1', value: 'V1' }));
  });

  // it('renders list and expands details for box tab', () => {
  //   render(<OpportunityDrawer tabs={[boxTab]} data={baseData} />);
  //   // Initially show list links
  //   const linkA = screen.getAllByText('ProdA');
  //   expect(linkA[0]).toBeInTheDocument();
  //   const linkB = screen.getAllByText('ProdB');
  //   expect(linkB[0]).toBeInTheDocument();
  //   // Click a product
  //   fireEvent.click(linkA[0]);
  //   // Should show back button
  //   expect(screen.getByTestId('back-button')).toBeInTheDocument();
  //   // Should render fieldsOrderProductDetails via DisplayRow
  //   // e.g., first field Product Name
  //   expect(screen.getAllByTestId('display-row')[0]).toHaveTextContent('Product Name: ProdA');
  // });

  // it('collapses details when back button clicked', () => {
  //   render(<OpportunityDrawer tabs={[boxTab]} data={baseData} />);
  //   fireEvent.click(screen.getAllByText('ProdA')[0]);
  //   expect(screen.getByTestId('back-button')).toBeInTheDocument();
  //   fireEvent.click(screen.getByTestId('back-button'));
  //   // Should show list again
  //   expect(screen.getAllByText('ProdA')[0]).toBeInTheDocument();
  //   expect(screen.getAllByText('ProdB')[0]).toBeInTheDocument();
  // });

  it('handles missing data gracefully', () => {
    render(<OpportunityDrawer tabs={[opportunityTab, boxTab]} data={null} />);
    // Non-box: DisplayRow gets "-"
    const rows = screen.getAllByTestId('display-row');
    rows.forEach(r => expect(r).toHaveTextContent('-'));
    // Box: no list rendered
    expect(screen.queryByText('ProdA')).toBeNull();
  });
});
