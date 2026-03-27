// =============================================================================
// Village Health Population Dashboard - Thai Language Formatters
// =============================================================================
// Proper number/date formatting for Thai locale

// ---------------------------------------------------------------------------
// Thai Number Formatting
// ---------------------------------------------------------------------------

/**
 * Format a number with Thai locale (commas for thousands)
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('th-TH');
}

/**
 * Format a number as percentage with Thai locale
 */
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format population count with Thai locale
 */
export function formatPopulation(count: number): string {
  if (count === 0) return '0';
  if (count < 10) return 'ข้อมูลน้อยเกินไป';
  return formatNumber(count);
}

/**
 * Format household count with Thai locale
 */
export function formatHousehold(count: number): string {
  return `${formatNumber(count)} ครัวเรือน`;
}

/**
 * Format patient count with disease context
 */
export function formatPatientCount(count: number, diseaseName?: string): string {
  if (count === 0) return 'ไม่มีผู้ป่วย';
  return `${formatNumber(count)} คน${diseaseName ? ` (${diseaseName})` : ''}`;
}

// ---------------------------------------------------------------------------
// Thai Date Formatting
// ---------------------------------------------------------------------------

// Thai Buddhist Era year offset
const BE_YEAR_OFFSET = 543;

/**
 * Convert Gregorian year to Buddhist Era year
 */
export function toBEYear(year: number): number {
  return year + BE_YEAR_OFFSET;
}

/**
 * Convert Buddhist Era year to Gregorian year
 */
export function toGregorianYear(beYear: number): number {
  return beYear - BE_YEAR_OFFSET;
}

/**
 * Format a date in Thai format with Buddhist Era year
 * @param date - Date to format
 * @param includeTime - Whether to include time
 */
export function formatThaiDate(date: Date | string | null | undefined, includeTime: boolean = false): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  const day = d.getDate();
  const month = d.getMonth();
  const beYear = toBEYear(d.getFullYear());

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const base = `${day} ${thaiMonths[month]} ${beYear}`;

  if (includeTime) {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${base} ${hours}:${minutes} น.`;
  }

  return base;
}

/**
 * Format a date in short Thai format (d/m/BE year)
 */
export function formatShortThaiDate(date: Date | string | null | undefined): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const beYear = toBEYear(d.getFullYear());

  return `${day}/${month}/${beYear}`;
}

/**
 * Format relative time in Thai (e.g., "2 วันที่แล้ว")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'เมื่อสักครู่';
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffWeeks < 4) return `${diffWeeks} สัปดาห์ที่แล้ว`;
  if (diffMonths < 12) return `${diffMonths} เดือนที่แล้ว`;
  return `${diffYears} ปีที่แล้ว`;
}

// ---------------------------------------------------------------------------
// Thai Text Formatting
// ---------------------------------------------------------------------------

/**
 * Format village name with moo number
 */
export function formatVillageName(villageMoo: string, villageName: string): string {
  if (villageMoo === '0') {
    return `${villageName} (นอกเขต)`;
  }
  return `หมู่ ${villageMoo} - ${villageName}`;
}

/**
 * Format age group label in Thai
 */
export function formatAgeGroup(minAge: number, maxAge: number | null): string {
  if (maxAge === null) {
    return `${minAge}+ ปี`;
  }
  return `${minAge}-${maxAge} ปี`;
}

/**
 * Format gender count with Thai labels
 */
export function formatGenderSummary(maleCount: number, femaleCount: number): string {
  return `ชาย ${formatNumber(maleCount)} | หญิง ${formatNumber(femaleCount)}`;
}

/**
 * Truncate text with ellipsis for Thai text
 */
export function truncateThaiText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + '…';
}

// ---------------------------------------------------------------------------
// Screening Coverage Formatting
// ---------------------------------------------------------------------------

/**
 * Get screening coverage status label in Thai
 */
export function getCoverageStatusLabel(percent: number | null | undefined): string {
  if (percent === null || percent === undefined) return 'ไม่มีข้อมูล';
  if (percent >= 80) return 'ครอบคลุม';
  if (percent >= 60) return 'ปานกลาง';
  return 'ต้องปรับปรุง';
}

/**
 * Get screening coverage color class
 */
export function getCoverageColorClass(percent: number | null | undefined): string {
  if (percent === null || percent === undefined) return 'text-gray-500';
  if (percent >= 80) return 'text-green-600';
  if (percent >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

// ---------------------------------------------------------------------------
// Export Summary Formatter
// ---------------------------------------------------------------------------

/**
 * Format export timestamp for filename
 */
export function formatExportTimestamp(): string {
  const now = new Date();
  const year = toBEYear(now.getFullYear());
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}`;
}

/**
 * Generate export filename with Thai context
 */
export function generateExportFilename(prefix: string = 'village-health'): string {
  return `${prefix}_${formatExportTimestamp()}.csv`;
}
