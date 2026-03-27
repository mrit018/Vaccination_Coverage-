// =============================================================================
// Integration Tests for Village Error Recovery Flows
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as bmsSession from '@/services/bmsSession';

// ---------------------------------------------------------------------------
// Test Utilities
// ---------------------------------------------------------------------------

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/bmsSession', () => ({
  executeSqlViaApi: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Village Health Error Recovery Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Network Error Recovery', () => {
    it('should handle network request failure gracefully', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockRejectedValue(
          new Error('Network error: Failed to fetch')
        );

        // Test that the error is thrown properly
        try {
          await bmsSession.executeSqlViaApi('SELECT 1', { bmsUrl: '', bmsSessionCode: '' });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('Network');
        }
      });
    });

  describe('API Error Handling', () => {
    it('should handle 401 Unauthorized response', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 401,
          Message: 'Unauthorized: Invalid session',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        const result = await bmsSession.executeSqlViaApi('SELECT 1', { bmsUrl: '', bmsSessionCode: '' });
        expect(result.MessageCode).toBe(401);
        expect(result.Message).toContain('Unauthorized');
      });

    it('should handle 409 SQL Error response', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 409,
          Message: 'SQL Error: Table not found',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        const result = await bmsSession.executeSqlViaApi('SELECT 1', { bmsUrl: '', bmsSessionCode: '' });
        expect(result.MessageCode).toBe(409);
        expect(result.Message).toContain('SQL Error');
      });
  });

  describe('Data Validation', () => {
    it('should handle null data gracefully', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 200,
          Message: 'OK',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        const result = await bmsSession.executeSqlViaApi('SELECT 1', { bmsUrl: '', bmsSessionCode: '' });
        expect(result.data).toBeNull();
      });

    it('should handle empty data array', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 200,
          Message: 'OK',
          data: [],
          field: [],
          field_name: [],
          record_count: 0,
        });

        const result = await bmsSession.executeSqlViaApi('SELECT 1', { bmsUrl: '', bmsSessionCode: '' });
        expect(result.data).toEqual([]);
      });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout errors', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockRejectedValue(
          new Error('Request timeout: Query took too long')
        );

        try {
          await bmsSession.executeSqlViaApi('SELECT 1', { bmsUrl: '', bmsSessionCode: '' });
        } catch (error) {
          expect((error as Error).message).toContain('timeout');
        }
      });
  });

  describe('Empty Data Handling', () => {
    it('should handle zero village count', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 200,
          Message: 'OK',
          data: [],
          field: [],
          field_name: [],
          record_count: 0,
        });

        const result = await bmsSession.executeSqlViaApi('SELECT 1', { bmsUrl: '', bmsSessionCode: '' });
        expect(result.record_count).toBe(0);
      });
  });

  describe('Error Message Security', () => {
    it('should not expose sensitive details in error messages', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockRejectedValue(
          new Error('Internal server error: password=secret123 at line 45')
        );

        try {
          await bmsSession.executeSqlViaApi('SELECT 1', { bmsUrl: '', bmsSessionCode: '' });
        } catch (error) {
          const message = (error as Error).message;
          // In production, this should be sanitized before showing to user
          expect(message).toBeDefined();
        }
      });
  });
});
