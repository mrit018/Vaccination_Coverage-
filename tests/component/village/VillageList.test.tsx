// =============================================================================
// Village Health Population Dashboard - VillageList Component Tests
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VillageList } from '@/components/village/VillageList';
import type { VillageHealthData, VillageSummary } from '@/types/villageHealth';

// Mock the LoadingSpinner component
vi.mock('@/components/layout/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: { message: string }) => (
    <div data-testid="loading-spinner">{message}</div>
  ),
}));

// Mock the EmptyState component
vi.mock('@/components/dashboard/EmptyState', () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

describe('VillageList Component', () => {
  const createMockVillageData = (overrides?: Partial<VillageSummary>): VillageHealthData => ({
    village: {
      villageId: 1,
      villageMoo: '1',
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

  const mockVillages: VillageHealthData[] = [
    createMockVillageData({ villageId: 1, villageMoo: '1', villageName: 'บ้านหนึ่ง' }),
    createMockVillageData({ villageId: 2, villageMoo: '2', villageName: 'บ้านสอง' }),
    createMockVillageData({ villageId: 3, villageMoo: '3', villageName: 'บ้านสาม' }),
  ];

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<VillageList villages={[]} isLoading={true} error={null} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
    });

    it('should NOT show loading spinner when isLoading is false', () => {
      render(<VillageList villages={mockVillages} isLoading={false} error={null} />);

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when error is provided', () => {
      const error = new Error('Database connection failed');
      render(<VillageList villages={[]} isLoading={false} error={error} />);

      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });

    it('should show retry button when onRetry is provided', () => {
      const error = new Error('Test error');
      const handleRetry = vi.fn();
      render(
        <VillageList villages={[]} isLoading={false} error={error} onRetry={handleRetry} />
      );

      expect(screen.getByText('ลองอีกครั้ง')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const error = new Error('Test error');
      const handleRetry = vi.fn();
      render(
        <VillageList villages={[]} isLoading={false} error={error} onRetry={handleRetry} />
      );

      fireEvent.click(screen.getByText('ลองอีกครั้ง'));

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should NOT show retry button when onRetry is not provided', () => {
      const error = new Error('Test error');
      render(<VillageList villages={[]} isLoading={false} error={error} />);

      expect(screen.queryByText('ลองอีกครั้ง')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when villages array is empty', () => {
      render(<VillageList villages={[]} isLoading={false} error={null} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('ไม่พบหมู่บ้าน')).toBeInTheDocument();
    });

    it('should NOT show empty state when villages exist', () => {
      render(<VillageList villages={mockVillages} isLoading={false} error={null} />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('Village Rendering', () => {
    it('should render all villages', () => {
      render(<VillageList villages={mockVillages} isLoading={false} error={null} />);

      expect(screen.getByText(/บ้านหนึ่ง/)).toBeInTheDocument();
      expect(screen.getByText(/บ้านสอง/)).toBeInTheDocument();
      expect(screen.getByText(/บ้านสาม/)).toBeInTheDocument();
    });

    it('should render villages in a grid layout', () => {
      const { container } = render(
        <VillageList villages={mockVillages} isLoading={false} error={null} />
      );

      expect(container.querySelector('.grid')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onVillageClick when a village card is clicked', () => {
      const handleClick = vi.fn();
      render(
        <VillageList
          villages={mockVillages}
          isLoading={false}
          error={null}
          onVillageClick={handleClick}
        />
      );

      fireEvent.click(screen.getByText(/บ้านหนึ่ง/).closest('div')!);

      expect(handleClick).toHaveBeenCalledWith(mockVillages[0]);
    });

    it('should NOT fail when onVillageClick is not provided', () => {
      render(<VillageList villages={mockVillages} isLoading={false} error={null} />);

      // Click should not throw
      expect(() => {
        fireEvent.click(screen.getByText(/บ้านหนึ่ง/).closest('div')!);
      }).not.toThrow();
    });
  });

  describe('Priority Order', () => {
    it('should prioritize loading state over error and empty states', () => {
      const error = new Error('Test error');
      render(<VillageList villages={[]} isLoading={true} error={error} />);

      // Should show loading, not error
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });

    it('should prioritize error state over empty state', () => {
      const error = new Error('Test error');
      render(<VillageList villages={[]} isLoading={false} error={error} />);

      // Should show error, not empty state
      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });
});
