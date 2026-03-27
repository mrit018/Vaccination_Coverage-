// =============================================================================
// Unit Tests for Village Formatters
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatPercent,
  formatPopulation,
  formatHousehold,
  formatPatientCount,
  toBEYear,
  toGregorianYear,
  formatThaiDate,
  formatShortThaiDate,
  formatRelativeTime,
  formatVillageName,
  formatAgeGroup,
  formatGenderSummary,
  truncateThaiText,
  getCoverageStatusLabel,
  getCoverageColorClass,
  formatExportTimestamp,
  generateExportFilename,
} from '@/utils/villageFormatters';

// ---------------------------------------------------------------------------
// Thai Number Formatting Tests
// ---------------------------------------------------------------------------

describe('formatNumber', () => {
  it('should format numbers with Thai locale (commas for thousands)', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });
});

describe('formatPercent', () => {
  it('should format percentage with default 1 decimal', () => {
    expect(formatPercent(75.5)).toBe('75.5%');
    expect(formatPercent(100)).toBe('100.0%');
  });

  it('should format percentage with custom decimals', () => {
    expect(formatPercent(75.555, 2)).toBe('75.56%');
    expect(formatPercent(75.555, 0)).toBe('76%');
  });

  it('should return dash for null/undefined values', () => {
    expect(formatPercent(null)).toBe('-');
    expect(formatPercent(undefined)).toBe('-');
  });
});

describe('formatPopulation', () => {
  it('should return "0" for zero population', () => {
    expect(formatPopulation(0)).toBe('0');
  });

  it('should return "ข้อมูลน้อยเกินไป" for population less than 10', () => {
    expect(formatPopulation(5)).toBe('ข้อมูลน้อยเกินไป');
    expect(formatPopulation(9)).toBe('ข้อมูลน้อยเกินไป');
  });

  it('should format population with commas for 10 or more', () => {
    expect(formatPopulation(10)).toBe('10');
    expect(formatPopulation(1000)).toBe('1,000');
  });
});

describe('formatHousehold', () => {
  it('should format household count with Thai suffix', () => {
    expect(formatHousehold(100)).toBe('100 ครัวเรือน');
    expect(formatHousehold(1500)).toBe('1,500 ครัวเรือน');
  });
});

describe('formatPatientCount', () => {
  it('should return "ไม่มีผู้ป่วย" for zero count', () => {
    expect(formatPatientCount(0)).toBe('ไม่มีผู้ป่วย');
  });

  it('should format patient count with Thai suffix', () => {
    expect(formatPatientCount(25)).toBe('25 คน');
  });

  it('should include disease name when provided', () => {
    expect(formatPatientCount(25, 'เบาหวาน')).toBe('25 คน (เบาหวาน)');
  });
});

// ---------------------------------------------------------------------------
// Thai Date Formatting Tests
// ---------------------------------------------------------------------------

describe('toBEYear', () => {
  it('should convert Gregorian year to Buddhist Era year', () => {
    expect(toBEYear(2024)).toBe(2567);
    expect(toBEYear(2000)).toBe(2543);
  });
});

describe('toGregorianYear', () => {
  it('should convert Buddhist Era year to Gregorian year', () => {
    expect(toGregorianYear(2567)).toBe(2024);
    expect(toGregorianYear(2543)).toBe(2000);
  });
});

describe('formatThaiDate', () => {
  it('should format date with Thai month names and BE year', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    expect(formatThaiDate(date)).toBe('15 มกราคม 2567');
  });

  it('should include time when requested', () => {
    const date = new Date(2024, 0, 15, 14, 30);
    expect(formatThaiDate(date, true)).toBe('15 มกราคม 2567 14:30 น.');
  });

  it('should handle string dates', () => {
    expect(formatThaiDate('2024-01-15')).toBe('15 มกราคม 2567');
  });

  it('should return dash for null/undefined dates', () => {
    expect(formatThaiDate(null)).toBe('-');
    expect(formatThaiDate(undefined)).toBe('-');
  });

  it('should return dash for invalid dates', () => {
    expect(formatThaiDate('invalid')).toBe('-');
  });
});

describe('formatShortThaiDate', () => {
  it('should format date as d/m/BE year', () => {
    const date = new Date(2024, 0, 15);
    expect(formatShortThaiDate(date)).toBe('15/01/2567');
  });

  it('should pad single digits', () => {
    const date = new Date(2024, 0, 5);
    expect(formatShortThaiDate(date)).toBe('05/01/2567');
  });

  it('should return dash for null/undefined', () => {
    expect(formatShortThaiDate(null)).toBe('-');
  });
});

