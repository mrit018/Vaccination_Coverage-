// =============================================================================
// Village Health Population Dashboard - Village List Component
// =============================================================================

import type { VillageHealthData } from '@/types/villageHealth';
import { VillageCard } from './VillageCard';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { EmptyState } from '@/components/dashboard/EmptyState';

interface VillageListProps {
  villages: VillageHealthData[];
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  onVillageClick?: (village: VillageHealthData) => void;
}

export function VillageList({
  villages,
  isLoading,
  error,
  onRetry,
  onVillageClick,
}: VillageListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" message="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          {error.message}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            ลองอีกครั้ง
          </button>
        )}
      </div>
    );
  }

  if (villages.length === 0) {
    return (
      <EmptyState
        title="ไม่พบหมู่บ้าน"
        description="ไม่มีข้อมูลหมู่บ้านในเขตรับผิดชอบ"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {villages.map((village) => (
        <VillageCard
          key={village.village.villageId}
          village={village.village}
          onClick={() => onVillageClick?.(village)}
        />
      ))}
    </div>
  );
}
