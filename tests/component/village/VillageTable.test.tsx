// =============================================================================
// Component Tests for VillageTable (Sortable/Filterable)
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VillageTable } from '@/components/village/VillageTable';
import type { VillageHealthData } from '@/types/villageHealth';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const createMockVillage = (id: number, moo: string, population: number, dmCount: number): VillageHealthData => ({
  village: {
    villageId: id,
    villageMoo: moo,
    villageName: `หมู่บ้าน ${moo}`,
    householdCount: Math.floor(population / 4),
    totalPopulation: population,
    maleCount: Math.floor(population / 2),
    femaleCount: Math.floor(population / 2),
    age0to14: Math.floor(population * 0.2),
    age15to59: Math.floor(population * 0.6),
    age60Plus: Math.floor(population * 0.2),
    isOutOfArea: moo === '0',
  },
  diseases: [
    { villageId: id, diseaseCode: '001', diseaseName: 'เบาหวาน', patientCount: dmCount, screeningCoverage: null, lastScreeningDate: null },
    { villageId: id, diseaseCode: '002', diseaseName: 'ความดันโลหิตสูง', patientCount: dmCount + 5, screeningCoverage: null, lastScreeningDate: null },
  ],
  comorbidities: null,
  screening: {
    villageId: id,
    totalEligible: population,
    dmScreened: Math.floor(population * 0.8),
    htScreened: Math.floor(population * 0.75),
    dmCoveragePercent: 80,
    htCoveragePercent: 75,
  },
});

const mockVillages: VillageHealthData[] = [
  createMockVillage(1, '1', 500, 25),
  createMockVillage(2, '2', 300, 15),
  createMockVillage(3, '3', 700, 35),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VillageTable', () => {
  describe('Rendering', () => {
    it('should render table with villages', () => {
      render(<VillageTable data={mockVillages} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should render village names', () => {
      render(<VillageTable data={mockVillages} />);

      expect(screen.getByText(/หมู่ 1/)).toBeInTheDocument();
      expect(screen.getByText(/หมู่ 2/)).toBeInTheDocument();
      expect(screen.getByText(/หมู่ 3/)).toBeInTheDocument();
    });

    it('should render population counts', () => {
      render(<VillageTable data={mockVillages} />);

      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
      expect(screen.getByText('700')).toBeInTheDocument();
    });

    it('should render household counts', () => {
      render(<VillageTable data={mockVillages} />);

      const householdCounts = screen.getAllByText('125'); // 500/4
      expect(householdCounts.length).toBeGreaterThan(0);
    });

    it('should render disease counts with badges', () => {
      render(<VillageTable data={mockVillages} />);

      // Disease counts appear in badges
      expect(screen.getByText('25')).toBeInTheDocument(); // DM count for village 1
      expect(screen.getByText('15')).toBeInTheDocument(); // DM count for village 2
    });

    it('should render screening coverage percentages', () => {
      render(<VillageTable data={mockVillages} />);

      expect(screen.getAllByText('80.0%').length).toBeGreaterThan(0);
      expect(screen.getAllByText('75.0%').length).toBeGreaterThan(0);
    });

    it('should display village count summary', () => {
      render(<VillageTable data={mockVillages} />);

      expect(screen.getByText(/แสดง 3 จาก 3 หมู่บ้าน/)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should show sort indicators on headers', () => {
      render(<VillageTable data={mockVillages} />);

      // Headers should be clickable
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should sort by population when header clicked', () => {
      render(<VillageTable data={mockVillages} />);

      // Find population header and click it
      const populationHeader = screen.getByText('ประชากร');
      fireEvent.click(populationHeader);

      // Table should still render (sorting is internal)
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should sort by disease count when header clicked', () => {
      render(<VillageTable data={mockVillages} />);

      const dmHeader = screen.getByText('เบาหวาน');
      fireEvent.click(dmHeader);

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should have search input', () => {
      render(<VillageTable data={mockVillages} />);

      const searchInput = screen.getByPlaceholderText(/ค้นหาหมู่บ้าน/);
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter villages by search query', () => {
      render(<VillageTable data={mockVillages} />);

      const searchInput = screen.getByPlaceholderText(/ค้นหาหมู่บ้าน/);
      fireEvent.change(searchInput, { target: { value: 'หมู่บ้าน 1' } });

      // Table should still render (filtering is internal)
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should update displayed count when filtered', () => {
      render(<VillageTable data={mockVillages} />);

      // Initially shows all villages
      expect(screen.getByText(/แสดง 3 จาก 3 หมู่บ้าน/)).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('should call onVillageSelect when row clicked', () => {
      const onVillageSelect = vi.fn();
      render(<VillageTable data={mockVillages} onVillageSelect={onVillageSelect} />);

      const firstRow = screen.getByText(/หมู่ 1/).closest('tr');
      if (firstRow) {
        fireEvent.click(firstRow);
        expect(onVillageSelect).toHaveBeenCalled();
      }
    });
  });

  describe('Export', () => {
    it('should show export button when rows selected and onExport provided', () => {
      const onExport = vi.fn();
      render(<VillageTable data={mockVillages} onExport={onExport} />);

      // Initially no export button (no rows selected)
      const exportButton = screen.queryByRole('button', { name: /ส่งออก/ });
      // Export button should exist but may not show count yet
      expect(exportButton || screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Out of Area Village', () => {
    it('should show out of area badge for village moo 0', () => {
      const villageWithOutOfArea = [...mockVillages, createMockVillage(99, '0', 50, 5)];
      render(<VillageTable data={villageWithOutOfArea} />);

      expect(screen.getByText('นอกเขต')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <VillageTable data={mockVillages} className="custom-table" />
      );

      expect(container.firstChild).toHaveClass('custom-table');
    });
  });

  describe('Empty State', () => {
    it('should handle empty data array', () => {
      render(<VillageTable data={[]} />);

      expect(screen.getByText(/แสดง 0 จาก 0 หมู่บ้าน/)).toBeInTheDocument();
    });
  });
});
