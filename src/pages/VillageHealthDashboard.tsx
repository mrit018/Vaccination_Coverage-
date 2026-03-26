// =============================================================================
// Village Health Population Dashboard - Dashboard Page Component
// =============================================================================

import { useState, useCallback } from 'react';
import { useBmsSessionContext } from '@/contexts/BmsSessionContext';
import { useVillageHealth } from '@/hooks/useVillageHealth';
import { VillageList } from '@/components/village/VillageList';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import type { VillageHealthData } from '@/types/villageHealth';

export default function VillageHealthDashboard() {
  const { session, sessionState, connectionConfig, error: sessionError } = useBmsSessionContext();
  const {
    displayedVillages,
    filter,
    error: villageError,
    isLoading,
    refetch,
    refresh,
    setFilter,
    resetFilter,
  } = useVillageHealth(connectionConfig);

  const [selectedVillage, setSelectedVillage] = useState<VillageHealthData | null>(null);

  // Handle village click
  const handleVillageClick = useCallback((village: VillageHealthData) => {
    setSelectedVillage(village);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

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
          <h1 className="text-xl font-semibold text-red-600 mb-2">เกิดข้อผิดพลาดในการเชื่อมต่อ</h1>
          <p className="text-gray-600 mb-4">{sessionError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white border-b px-6 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {session?.hospitalName || 'แดชบอร์ดสุขภาพหมู่บ้าน'}
          </h1>
          <p className="text-xs text-gray-500">ข้อมูลประชากรและสุขภาพหมู่บ้าน</p>
        </div>
        {isLoading && (
          <span className="text-sm text-blue-600">กำลังโหลด...</span>
        )}
      </header>

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
              รีเซ็ตตั้งค่า
            </button>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
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
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">
                {selectedVillage.village.villageName}
              </h2>
              <button
                onClick={() => setSelectedVillage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ปิด
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">หมู่</p>
                <p className="font-medium">{selectedVillage.village.villageMoo}</p>
              </div>
              <div>
                <p className="text-gray-500">ประชากร</p>
                <p className="font-medium">{selectedVillage.village.totalPopulation}</p>
              </div>
              <div>
                <p className="text-gray-500">ครัวเรือน</p>
                <p className="font-medium">{selectedVillage.village.householdCount}</p>
              </div>
              <div>
                <p className="text-gray-500">โรคเรื้อรัง</p>
                <p className="font-medium">
                  {selectedVillage.diseases.reduce((sum, d) => sum + d.patientCount, 0)} คน
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
