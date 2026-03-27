// =============================================================================
// Village Health Population Dashboard - Dashboard Page Component
// =============================================================================

import { useState, useCallback, useMemo } from 'react';
import { useBmsSessionContext } from '@/contexts/BmsSessionContext';
import { useVillageHealth } from '@/hooks/useVillageHealth';
import { VillageList } from '@/components/village/VillageList';
import { VillageTable } from '@/components/village/VillageTable';
import { ComparisonView } from '@/components/village/ComparisonView';
import { VillageDetail } from '@/components/village/VillageDetail';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { downloadCSV } from '@/utils/villageExport';
import type { VillageHealthData } from '@/types/villageHealth';
import { LayoutGrid, Table, GitCompare, Download } from 'lucide-react';

type ViewMode = 'cards' | 'table' | 'comparison';

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

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedVillage, setSelectedVillage] = useState<VillageHealthData | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<number>>(new Set());

  // Handle village click
  const handleVillageClick = useCallback((village: VillageHealthData) => {
    setSelectedVillage(village);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Remove village from comparison
  const handleRemoveFromComparison = useCallback((villageId: number) => {
    setSelectedForComparison((prev) => {
      const newSet = new Set(prev);
      newSet.delete(villageId);
      return newSet;
    });
  }, []);

  // Clear all comparison selections
  const clearComparisonSelection = useCallback(() => {
    setSelectedForComparison(new Set());
  }, []);

  // Get villages selected for comparison
  const comparisonVillages = useMemo(() => {
    return displayedVillages.filter((v) => selectedForComparison.has(v.village.villageId));
  }, [displayedVillages, selectedForComparison]);

  // Handle export
  const handleExport = useCallback((selectedIds?: number[]) => {
    const villagesToExport = selectedIds
      ? displayedVillages.filter((v) => selectedIds.includes(v.village.villageId))
      : displayedVillages;

    downloadCSV(villagesToExport, {
      includeDiseases: true,
      includeScreening: true,
      includeComorbidities: true,
    });
  }, [displayedVillages]);

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

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm border-l border-gray-300 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                title="มุมมองตาราง"
              >
                <Table className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-2 text-sm border-l border-gray-300 ${viewMode === 'comparison' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                title="เปรียบเทียบ"
              >
                <GitCompare className="h-4 w-4" />
              </button>
            </div>

            {/* Export button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport()}
            >
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>

            <div className="text-sm text-gray-500">
              {displayedVillages.length} หมู่บ้าน
              {selectedForComparison.size > 0 && ` | เลือก ${selectedForComparison.size}`}
            </div>
          </div>
        </div>

        {/* Main content based on view mode */}
        {viewMode === 'cards' && (
          <VillageList
            villages={displayedVillages}
            isLoading={isLoading}
            error={villageError}
            onRetry={handleRetry}
            onVillageClick={handleVillageClick}
            showDetails={true}
          />
        )}

        {viewMode === 'table' && !isLoading && !villageError && (
          <VillageTable
            data={displayedVillages}
            onVillageSelect={handleVillageClick}
            onExport={handleExport}
          />
        )}

        {viewMode === 'table' && isLoading && (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" message="กำลังโหลดข้อมูล..." />
          </div>
        )}

        {viewMode === 'table' && villageError && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
              {villageError.message}
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              ลองอีกครั้ง
            </button>
          </div>
        )}

        {viewMode === 'comparison' && (
          <ComparisonView
            villages={comparisonVillages}
            onRemove={handleRemoveFromComparison}
            onClear={clearComparisonSelection}
          />
        )}

        {/* Village selection hint for comparison mode */}
        {viewMode !== 'comparison' && selectedForComparison.size === 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            💡 เคล็ดลับ: เปลี่ยนเป็นมุมมองตารางเพื่อเลือกหมู่บ้านสำหรับเปรียบเทียบ
          </div>
        )}

        {/* Selected village detail */}
        {selectedVillage && (
          <div className="mt-6">
            <VillageDetail
              data={selectedVillage}
              defaultExpanded={true}
            />
          </div>
        )}
      </main>
    </div>
  );
}
