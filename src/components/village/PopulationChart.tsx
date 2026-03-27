// =============================================================================
// Village Health Population Dashboard - Population Chart Component
// =============================================================================

import { useMemo } from 'react';
import type { VillageSummary } from '@/types/villageHealth';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { isSmallVillage } from '@/utils/villageHealthValidation';

interface PopulationChartProps {
  village: VillageSummary;
  height?: number;
}

const GENDER_COLORS = ['#3B82F6', '#EC4899']; // Blue for male, Pink for female
const AGE_COLORS = ['#22C55E', '#3B82F6', '#F59E0B']; // Green, Blue, Amber

export function PopulationChart({ village, height = 200 }: PopulationChartProps) {
  const isSmall = isSmallVillage(village.totalPopulation);

  // Memoize chart data transformations (T059)
  const genderData = useMemo(() => [
    { name: 'ชาย', value: village.maleCount },
    { name: 'หญิง', value: village.femaleCount },
  ], [village.maleCount, village.femaleCount]);

  const ageData = useMemo(() => [
    { name: '0-14 ปี', value: village.age0to14 },
    { name: '15-59 ปี', value: village.age15to59 },
    { name: '60+ ปี', value: village.age60Plus },
  ], [village.age0to14, village.age15to59, village.age60Plus]);

  // Don't show detailed charts for small villages (privacy protection)
  if (isSmall) {
    return (
      <div
        className="flex items-center justify-center p-4 text-gray-500 text-sm"
        style={{ height }}
        role="img"
        aria-label="ข้อมูลน้อยเกินไป ไม่สามารถแสดงกราฟได้"
      >
        <p>ข้อมูลน้อยเกินไป ไม่สามารถแสดงกราฟได้</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4" style={{ height }}>
      {/* Gender Distribution Pie Chart */}
      <div>
        <p className="text-xs text-gray-500 text-center mb-2">การกระจายเพศ</p>
        <ResponsiveContainer width="100%" height={height - 30}>
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
            >
              {genderData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={GENDER_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} คน`, '']} />
            <Legend
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Age Distribution Bar Chart */}
      <div>
        <p className="text-xs text-gray-500 text-center mb-2">กลุ่มอายุ</p>
        <ResponsiveContainer width="100%" height={height - 30}>
          <BarChart data={ageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => [`${value} คน`, '']} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {ageData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={AGE_COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
