// =============================================================================
// Component Tests for ComparisonView
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonView } from '@/components/village/ComparisonView';
import type { VillageHealthData, ComorbidityStatistics, ScreeningCoverage } from '@/types/villageHealth';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const createMockVillageData = (villageId: number, villageMoo: string): VillageHealthData => ({
  village: {
    villageId,
    villageMoo,
    villageName: `หมู่บ้าน ${villageMoo}`,
    householdCount: 100,
    totalPopulation: 350,
    maleCount: 175,
    femaleCount: 175,
    age0to14: 70,
    age15to59: 210,
    age60Plus: 70,
    isOutOfArea: false,
  },
  diseases: [
    { villageId, diseaseCode: '001', diseaseName: 'เบาหวาน', patientCount: 15 + villageId, screeningCoverage: 80, lastScreeningDate: null },
    { villageId, diseaseCode: '002', diseaseName: 'ความดันโลหิตสูง', patientCount: 20 + villageId, screeningCoverage: 75, lastScreeningDate: null },
  ],
  comorbidities: {
    villageId,
    eyeComplication: 2,
    footComplication: 3,
    kidneyComplication: 1,
    cardiovascularComplication: 0,
    cerebrovascularComplication: 0,
    peripheralVascularComplication: 0,
    dentalComplication: 0,
  } as ComorbidityStatistics,
  screening: {
    villageId,
    totalEligible: 100,
    dmScreened: 80,
    htScreened: 75,
    dmCoveragePercent: 80,
    htCoveragePercent: 75,
  } as ScreeningCoverage,
});

const mockVillages: VillageHealthData[] = [
  createMockVillageData(1, '1'),
  createMockVillageData(2, '2'),
  createMockVillageData(3, '3'),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ComparisonView', () => {
  it('should render empty state when no villages selected', () => {
    render(<ComparisonView villages={[]} />);

    expect(screen.getByText(/เลือกหมู่บ้านที่ต้องการเปรียบเทียบ/)).toBeInTheDocument();
  });

  it('should render comparison header when villages are provided', () => {
    render(<ComparisonView villages={mockVillages} />);

    // Check that some header text is present (appears multiple times)
    expect(screen.getAllByText(/เปรียบเทียบ/).length).toBeGreaterThan(0);
  });

  it('should render village names in cards', () => {
    render(<ComparisonView villages={mockVillages} />);

    // Village names appear in the comparison
    const village1Elements = screen.getAllByText(/หมู่ 1/);
    expect(village1Elements.length).toBeGreaterThan(0);
  });

  it('should call onClear when clear button is clicked', () => {
    const onClear = vi.fn();
    render(<ComparisonView villages={mockVillages} onClear={onClear} />);

    const clearButton = screen.getByRole('button', { name: /ล้างการเลือก/ });
    if (clearButton) {
      clearButton.click();
      expect(onClear).toHaveBeenCalled();
    }
  });

  it('should render population counts in comparison', () => {
    render(<ComparisonView villages={mockVillages} />);

    // Each village has 350 population - check it appears somewhere
    const population350 = screen.getAllByText('350');
    expect(population350.length).toBeGreaterThan(0);
  });

  it('should render household counts in comparison', () => {
    render(<ComparisonView villages={mockVillages} />);

    // Each village has 100 households
    const household100 = screen.getAllByText('100');
    expect(household100.length).toBeGreaterThan(0);
  });

  it('should render disease statistics', () => {
    render(<ComparisonView villages={mockVillages} />);

    // Disease names should appear
    expect(screen.getAllByText(/เบาหวาน/).length).toBeGreaterThan(0);
  });

  it('should handle single village comparison', () => {
    const singleVillage = [mockVillages[0]];
    render(<ComparisonView villages={singleVillage} />);

    expect(screen.getAllByText(/เปรียบเทียบ/).length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ComparisonView villages={mockVillages} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle villages without comorbidities data', () => {
    const villageWithoutComorbidities: VillageHealthData[] = [{
      ...mockVillages[0],
      comorbidities: null,
    }];

    render(<ComparisonView villages={villageWithoutComorbidities} />);

    // Should still render the comparison
    expect(screen.getAllByText(/เปรียบเทียบ/).length).toBeGreaterThan(0);
  });

  it('should handle villages without screening data', () => {
    const villageWithoutScreening: VillageHealthData[] = [{
      ...mockVillages[0],
      screening: null,
    }];

    render(<ComparisonView villages={villageWithoutScreening} />);

    // Should still render the comparison
    expect(screen.getAllByText(/เปรียบเทียบ/).length).toBeGreaterThan(0);
  });

  it('should show comparison table', () => {
    render(<ComparisonView villages={mockVillages} />);

    // The comparison table should be present
    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
  });
});
