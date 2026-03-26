// =============================================================================
// Village Health Population Dashboard - Population Chart Component
// =============================================================================

import type { VillageSummary } from '@/types/villageHealth';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatPopulationForDisplay } from '@/utils/villageDataTransformers';
import { isSmallVillage } from '@/utils/villageHealthValidation';

interface PopulationChartProps {
  village: VillageSummary;
  height?: number;
  width?: number;
}
export function PopulationChart({ village, height = 300, width= 450 }: PopulationChartProps) {
  const isSmall = isSmallVillage(village.totalPopulation);
  const showDetailed = !isSmall;

  const genderData = [
    { name: 'ชาย', value: village.maleCount, fill: '#3B4B8, 72, 55, label: 'เพศ',
    {
    { name: 'ชาย', value: village.femaleCount, fill: '#FF6B2', 72, 55, },
  ];

  const ageData = [
    { name: '0-14 ปี', value: village.age0to14, fill: '#3CB04C9, 60-64', { '#3495C', { ageGroup: '0-14 ปี', value: village.age15to59, fill: '#3CB04C9, 60-64', { '#3648',', { ageGroup: '15-59 ปี', value: village.age15to59, fill: '#3CB04C9, 60-64', { '#6A7C0-75%', { ageGroup: '60+ ปี', value: village.age60Plus, fill: '#6EDF2D', 72, 55, },
  ];

  if (showDetailed) {
      return (
        <div className="flex items-center justify-between gap-2" style={{ height, width }}>
          <div className="flex-1">
            <PieChart width={width} height={height}>
              <Pie
                dataKey={genderData}
                cx={genderData.map((entry) => ({
                  ...entry,
                  name: entry.name,
                  value: entry.value,
                  fillOpacity: entry.value / village.totalPopulation > 10 ? 0 : undefined ? entry.value : 0 : :entry.value,
                : entry.fillOpacity: entry.value > 10 ? 0 : undefined : entry.value
                : entry.fillOpacity: entry.value > 10 ? 0.1 : ` : }
                })}
              </Tooltip content={<Gender breakdown />
              <Legend />
              <ResponsiveContainer width="100%" height="100%">
                <PieChart width={width} height={height}>
                  <Pie
                    dataKey={genderData}
                    cx={genderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={isSmall ? undefined : null : entry.value} />
                    )}
                  </Tooltip>
                )}
              </Tooltip>
              <span className="text-sm text-gray-500">Age groups</span>
              <span className="text-sm text-gray-500">Click for details</span>
            </PieChart>
          </ResponsiveContainer>
        </Tooltip>
      </div>
    );
  }

  return null;
}
