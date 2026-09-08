import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CmcAssociationDetails } from '../CmcAssociationDetails';
vi.mock('@/components/DisplayRow/DisplayRow', () => ({
    default: ({ label, value }: { label: string; value: any }) => (
        <div data-testid="display-row">
            <span>{label}</span>
            <span>{value}</span>
        </div>
    ),
}));

vi.mock('@ucc/common-ui', async () => {
    const actual = await vi.importActual<any>('@ucc/common-ui');
    return {
        ...actual,
        SidebarRowWrapper: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="sidebar-row-wrapper">{children}</div>
        ),
    };
});

describe('CmcAssociationDetails', () => {
    const fieldsOrder = [
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type' },
        { key: 'anotherField', label: 'Another' }, // optional filler
        { key: 'lastModifiedBy', label: 'Last modified by' },
        { key: 'someOtherField', label: 'Extra 1' },
        { key: 'lastModifiedDate', label: 'Extra 2' },
    ];


    const mockData = {
        name: 'Test CMC',
        type: 'Primary',
        lastModifiedBy: 'John Doe',
        lastModifiedDate: '2023-07-25T14:35:00.000Z',
    };


    it('renders all fields correctly with data', () => {
        render(<CmcAssociationDetails data={mockData} fieldsOrder={fieldsOrder} />);
        expect(screen.getAllByTestId('display-row')).toHaveLength(5);
        expect(screen.getAllByText('Name')).toHaveLength(1);
        expect(screen.getByText('Test CMC')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Primary')).toBeInTheDocument();
        expect(screen.getByText('Last modified by')).toBeInTheDocument();
        expect(screen.getAllByText('John Doe')).toHaveLength(2);
        expect(screen.getByText(/at/i)).toBeInTheDocument();
    });

    it('handles missing data gracefully', () => {
        render(<CmcAssociationDetails data={null} fieldsOrder={fieldsOrder} />);
        expect(screen.getAllByTestId('display-row')).toHaveLength(5);
        expect(screen.getByText('Last modified by')).toBeInTheDocument();
        expect(screen.getAllByText('-')).toHaveLength(1);
    });

    it('handles missing lastModifiedBy', () => {
        const incompleteData = {
            name: 'Test CMC',
            type: 'Primary',
            lastModifiedBy: null,
        };
        render(<CmcAssociationDetails data={incompleteData} fieldsOrder={fieldsOrder} />)
        expect(screen.getAllByText('-')).toHaveLength(1);
    });

    it('handles missing fieldsOrder', () => {
        render(<CmcAssociationDetails data={mockData} />);
        const expectedDate = new Date(mockData.lastModifiedDate).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });

        expect(screen.getByText(new RegExp(expectedDate.split(',')[0]))).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
});
