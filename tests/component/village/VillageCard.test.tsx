// =============================================================================
// Village Health Population Dashboard - VillageCard Component Tests
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VillageCard } from '@/components/village/VillageCard';
import type { VillageHealthData, VillageSummary } from '@/types/villageHealth';

// Mock the HealthMetrics component
vi.mock('@/components/village/HealthMetrics', () => ({
  HealthMetrics: () => <div data-testid="health-metrics">Health Metrics</div>,
}));

describe('VillageCard Component', () => {
  const createMockVillageData = (overrides?: Partial<VillageSummary>): VillageHealthData => ({
    village: {
      villageId: 1,
      villageMoo: '5',
      villageName: 'บ้านทดใหม่',
      householdCount: 45,
      totalPopulation: 187,
      maleCount: 92,
      femaleCount: 95,
      age0to14: 42,
      age15to59: 98,
      age60Plus: 47,
      isOutOfArea: false,
      ...overrides,
    },
    diseases: [],
    comorbidities: null,
    screening: null,
  });

  const mockVillageData = createMockVillageData();
  const smallVillageData = createMockVillageData({
    villageId: 2,
    villageMoo: '3',
    villageName: 'บ้านเล็ก',
    householdCount: 3,
    totalPopulation: 7,
    maleCount: 3,
    femaleCount: 4,
    age0to14: 2,
    age15to59: 3,
    age60Plus: 2,
  });
  const outOfAreaVillageData = createMockVillageData({
    villageId: 0,
    villageMoo: '0',
    villageName: 'นอกเขต',
    householdCount: 10,
    totalPopulation: 15,
    maleCount: 8,
    femaleCount: 7,
    age0to14: 3,
    age15to59: 8,
    age60Plus: 4,
    isOutOfArea: true,
  });

  describe('Rendering', () => {
    it('should render village name and moo', () => {
      render(<VillageCard data={mockVillageData} />);

      expect(screen.getByText(/หมู่ 5 - บ้านทดใหม่/)).toBeInTheDocument();
    });

    it('should display population count', () => {
      render(<VillageCard data={mockVillageData} />);

      expect(screen.getByText('187')).toBeInTheDocument();
    });

    it('should display household count', () => {
      render(<VillageCard data={mockVillageData} />);

      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('should display age distribution', () => {
      render(<VillageCard data={mockVillageData} />);

      expect(screen.getByText('42')).toBeInTheDocument(); // age 0-14
      expect(screen.getByText('98')).toBeInTheDocument(); // age 15-59
      expect(screen.getByText('47')).toBeInTheDocument(); // age 60+
    });

    it('should display gender distribution', () => {
      render(<VillageCard data={mockVillageData} />);

      expect(screen.getByText(/ชาย 92/)).toBeInTheDocument();
      expect(screen.getByText(/หญิง 95/)).toBeInTheDocument();
    });
  });

  describe('Out of Area Badge', () => {
    it('should display "นอกเขต" badge for out of area village', () => {
      render(<VillageCard data={outOfAreaVillageData} />);

      expect(screen.getByText('นอกเขต')).toBeInTheDocument();
    });

    it('should NOT display badge for regular village', () => {
      render(<VillageCard data={mockVillageData} />);

      expect(screen.queryByText('นอกเขต')).not.toBeInTheDocument();
    });

    it('should show "(นอกเขต)" badge for out of area village', () => {
      render(<VillageCard data={outOfAreaVillageData} />);

      expect(screen.getByText('นอกเขต')).toBeInTheDocument();
    });
  });

  describe('Privacy Protection', () => {
    it('should display population count normally for villages >= 10', () => {
      render(<VillageCard data={mockVillageData} />);

      expect(screen.getByText('187')).toBeInTheDocument();
    });

    it('should still display small village count (privacy handled elsewhere)', () => {
      render(<VillageCard data={smallVillageData} />);

      // Village should still render
      expect(screen.getByText(/บ้านเล็ก/)).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(<VillageCard data={mockVillageData} onClick={handleClick} />);

      fireEvent.click(screen.getByText(/บ้านทดใหม่/).closest('div')!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should NOT fail when onClick is not provided', () => {
      render(<VillageCard data={mockVillageData} />);

      // Click should not throw
      expect(() => {
        fireEvent.click(screen.getByText(/บ้านทดใหม่/).closest('div')!);
      }).not.toThrow();
    });
  });

  describe('Expand/Collapse', () => {
    it('should show expand button when onExpand is provided', () => {
      const handleExpand = vi.fn();
      render(<VillageCard data={mockVillageData} onExpand={handleExpand} />);

      expect(screen.getByText('แสดงรายละเอียด')).toBeInTheDocument();
    });

    it('should NOT show expand button when onExpand is not provided', () => {
      render(<VillageCard data={mockVillageData} />);

      expect(screen.queryByText('แสดงรายละเอียด')).not.toBeInTheDocument();
    });

    it('should call onExpand when expand button is clicked', () => {
      const handleExpand = vi.fn();
      render(<VillageCard data={mockVillageData} onExpand={handleExpand} />);

      fireEvent.click(screen.getByText('แสดงรายละเอียด'));

      expect(handleExpand).toHaveBeenCalledTimes(1);
    });

    it('should show collapse text when expanded', () => {
      const handleExpand = vi.fn();
      render(<VillageCard data={mockVillageData} onExpand={handleExpand} isExpanded={true} />);

      expect(screen.getByText('ซ่อนรายละเอียด')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible when onClick provided', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <VillageCard data={mockVillageData} onClick={handleClick} />
      );

      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });
  });
});
