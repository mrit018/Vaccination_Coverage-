// =============================================================================
// Village Health Population Dashboard - Village Card Component
// =============================================================================

import type { VillageSummary } from '@/types/villageHealth';
import { isSmallVillage } from '@/utils/villageHealthValidation';
import { getVillageDisplayLabel, formatPopulationForDisplay } from '@/utils/villageDataTransformers';

interface VillageCardProps {
  village: VillageSummary;
  onClick?: () => void;
  className?: string;
}

export function VillageCard({ village, onClick, className = '' }: VillageCardProps) {
  const isSmall = isSmallVillage(village.totalPopulation);
  const displayLabel = getVillageDisplayLabel(village);

  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {displayLabel}
        </h3>
        {village.isOutOfArea && (
          <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">
            นอกเขต
          </span>
        )}
      </div>

      {/* Population info */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">ประชากร</p>
          <p className={`text-2xl font-bold ${isSmall ? 'text-gray-400' : 'text-gray-900'}`}>
            {formatPopulationForDisplay(village.totalPopulation, isSmall)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">ครัวเรือน</p>
          <p className="text-2xl font-bold text-gray-900">
            {village.householdCount}
          </p>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-gray-600">
        <div className="text-center">
          <p className="text-gray-500">อายุ 0-14</p>
          <p className="font-medium">{village.age0to14}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">อายุ 15-59</p>
          <p className="font-medium">{village.age15to59}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">อายุ 60+</p>
          <p className="font-medium">{village.age60Plus}</p>
        </div>
      </div>

      {/* Gender distribution */}
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <span className="text-blue-600">ชาย {village.maleCount}</span>
        <span className="text-pink-600">หญิง {village.femaleCount}</span>
      </div>
    </div>
  );
}
