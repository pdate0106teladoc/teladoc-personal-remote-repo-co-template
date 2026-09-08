// src/components/HierarchyPage.test.tsx
import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import HierarchyPage from '../Hierarchy'
import { ERROR_MESSAGES, ToastType } from '@/constants'

// 1) Mock all external dependencies
const { mockParams, mockGetHierarchyCache, mockSetHierarchyCache, mockApiGet, mockToast } = vi.hoisted(() => ({
  mockParams: { id: "hier-123" },
  mockGetHierarchyCache: vi.fn(),
  mockSetHierarchyCache: vi.fn(),
  mockApiGet: vi.fn(),
  mockToast: vi.fn(),
}));

vi.mock('react-router-dom', () => ({ useParams: () => mockParams }))
vi.mock('@/store/useOrgStore', () => ({
  __esModule: true,
  default: (selector?: any) => {
    const state = {
      getHierarchyCache: mockGetHierarchyCache,
      setHierarchyCache: mockSetHierarchyCache,
    };
    return selector ? selector(state) : state;
  },
}))
vi.mock('@/api/apiService', () => ({
  __esModule: true,
  default: { get: (...args: any[]) => mockApiGet(...args) },
}))
vi.mock('@ucc/common-ui', async () => {
  const actual = await vi.importActual<any>("@ucc/common-ui");
  return {
    ...actual,
    showCustomToast: (args: any) => mockToast(args),
    Loader: ({ text }: any) => <div data-testid="loader">{text}</div>,
    FailSafePage: ({ cardType }: any) => {
      if (cardType === "dataFailed") return <div>Something&apos;s wrong.</div>;
      return <div data-testid="failsafe-page">{cardType}</div>;
    },
  };
});
vi.mock('@/components/Cards/CustomCards', () => ({
  __esModule: true,
  // provide a named CustomCards export
  CustomCards: (props: { title: string; children: React.ReactNode }) => (
    <div data-testid="card">
      {props.title}
      {props.children}
    </div>
  ),
}));
vi.mock('@/components/HierarchyTree/OrgTree', () => ({
  __esModule: true,
  OrgTree: (props: any) => <div data-testid="tree">{JSON.stringify(props.data)}</div>,
}))

describe('<HierarchyPage />', () => {
  const dummyHierarchy = { foo: 'bar' }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetHierarchyCache.mockReturnValue(null);
  })

  it('renders <Loader> when initial data is missing', () => {
    render(<HierarchyPage />)
    expect(screen.getByTestId('loader')).toHaveTextContent('Loading...')
  })

  it('fetches and caches on mount when no data, then renders empty state on error', async () => {
    // make API call reject
    mockApiGet.mockRejectedValue(new Error('oops'))

    render(<HierarchyPage />)
    // wait for effect to run
    await waitFor(() => {
      expect(mockSetHierarchyCache).not.toHaveBeenCalled()
      expect(mockToast).toHaveBeenCalledWith({
        type: ToastType.Error,
        title: 'Failed',
        message: ERROR_MESSAGES.SOMETHINGS_WRONG,
      })
    })
    // after loading false and no data, component renders FailSafePage with cardType="dataFailed"
    expect(screen.getByText("Something's wrong.")).toBeInTheDocument()
  })

  it('fetches and caches the first item on success then renders tree', async () => {
    const response = { data: [dummyHierarchy, { foo: 'ignore' }] }
    mockApiGet.mockResolvedValue(response)

    render(<HierarchyPage />)

    // wait for setHierarchyCache to be called with first item
    await waitFor(() => {
      expect(mockSetHierarchyCache).toHaveBeenCalledWith("hier-123", dummyHierarchy)
    })

    // now that data is cached, component should re-render
    // we need to re-mock getHierarchyCache to return the cached value
    mockGetHierarchyCache.mockReturnValue(dummyHierarchy);

    // force a re-render
    render(<HierarchyPage />)

    // must find CustomCards wrapper and OrgTree inside
    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByTestId('tree')).toHaveTextContent(JSON.stringify(dummyHierarchy))
  })

  it('renders cached data immediately without calling API', () => {
    // pre-populate cache
    mockGetHierarchyCache.mockReturnValue(dummyHierarchy);

    render(<HierarchyPage />)

    // should not show loader
    expect(screen.queryByTestId('loader')).toBeNull()
    // should not call api.get
    expect(mockApiGet).not.toHaveBeenCalled()
    // should render OrgTree with dummyHierarchy
    expect(screen.getByTestId('tree')).toHaveTextContent(JSON.stringify(dummyHierarchy))
  })
})
