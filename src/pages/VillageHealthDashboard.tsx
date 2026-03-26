// =============================================================================
// Village Health Population Dashboard - Dashboard Page Component
// =============================================================================

import { useState, useCallback } from 'react';
import { useBmsSession } from '@/hooks/useBmsSession';
import { useVillageHealth } from '@/hooks/useVillageHealth';
import { VillageList } from '@/components/village/VillageList';
import { AppHeader } from '@/components/layout/AppHeader';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import type { VillageHealthData } from '@/types/villageHealth';

export function VillageHealthDashboard() {
  const { config, sessionState, hospitalName, error: sessionError } = useBmsSession();
  const {
    dataState,
    displayedVillages,
    filter,
    sortBy,
    sortOrder,
    error: villageError,
    isLoading,
    refetch,
    refresh,
    setFilter,
    resetFilter,
    setSort,
  } = useVillageHealth(config);

  const [selectedVillage, setSelectedVillage] = useState<VillageHealthData | null>(null);

  // Handle village click
  const handleVillageClick = useCallback((village: VillageHealthData) => {
    setSelectedVillage(village);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Render loading state
  if (sessionState === 'connecting') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" message="กำลังเชื่อมต่อ..." />
      </div>
    );
  }

  // Render session error
  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive mb-2">เกิดข้อผิดพลเชื่อมต่อ</h1>
          <p className="text-gray-600 mb-4">{sessionError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-white"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        hospitalName={hospitalName}
        pageTitle="แดชบอร์์สุขภาพหมู่บ้าน"
        isLoading={isLoading}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Filter and controls section */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="ค้นหาหมู่บ้าน..."
              value={filter.searchQuery}
              onChange={(e) => setFilter({ searchQuery: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={resetFilter}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              รีเต็้มตั้งค่า
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
            >
              รีเฟรชข้อมูล
            </button>
          </div>

          <div className="text-sm text-gray-500">
            {displayedVillages.length} หมู่บ้าน
          </div>
        </div>

        {/* Village list */}
        <VillageList
          villages={displayedVillages}
          isLoading={isLoading}
          error={villageError}
          onRetry={handleRetry}
          onVillageClick={handleVillageClick}
        />

        {/* Selected village detail */}
        {selectedVillage && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold">
              {selectedVillage.village.villageName}
            </h2>
            <pre className="text-sm text-gray-500">
              {JSON.stringify(selectedVillage, null, 2)}
            <button
              onClick={() => setSelectedVillage(null)}
              className="mt-4 rounded-md bg-gray-100 px-3 py-2 text-sm"
            >
              ปิด
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
