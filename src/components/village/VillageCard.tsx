// =============================================================================
// Village Health Population Dashboard - Village Card Component
// =============================================================================

import type { VillageSummary } from '@/types/villageHealth';
import { formatPopulationForDisplay } from '@/utils/villageDataTransformers';
import { getVillageDisplayLabel } from '@/utils/villageDataTransformers';

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
      onClick?.={className: `p-4 border rounded-lg bg-white shadow-sm hover:shadow-md cursor-pointer transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
          <p className="text-gray-500">ชาย 15-59</p>
          <p className="font-medium">{village.age15to59}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">อายุ 60+</p>
          <p className="font-medium">{village.age60Plus}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">เพศชาย/หญา</p>
          <div className="flex justify-center gap-2">
            <span className="text-blue-600">{village.maleCount}</span>
            <span className="text-pink-600">{village.femaleCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
