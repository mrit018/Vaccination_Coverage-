// =============================================================================
// Village Health Population Dashboard - Comparison View Component
// =============================================================================
// Side-by-side comparison of selected villages

import type { VillageHealthData } from '@/types/villageHealth';
import { HealthMetrics } from './HealthMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComparisonViewProps {
  villages: VillageHealthData[];
  onRemove?: (villageId: number) => void;
  onClear?: () => void;
  className?: string;
}

interface ComparisonMetric {
  label: string;
  key: keyof ComparisonRow;
  unit?: string;
}

interface ComparisonRow {
  villageId: number;
  villageName: string;
  householdCount: number;
  totalPopulation: number;
  maleCount: number;
  femaleCount: number;
  age0to14: number;
  age15to59: number;
  age60Plus: number;
  dmCount: number;
  htCount: number;
  dmScreeningPercent: number | null;
  htScreeningPercent: number | null;
  eyeComplication: number;
  footComplication: number;
  kidneyComplication: number;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

const COMPARISON_METRICS: ComparisonMetric[] = [
  { label: 'ครัวเรือน', key: 'householdCount' },
  { label: 'ประชากร', key: 'totalPopulation' },
  { label: 'ชาย', key: 'maleCount' },
  { label: 'หญิง', key: 'femaleCount' },
  { label: 'อายุ 0-14', key: 'age0to14' },
  { label: 'อายุ 15-59', key: 'age15to59' },
  { label: 'อายุ 60+', key: 'age60Plus' },
  { label: 'เบาหวาน', key: 'dmCount' },
  { label: 'ความดันโลหิตสูง', key: 'htCount' },
  { label: 'คัดกรอง DM (%)', key: 'dmScreeningPercent' },
  { label: 'คัดกรอง HT (%)', key: 'htScreeningPercent' },
  { label: 'ภาวะแทรกซ้อนตา', key: 'eyeComplication' },
  { label: 'ภาวะแทรกซ้อนเท้า', key: 'footComplication' },
  { label: 'ภาวะแทรกซ้อนไต', key: 'kidneyComplication' },
];

function toComparisonRow(data: VillageHealthData): ComparisonRow {
  const diseaseMap = new Map<string, number>();
  for (const disease of data.diseases) {
    diseaseMap.set(disease.diseaseCode, disease.patientCount);
  }

  return {
    villageId: data.village.villageId,
    villageName: `หมู่ ${data.village.villageMoo} - ${data.village.villageName}`,
    householdCount: data.village.householdCount,
    totalPopulation: data.village.totalPopulation,
    maleCount: data.village.maleCount,
    femaleCount: data.village.femaleCount,
    age0to14: data.village.age0to14,
    age15to59: data.village.age15to59,
    age60Plus: data.village.age60Plus,
    dmCount: diseaseMap.get('001') ?? 0,
    htCount: diseaseMap.get('002') ?? 0,
    dmScreeningPercent: data.screening?.dmCoveragePercent ?? null,
    htScreeningPercent: data.screening?.htCoveragePercent ?? null,
    eyeComplication: data.comorbidities?.eyeComplication ?? 0,
    footComplication: data.comorbidities?.footComplication ?? 0,
    kidneyComplication: data.comorbidities?.kidneyComplication ?? 0,
  };
}

/**
 * Find the best value among villages for highlighting
 */
function getBestValue(rows: ComparisonRow[], key: keyof ComparisonRow): number | null {
  const values = rows
    .map((row) => row[key] as number | null)
    .filter((v): v is number => v !== null);

  if (values.length === 0) return null;

  // For screening percentages, higher is better
  if (key === 'dmScreeningPercent' || key === 'htScreeningPercent') {
    return Math.max(...values);
  }

  // For disease counts, lower is better (for population-targeted interventions)
  if (key === 'dmCount' || key === 'htCount' || key.includes('Complication')) {
    return Math.min(...values);
  }

  // For population metrics, no "best" - just return max
  return Math.max(...values);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ComparisonView({
  villages,
  onRemove,
  onClear,
  className,
}: ComparisonViewProps) {
  if (villages.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-muted-foreground', className)}>
        <ArrowLeftRight className="h-12 w-12 mb-4 opacity-50" />
        <p>เลือกหมู่บ้านที่ต้องการเปรียบเทียบ</p>
        <p className="text-sm">คลิกที่หมู่บ้านหรือใช้ checkbox เพื่อเลือก</p>
      </div>
    );
  }

  const rows = villages.map(toComparisonRow);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          เปรียบเทียบ {villages.length} หมู่บ้าน
        </h3>
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-2" />
            ล้างการเลือก
          </Button>
        )}
      </div>

      {/* Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {villages.map((village, index) => (
          <Card key={village.village.villageId} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">
                  {rows[index].villageName}
                </CardTitle>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onRemove(village.village.villageId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <HealthMetrics
                diseases={village.diseases}
                screening={village.screening}
                compact={false}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ตารางเปรียบเทียบ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">ตัวชี้วัด</th>
                  {rows.map((row) => (
                    <th key={row.villageId} className="text-right py-2 px-3 font-medium">
                      {row.villageName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_METRICS.map((metric) => {
                  const bestValue = getBestValue(rows, metric.key);

                  return (
                    <tr key={metric.key} className="border-b last:border-0">
                      <td className="py-2 px-3 text-muted-foreground">
                        {metric.label}
                      </td>
                      {rows.map((row) => {
                        const value = row[metric.key];
                        const isBest = value === bestValue && bestValue !== null;

                        return (
                          <td
                            key={row.villageId}
                            className={cn(
                              'text-right py-2 px-3 font-mono',
                              isBest && 'text-green-600 font-semibold'
                            )}
                          >
                            {value === null ? '-' : typeof value === 'number' ? value.toLocaleString() : value}
                            {metric.unit && ` ${metric.unit}`}
                            {isBest && <span className="ml-1">★</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
