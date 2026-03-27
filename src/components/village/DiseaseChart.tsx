// =============================================================================
// Village Health Population Dashboard - DiseaseChart Component
// =============================================================================
// Bar chart showing disease counts across villages using Recharts

import { useMemo } from 'react';
import type { VillageSummary } from '@/types/villageHealth';
import { DISEASE_CODE_MAP } from '@/types/villageHealth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DiseaseChartProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
}

interface ChartDataPoint {
  villageName: string;
  villageMoo: string;
  [diseaseCode: string]: string | number;
}

interface DiseaseStatistics {
  diseaseCode: string;
  patientCount: number;
}

// ---------------------------------------------------------------------------
// Chart Colors
// ---------------------------------------------------------------------------

const DISEASE_COLORS: Record<string, string> = {
  '001': '#ef4444', // DM - Red
  '002': '#f97316', // HT - Orange
  '003': '#eab308', // COPD - Yellow
  '004': '#84cc16', // Asthma - Lime
  '005': '#22c55e', // TB - Green
  '006': '#14b8a6', // CKD - Teal
  '007': '#8b5cf6', // Cancer - Purple
  '008': '#ec4899', // Psychiatry - Pink
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Transform disease statistics into chart-ready format
 */
export function prepareChartData(
  villages: VillageSummary[],
  allDiseaseStats: Map<number, DiseaseStatistics[]>,
): ChartDataPoint[] {
  return villages.map((village) => {
    const diseases = allDiseaseStats.get(village.villageId) || [];
    const dataPoint: ChartDataPoint = {
      villageName: village.villageName,
      villageMoo: village.villageMoo,
    };

    // Add counts for each disease
    for (const disease of diseases) {
      dataPoint[disease.diseaseCode] = disease.patientCount;
    }

    // Ensure all disease codes are present
    const allCodes = Object.keys(DISEASE_CODE_MAP) as (keyof typeof DISEASE_CODE_MAP)[];
    for (const code of allCodes) {
      if (dataPoint[code] === undefined) {
        dataPoint[code] = 0;
      }
    }

    return dataPoint;
  });
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) {
    return null;
  }

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {DISEASE_CODE_MAP[entry.name as keyof typeof DISEASE_CODE_MAP] || entry.name}:
          </span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DiseaseChart({
  data,
  title = 'สถิติโรคเรื้อรังแยกตามหมู่บ้าน',
  height = 400,
}: DiseaseChartProps) {
  // Memoize disease codes list (T059)
  const diseaseCodes = useMemo(
    () => Object.keys(DISEASE_CODE_MAP),
    []
  );

  // Memoize sorted data for consistent rendering (T059)
  const sortedData = useMemo(
    () => [...data].sort((a, b) => {
      const aMoo = parseInt(a.villageMoo, 10) || 999;
      const bMoo = parseInt(b.villageMoo, 10) || 999;
      return aMoo - bMoo;
    }),
    [data]
  );

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center h-[200px] text-muted-foreground"
            role="img"
            aria-label="ไม่มีข้อมูลสถิติโรค"
          >
            ไม่มีข้อมูลสถิติโรค
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="villageName"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) =>
                DISEASE_CODE_MAP[value as keyof typeof DISEASE_CODE_MAP] || value
              }
            />
            {diseaseCodes.map((code) => (
              <Bar
                key={code}
                dataKey={code}
                fill={DISEASE_COLORS[code]}
                name={code}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
