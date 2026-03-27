// =============================================================================
// Village Health Population Dashboard - Export Utilities
// =============================================================================
// Export village health data to CSV format

import type { VillageHealthData } from '@/types/villageHealth';
import { DISEASE_CODE_MAP } from '@/types/villageHealth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExportOptions {
  includeDiseases?: boolean;
  includeScreening?: boolean;
  includeComorbidities?: boolean;
  fileName?: string;
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

/**
 * Convert village health data to CSV string
 */
export function villagesToCSV(
  villages: VillageHealthData[],
  options: ExportOptions = {},
): string {
  const {
    includeDiseases = true,
    includeScreening = true,
    includeComorbidities = true,
  } = options;

  // Build headers
  const headers = [
    'หมู่ที่',
    'หมู่บ้าน',
    'ครัวเรือน',
    'ประชากร',
    'ชาย',
    'หญิง',
    'อายุ 0-14',
    'อายุ 15-59',
    'อายุ 60+',
    'นอกเขต',
  ];

  if (includeDiseases) {
    headers.push(
      ...Object.values(DISEASE_CODE_MAP).map((name) => `${name}`),
    );
  }

  if (includeScreening) {
    headers.push('คัดกรอง DM (%)', 'คัดกรอง HT (%)');
  }

  if (includeComorbidities) {
    headers.push(
      'ภาวะแทรกซ้อนตา',
      'ภาวะแทรกซ้อนเท้า',
      'ภาวะแทรกซ้อนไต',
      'ภาวะแทรกซ้อนหัวใจ',
      'ภาวะแทรกซ้อนสมอง',
      'ภาวะแทรกซ้อนหลอดเลือด',
      'ภาวะแทรกซ้อนช่องปาก',
    );
  }

  // Build rows
  const rows = villages.map((data) => {
    const { village, diseases, screening, comorbidities } = data;

    const diseaseMap = new Map<string, number>();
    for (const disease of diseases) {
      diseaseMap.set(disease.diseaseCode, disease.patientCount);
    }

    const row = [
      village.villageMoo,
      village.villageName,
      village.householdCount,
      village.totalPopulation,
      village.maleCount,
      village.femaleCount,
      village.age0to14,
      village.age15to59,
      village.age60Plus,
      village.isOutOfArea ? 'ใช่' : 'ไม่ใช่',
    ];

    if (includeDiseases) {
      row.push(
        ...Object.keys(DISEASE_CODE_MAP).map((code) => diseaseMap.get(code) ?? 0),
      );
    }

    if (includeScreening) {
      row.push(
        screening?.dmCoveragePercent?.toFixed(2) ?? '-',
        screening?.htCoveragePercent?.toFixed(2) ?? '-',
      );
    }

    if (includeComorbidities) {
      row.push(
        comorbidities?.eyeComplication ?? 0,
        comorbidities?.footComplication ?? 0,
        comorbidities?.kidneyComplication ?? 0,
        comorbidities?.cardiovascularComplication ?? 0,
        comorbidities?.cerebrovascularComplication ?? 0,
        comorbidities?.peripheralVascularComplication ?? 0,
        comorbidities?.dentalComplication ?? 0,
      );
    }

    return row;
  });

  // Convert to CSV string
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Escape a value for CSV format
 */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // If contains comma, quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Trigger CSV file download
 */
export function downloadCSV(
  villages: VillageHealthData[],
  options: ExportOptions = {},
): void {
  const {
    fileName = `village-health-${new Date().toISOString().split('T')[0]}.csv`,
  } = options;

  const csvContent = villagesToCSV(villages, options);

  // Add UTF-8 BOM for Excel compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// JSON Export
// ---------------------------------------------------------------------------

/**
 * Export villages as JSON for API integration
 */
export function villagesToJSON(villages: VillageHealthData[]): string {
  return JSON.stringify(villages, null, 2);
}

/**
 * Download villages as JSON file
 */
export function downloadJSON(
  villages: VillageHealthData[],
  fileName: string = `village-health-${new Date().toISOString().split('T')[0]}.json`,
): void {
  const jsonContent = villagesToJSON(villages);
  const blob = new Blob([jsonContent], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Print Support
// ---------------------------------------------------------------------------

/**
 * Trigger browser print dialog for village health report
 */
export function printVillageReport(): void {
  window.print();
}

/**
 * Get CSS class for print-friendly styling
 */
export function getPrintClass(): string {
  return 'print:village-report';
}
