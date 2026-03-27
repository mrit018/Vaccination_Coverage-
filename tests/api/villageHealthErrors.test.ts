// =============================================================================
// API Contract Tests for Village Health Query Error Scenarios
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchVillagePopulation,
  fetchDiseaseStatistics,
  fetchScreeningCoverage,
  fetchComorbidityStatistics,
} from '@/services/villageHealth';
import * as bmsSession from '@/services/bmsSession';
import type { ConnectionConfig } from '@/types';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const mockConfig: ConnectionConfig = {
  bmsUrl: 'https://test.hosxp.net',
  bmsSessionCode: 'test-session-code',
};

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/bmsSession', () => ({
  executeSqlViaApi: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Village Health API Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchVillagePopulation Error Handling', () => {
    it('should throw descriptive error on HTTP 401 Unauthorized', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 401,
          Message: 'Unauthorized: Invalid or expired session',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow(/401|Unauthorized/i);
      });

      it('should throw descriptive error on HTTP 403 Forbidden', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 403,
          Message: 'Forbidden: Access denied to patient data',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow(/403|Forbidden|Access denied/i);
      });

      it('should throw descriptive error on HTTP 409 SQL Error', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 409,
          Message: 'SQL Error: Table "village" doesn\'t exist',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow(/409|SQL Error/i);
      });

      it('should throw descriptive error on HTTP 500 Server Error', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 500,
          Message: 'Internal Server Error',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow(/500|Server Error/i);
      });

      it('should handle network timeout errors', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockRejectedValue(
          new Error('Request timeout after 60000ms')
        );

        await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow(/timeout/i);
      });
  });

  describe('fetchDiseaseStatistics Error Handling', () => {
    it('should throw on unauthorized access', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 401,
          Message: 'Unauthorized',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        await expect(fetchDiseaseStatistics(mockConfig)).rejects.toThrow();
      });

    it('should return empty map on empty response', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 200,
          Message: 'OK',
          data: [],
          field: [],
          field_name: [],
          record_count: 0,
        });

        const result = await fetchDiseaseStatistics(mockConfig);
        expect(result.size).toBe(0);
      });
  });

  describe('fetchScreeningCoverage Error Handling', () => {
    it('should throw on database connection error', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockRejectedValue(
          new Error('Connection refused')
        );

        await expect(fetchScreeningCoverage(mockConfig)).rejects.toThrow(/Connection|refused/i);
      });

    it('should handle empty screening data', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 200,
          Message: 'OK',
          data: [],
          field: [],
          field_name: [],
          record_count: 0,
        });

        const result = await fetchScreeningCoverage(mockConfig);
        expect(result.size).toBe(0);
      });
  });

  describe('fetchComorbidityStatistics Error Handling', () => {
    it('should throw on SQL syntax error', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 409,
          Message: 'SQL Error: Unknown column',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        await expect(fetchComorbidityStatistics(mockConfig)).rejects.toThrow(/409|SQL Error/i);
      });

    it('should handle empty comorbidity data', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 200,
          Message: 'OK',
          data: [],
          field: [],
          field_name: [],
          record_count: 0,
        });

        const result = await fetchComorbidityStatistics(mockConfig);
        expect(result.size).toBe(0);
      });
  });

  describe('Rate Limiting and Throttling', () => {
    it('should handle 429 Too Many Requests', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 429,
          Message: 'Rate limit exceeded. Try again in 60 seconds.',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow(/429|Rate limit/i);
      });
  });

  describe('Service Unavailable', () => {
    it('should handle 503 Service Unavailable', async () => {
        vi.mocked(bmsSession.executeSqlViaApi).mockResolvedValue({
          MessageCode: 503,
          Message: 'Service temporarily unavailable for maintenance',
          data: null,
          field: [],
          field_name: [],
          record_count: 0,
        });

        await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow(/503|unavailable/i);
      });
  });
});
