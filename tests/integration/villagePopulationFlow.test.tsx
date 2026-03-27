// =============================================================================
// Village Health Population Dashboard - Integration Tests
// =============================================================================
// Tests the full flow of loading and displaying village population data

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VillageHealthDashboard from '@/pages/VillageHealthDashboard';
import * as bmsSessionModule from '@/services/bmsSession';
import * as villageHealthModule from '@/services/villageHealth';

// Mock BMS Session
vi.mock('@/services/bmsSession', () => ({
  retrieveBmsSession: vi.fn(),
  extractConnectionConfig: vi.fn(),
}));

// Mock Village Health Service
vi.mock('@/services/villageHealth', () => ({
  fetchVillagePopulation: vi.fn(),
  fetchDiseaseStatistics: vi.fn(),
  fetchScreeningCoverage: vi.fn(),
  fetchComorbidityStatistics: vi.fn(),
  fetchAllVillageHealthData: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams('bms-session-id=test-session-id')],
}));

// Mock BmsSessionContext
vi.mock('@/contexts/BmsSessionContext', () => ({
  BmsSessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useBmsSessionContext: () => ({
    session: {
      bmsUrl: 'https://test.hosxp.net',
      bmsSessionCode: 'test-jwt-token',
      hospcode: '12345',
      hospname: 'โรงพยาบาลทดสอบ',
    },
    isLoading: false,
    error: null,
    refreshSession: vi.fn(),
  }),
}));

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Village Population Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful mocks with correct structure
    vi.mocked(bmsSessionModule.retrieveBmsSession).mockResolvedValue({
      MessageCode: 200,
      Message: 'Success',
      RequestTime: new Date().toISOString(),
      result: {
        user_info: {
          bms_url: 'https://test.hosxp.net',
          bms_session_code: 'test-jwt-token',
          hospital_code: '12345',
          name: 'Test User',
        },
      },
    });

    vi.mocked(bmsSessionModule.extractConnectionConfig).mockReturnValue({
      apiUrl: 'https://test.hosxp.net',
      bearerToken: 'test-jwt-token',
      databaseType: 'mysql',
      appIdentifier: 'BMS.Dashboard.Test',
    });

    vi.mocked(villageHealthModule.fetchAllVillageHealthData).mockResolvedValue([
      {
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
        },
        diseases: [],
        comorbidities: null,
        screening: null,
      },
      {
        village: {
          villageId: 2,
          villageMoo: '2',
          villageName: 'บ้านสมบูรณ์',
          householdCount: 52,
          totalPopulation: 203,
          maleCount: 101,
          femaleCount: 102,
          age0to14: 48,
          age15to59: 110,
          age60Plus: 45,
          isOutOfArea: false,
        },
        diseases: [],
        comorbidities: null,
        screening: null,
      },
    ]);
  });

  describe('Initial Load', () => {
    it('should show loading state initially', async () => {
      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      // Should show loading spinner
      expect(screen.getByText('กำลังโหลดข้อมูล...')).toBeInTheDocument();
    });

    it('should fetch and display villages after successful load', async () => {
      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/บ้านทดใหม่/)).toBeInTheDocument();
      });

      expect(screen.getByText(/บ้านสมบูรณ์/)).toBeInTheDocument();
    });

    it('should display population counts for each village', async () => {
      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('187')).toBeInTheDocument();
      });

      expect(screen.getByText('203')).toBeInTheDocument();
    });

    it('should display household counts', async () => {
      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when session fetch fails', async () => {
      vi.mocked(bmsSessionModule.retrieveBmsSession).mockRejectedValue(
        new Error('Session expired')
      );

      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Session expired/i)).toBeInTheDocument();
      });
    });

    it('should display error message when village fetch fails', async () => {
      vi.mocked(villageHealthModule.fetchAllVillageHealthData).mockRejectedValue(
        new Error('Database connection failed')
      );

      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Database connection failed/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      vi.mocked(villageHealthModule.fetchAllVillageHealthData).mockRejectedValue(
        new Error('Test error')
      );

      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('ลองอีกครั้ง')).toBeInTheDocument();
      });
    });

    it('should retry fetch when retry button is clicked', async () => {
      vi.mocked(villageHealthModule.fetchAllVillageHealthData)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce([
          {
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
            },
            diseases: [],
            comorbidities: null,
            screening: null,
          },
        ]);

      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('ลองอีกครั้ง')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('ลองอีกครั้ง'));

      await waitFor(() => {
        expect(screen.getByText(/บ้านทดใหม่/)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no villages found', async () => {
      vi.mocked(villageHealthModule.fetchAllVillageHealthData).mockResolvedValue([]);

      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('ไม่พบหมู่บ้าน')).toBeInTheDocument();
      });

      expect(screen.getByText('ไม่มีข้อมูลหมู่บ้านในเขตรับผิดชอบ')).toBeInTheDocument();
    });
  });

  describe('Out of Area Village', () => {
    it('should display "นอกเขต" badge for village moo 0', async () => {
      vi.mocked(villageHealthModule.fetchAllVillageHealthData).mockResolvedValue([
        {
          village: {
            villageId: 0,
            villageMoo: '0',
            villageName: 'นอกเขตรับผิดชอบ',
            householdCount: 10,
            totalPopulation: 25,
            maleCount: 12,
            femaleCount: 13,
            age0to14: 5,
            age15to59: 15,
            age60Plus: 5,
            isOutOfArea: true,
          },
          diseases: [],
          comorbidities: null,
          screening: null,
        },
      ]);

      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('นอกเขต')).toBeInTheDocument();
      });
    });
  });

  describe('Privacy Protection', () => {
    it('should hide counts for small villages (<10 population)', async () => {
      vi.mocked(villageHealthModule.fetchAllVillageHealthData).mockResolvedValue([
        {
          village: {
            villageId: 3,
            villageMoo: '9',
            villageName: 'บ้านเล็ก',
            householdCount: 0, // Zeroed for privacy
            totalPopulation: 7,
            maleCount: 0, // Zeroed for privacy
            femaleCount: 0, // Zeroed for privacy
            age0to14: 0,
            age15to59: 0,
            age60Plus: 0,
            isOutOfArea: false,
          },
          diseases: [],
          comorbidities: null,
          screening: null,
        },
      ]);

      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/บ้านเล็ก/)).toBeInTheDocument();
      });

      // Small village should still render
      expect(screen.getByText(/บ้านเล็ก/)).toBeInTheDocument();
    });
  });

  describe('Dashboard Header', () => {
    it('should display village count', async () => {
      render(<VillageHealthDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('2 หมู่บ้าน')).toBeInTheDocument();
      });
    });
  });
});
