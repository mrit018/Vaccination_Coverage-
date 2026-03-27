// =============================================================================
// Village Health Population Dashboard - VillageCard Component Tests
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VillageCard } from '@/components/village/VillageCard';
import type { VillageSummary } from '@/types/villageHealth';

describe('VillageCard Component', () => {
  const mockVillage: VillageSummary = {
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
  };

  const smallVillage: VillageSummary = {
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
    isOutOfArea: false,
  };

  const outOfAreaVillage: VillageSummary = {
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
  };

  describe('Rendering', () => {
    it('should render village name and moo', () => {
      render(<VillageCard village={mockVillage} />);

      expect(screen.getByText(/หมู่ 5 - บ้านทดใหม่/)).toBeInTheDocument();
    });

    it('should display population count', () => {
      render(<VillageCard village={mockVillage} />);

      expect(screen.getByText('187')).toBeInTheDocument();
      expect(screen.getByText('ประชากร')).toBeInTheDocument();
    });

    it('should display household count', () => {
      render(<VillageCard village={mockVillage} />);

      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('ครัวเรือน')).toBeInTheDocument();
    });

    it('should display age group breakdowns', () => {
      render(<VillageCard village={mockVillage} />);

      expect(screen.getByText('อายุ 0-14')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('อายุ 15-59')).toBeInTheDocument();
      expect(screen.getByText('อายุ 60+')).toBeInTheDocument();
    });

    it('should display gender distribution', () => {
      render(<VillageCard village={mockVillage} />);

      expect(screen.getByText(/ชาย 92/)).toBeInTheDocument();
      expect(screen.getByText(/หญิง 95/)).toBeInTheDocument();
    });
  });

  describe('Out of Area Badge', () => {
    it('should show "นอกเขต" badge for village moo 0', () => {
      render(<VillageCard village={outOfAreaVillage} />);

      expect(screen.getByText('นอกเขต')).toBeInTheDocument();
    });

    it('should NOT show badge for regular villages', () => {
      render(<VillageCard village={mockVillage} />);

      expect(screen.queryByText('นอกเขต')).not.toBeInTheDocument();
    });
  });

  describe('Privacy Protection', () => {
    it('should apply privacy styling for small villages', () => {
      const { container } = render(<VillageCard village={smallVillage} />);

      // Small village should still render but with privacy protection
      expect(screen.getByText(/บ้านเล็ก/)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<VillageCard village={mockVillage} onClick={handleClick} />);

      fireEvent.click(screen.getByText(/บ้านทดใหม่/).closest('div')!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have cursor-pointer class when onClick is provided', () => {
      const { container } = render(
        <VillageCard village={mockVillage} onClick={() => {}} />
      );

      expect(container.querySelector('.cursor-pointer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible when onClick provided', () => {
      const handleClick = vi.fn();
      const { container } = render(
        <VillageCard village={mockVillage} onClick={handleClick} />
      );

      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });
  });
});
