// =============================================================================
// Village Health Population Dashboard - HealthMetrics Component Tests
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealthMetrics } from '@/components/village/HealthMetrics';
import type { DiseaseStatistics, ScreeningCoverage } from '@/types/villageHealth';

// Mock the Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

describe('HealthMetrics Component', () => {
  const createMockDiseases = (): DiseaseStatistics[] => [
    {
      villageId: 1,
      diseaseCode: '001',
      diseaseName: 'เบาหวาน',
      patientCount: 23,
      screeningCoverage: 75.5,
      lastScreeningDate: new Date('2024-01-15'),
    },
    {
      villageId: 1,
      diseaseCode: '002',
      diseaseName: 'ความดันโลหิตสูง',
      patientCount: 31,
      screeningCoverage: 82.3,
      lastScreeningDate: new Date('2024-01-15'),
    },
    {
      villageId: 1,
      diseaseCode: '003',
      diseaseName: 'COPD',
      patientCount: 8,
      screeningCoverage: null,
      lastScreeningDate: null,
    },
    {
      villageId: 1,
      diseaseCode: '004',
      diseaseName: 'โรคหอบหืด',
      patientCount: 5,
      screeningCoverage: null,
      lastScreeningDate: null,
    },
    {
      villageId: 1,
      diseaseCode: '005',
      diseaseName: 'วัณโรค',
      patientCount: 2,
      screeningCoverage: null,
      lastScreeningDate: null,
    },
    {
      villageId: 1,
      diseaseCode: '006',
      diseaseName: 'โรคไตวายเรื้อรัง',
      patientCount: 7,
      screeningCoverage: null,
      lastScreeningDate: null,
    },
    {
      villageId: 1,
      diseaseCode: '007',
      diseaseName: 'โรคมะเร็ง',
      patientCount: 3,
      screeningCoverage: null,
      lastScreeningDate: null,
    },
    {
      villageId: 1,
      diseaseCode: '008',
      diseaseName: 'โรคจิตเวช',
      patientCount: 4,
      screeningCoverage: null,
      lastScreeningDate: null,
    },
  ];

  const mockScreening: ScreeningCoverage = {
    villageId: 1,
    totalEligible: 150,
    dmScreened: 113,
    htScreened: 124,
    dmCoveragePercent: 75.3,
    htCoveragePercent: 82.7,
  };

  describe('Rendering', () => {
    it('should render disease names and counts', () => {
      render(<HealthMetrics diseases={createMockDiseases()} />);

      expect(screen.getByText('เบาหวาน')).toBeInTheDocument();
      expect(screen.getByText('ความดันโลหิตสูง')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument();
    });

    it('should render all diseases in full mode', () => {
      render(<HealthMetrics diseases={createMockDiseases()} />);

      // Should show all 8 disease types
      expect(screen.getByText('COPD')).toBeInTheDocument();
      expect(screen.getByText('โรคหอบหืด')).toBeInTheDocument();
      expect(screen.getByText('วัณโรค')).toBeInTheDocument();
      expect(screen.getByText('โรคไตวายเรื้อรัง')).toBeInTheDocument();
      expect(screen.getByText('โรคมะเร็ง')).toBeInTheDocument();
      expect(screen.getByText('โรคจิตเวช')).toBeInTheDocument();
    });

    it('should render only DM and HT in compact mode', () => {
      render(<HealthMetrics diseases={createMockDiseases()} compact />);

      expect(screen.getByText('เบาหวาน')).toBeInTheDocument();
      expect(screen.getByText('ความดันโลหิตสูง')).toBeInTheDocument();

      // Should NOT show other diseases in compact mode
      expect(screen.queryByText('COPD')).not.toBeInTheDocument();
      expect(screen.queryByText('โรคหอบหืด')).not.toBeInTheDocument();
    });

    it('should show empty state when no diseases', () => {
      render(<HealthMetrics diseases={[]} />);

      expect(screen.getByText('ไม่มีข้อมูลโรค')).toBeInTheDocument();
    });

    it('should show empty state when diseases is null', () => {
      render(<HealthMetrics diseases={null as unknown as []} />);

      expect(screen.getByText('ไม่มีข้อมูลโรค')).toBeInTheDocument();
    });
  });

  describe('Screening Coverage', () => {
    it('should display coverage percentage when provided', () => {
      render(<HealthMetrics diseases={createMockDiseases()} screening={mockScreening} />);

      // Coverage should be displayed
      const badges = screen.getAllByTestId('badge');
      const coverageBadges = badges.filter((b) => b.textContent?.includes('%'));
      expect(coverageBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Color Coding', () => {
    it('should use destructive variant for high DM count', () => {
      const diseases = createMockDiseases();
      diseases[0].patientCount = 55; // High DM count

      render(<HealthMetrics diseases={diseases} />);

      const badges = screen.getAllByTestId('badge');
      const dmBadge = badges.find((b) => b.textContent === '55');
      expect(dmBadge).toHaveAttribute('data-variant', 'destructive');
    });

    it('should use secondary variant for medium disease count', () => {
      const diseases = createMockDiseases();
      diseases[0].patientCount = 25; // Medium DM count

      render(<HealthMetrics diseases={diseases} />);

      const badges = screen.getAllByTestId('badge');
      const dmBadge = badges.find((b) => b.textContent === '25');
      expect(dmBadge).toHaveAttribute('data-variant', 'secondary');
    });

    it('should use default variant for low disease count', () => {
      const diseases = createMockDiseases();
      diseases[0].patientCount = 5; // Low DM count

      render(<HealthMetrics diseases={diseases} />);

      const badges = screen.getAllByTestId('badge');
      const dmBadge = badges.find((b) => b.textContent === '5');
      expect(dmBadge).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <HealthMetrics diseases={createMockDiseases()} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
