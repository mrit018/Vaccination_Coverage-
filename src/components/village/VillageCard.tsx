// =============================================================================
// Village Health Population Dashboard - Village Card Component
// =============================================================================

import type { VillageHealthData, DiseaseStatistics } from '@/types/villageHealth';
import { DISEASE_CODE_MAP } from '@/types/villageHealth';
import { isSmallVillage } from '@/utils/villageHealthValidation';
import { getVillageDisplayLabel, formatPopulationForDisplay } from '@/utils/villageDataTransformers';
import { HealthMetrics } from './HealthMetrics';

interface VillageCardProps {
  data: VillageHealthData;
  onClick?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
  className?: string;
}

/**
 * Get top N diseases by patient count
 */
function getTopDiseases(diseases: DiseaseStatistics[], limit: number = 3): DiseaseStatistics[] {
  return [...diseases]
    .filter((d) => d.patientCount > 0)
    .sort((a, b) => b.patientCount - a.patientCount)
    .slice(0, limit);
}

export function VillageCard({
  data,
  onClick,
  onExpand,
  isExpanded = false,
  className = '',
}: VillageCardProps) {
  const { village, diseases, screening } = data;
  const isSmall = isSmallVillage(village.totalPopulation);
  const displayLabel = getVillageDisplayLabel(village);
  const topDiseases = getTopDiseases(diseases);

  return (
    <div
      className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
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

      {/* Disease Summary Badges - T037 */}
      {topDiseases.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">โรคเรื้อรัง</p>
          <div className="flex flex-wrap gap-1.5">
            {topDiseases.map((disease) => (
              <span
                key={disease.diseaseCode}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"
              >
                {DISEASE_CODE_MAP[disease.diseaseCode]}
                <span className="bg-red-100 px-1.5 py-0.5 rounded-full">
                  {disease.patientCount}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Health Metrics Summary - Compact view */}
      {diseases.length > 0 && (
        <div className="mt-3">
          <HealthMetrics
            diseases={diseases}
            screening={screening}
            compact
          />
        </div>
      )}

      {/* Expand button for details */}
      {onExpand && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="mt-3 w-full text-center text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}
        </button>
      )}
    </div>
  );
}