describe('formatRelativeTime', () => {
  it('should return "เมื่อสักครู่" for less than 60 seconds', () => {
    const date = new Date(Date.now() - 30000);
    expect(formatRelativeTime(date)).toBe('เมื่อสักครู่');
  });

  it('should return minutes for less than 60 minutes', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('5 นาทีที่แล้ว');
  });

  it('should return hours for less than 24 hours', () => {
    const date = new Date(Date.now() - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('5 ชั่วโมงที่แล้ว');
  });

  it('should return days for less than 7 days', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('3 วันที่แล้ว');
  });

  it('should return weeks for less than 4 weeks', () => {
    const date = new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('2 สัปดาห์ที่แล้ว');
  });

  it('should return months for less than 12 months', () => {
    const date = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('6 เดือนที่แล้ว');
  });

  it('should return years for 12+ months', () => {
    const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe('2 ปีที่แล้ว');
  });

  it('should return dash for null/undefined', () => {
    expect(formatRelativeTime(null)).toBe('-');
  });
});

// ---------------------------------------------------------------------------
// Thai Text Formatting Tests
// ---------------------------------------------------------------------------

describe('formatVillageName', () => {
  it('should format village name with moo number', () => {
    expect(formatVillageName('1', 'บ้านสมใจ')).toBe('หมู่ 1 - บ้านสมใจ');
  });

  it('should mark village moo 0 as out of area', () => {
    expect(formatVillageName('0', 'บ้านนอกเขต')).toBe('บ้านนอกเขต (นอกเขต)');
  });
});

describe('formatAgeGroup', () => {
  it('should format age range', () => {
    expect(formatAgeGroup(15, 59)).toBe('15-59 ปี');
  });

  it('should format open-ended age group', () => {
    expect(formatAgeGroup(60, null)).toBe('60+ ปี');
  });
});

describe('formatGenderSummary', () => {
  it('should format male and female counts', () => {
    expect(formatGenderSummary(150, 200)).toBe('ชาย 150 | หญิง 200');
  });

  it('should format with commas for large numbers', () => {
    expect(formatGenderSummary(1500, 2000)).toBe('ชาย 1,500 | หญิง 2,000');
  });
});

describe('truncateThaiText', () => {
  it('should not truncate short text', () => {
    expect(truncateThaiText('สั้น', 10)).toBe('สั้น');
  });

  it('should truncate long text with ellipsis', () => {
    // maxLength=10, so we keep 9 chars + 1 ellipsis
    expect(truncateThaiText('ข้อความยาวมากๆ', 10)).toBe('ข้อความยา…');
  });

  it('should handle exact length text', () => {
    expect(truncateThaiText('ทดสอบ', 6)).toBe('ทดสอบ');
  });
});

// ---------------------------------------------------------------------------
// Screening Coverage Formatting Tests
// ---------------------------------------------------------------------------

describe('getCoverageStatusLabel', () => {
  it('should return "ครอบคลุม" for 80% or higher', () => {
    expect(getCoverageStatusLabel(80)).toBe('ครอบคลุม');
    expect(getCoverageStatusLabel(95)).toBe('ครอบคลุม');
  });

  it('should return "ปานกลาง" for 60-79%', () => {
    expect(getCoverageStatusLabel(60)).toBe('ปานกลาง');
    expect(getCoverageStatusLabel(79.9)).toBe('ปานกลาง');
  });

  it('should return "ต้องปรับปรุง" for below 60%', () => {
    expect(getCoverageStatusLabel(59)).toBe('ต้องปรับปรุง');
    expect(getCoverageStatusLabel(0)).toBe('ต้องปรับปรุง');
  });

  it('should return "ไม่มีข้อมูล" for null/undefined', () => {
    expect(getCoverageStatusLabel(null)).toBe('ไม่มีข้อมูล');
    expect(getCoverageStatusLabel(undefined)).toBe('ไม่มีข้อมูล');
  });
});

describe('getCoverageColorClass', () => {
  it('should return green class for 80% or higher', () => {
    expect(getCoverageColorClass(80)).toBe('text-green-600');
  });

  it('should return yellow class for 60-79%', () => {
    expect(getCoverageColorClass(65)).toBe('text-yellow-600');
  });

  it('should return red class for below 60%', () => {
    expect(getCoverageColorClass(50)).toBe('text-red-600');
  });

  it('should return gray class for null/undefined', () => {
    expect(getCoverageColorClass(null)).toBe('text-gray-500');
  });
});

// ---------------------------------------------------------------------------
// Export Summary Formatter Tests
// ---------------------------------------------------------------------------

describe('formatExportTimestamp', () => {
  it('should format timestamp with BE year', () => {
    // Mock current date
    const originalDate = Date;
    const mockDate = new Date(2024, 0, 15, 14, 30); // Jan 15, 2024, 14:30
    global.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
    } as typeof Date;

    expect(formatExportTimestamp()).toBe('25670115_1430');

    global.Date = originalDate;
  });
});

describe('generateExportFilename', () => {
  it('should generate filename with prefix', () => {
    const filename = generateExportFilename('village-report');
    expect(filename).toMatch(/^village-report_\d+_\d+\.csv$/);
  });

  it('should use default prefix when not provided', () => {
    const filename = generateExportFilename();
    expect(filename).toMatch(/^village-health_\d+_\d+\.csv$/);
  });
});
