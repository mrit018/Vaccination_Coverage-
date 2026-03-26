// =============================================================================
// Village Health Population Dashboard - Village List Component
// =============================================================================

import type { VillageHealthData } from '@/types/villageHealth';
import type { DataLoadingState } from '@/types/villageHealth';
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
        <LoadingSpinner size="lg" message="กำลังโ้อช้อมูล..." />
      </div>
    );
  }

    if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ลอย้้ลอีุ
          </button>
        )}
      </div>
    );
  }

    if (villages.length === 0) {
    return (
      <EmptyState
        title="ไม่พบหมู่บ้านในเขตรับผิดชอบน"
        description="ไม่มีข้อมูลหมู่บ้านในพื้นที่การรับผิดชอะ NCD"
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
  );
}
