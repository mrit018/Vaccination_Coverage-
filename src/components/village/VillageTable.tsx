// =============================================================================
// Village Health Population Dashboard - VillageTable Component
// =============================================================================
// Sortable/filterable table using TanStack Table v8

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { SortingState, ColumnFiltersState } from '@tanstack/react-table';
import type { VillageHealthData } from '@/types/villageHealth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VillageTableProps {
  data: VillageHealthData[];
  onVillageSelect?: (village: VillageHealthData) => void;
  onExport?: (selectedIds: number[]) => void;
  className?: string;
}

interface TableRowData {
  villageId: number;
  villageMoo: string;
  villageName: string;
  householdCount: number;
  totalPopulation: number;
  dmCount: number;
  htCount: number;
  copdCount: number;
  asthmaCount: number;
  tbCount: number;
  ckdCount: number;
  cancerCount: number;
  psychiatryCount: number;
  dmScreeningPercent: number | null;
  htScreeningPercent: number | null;
  isOutOfArea: boolean;
  original: VillageHealthData;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Transform VillageHealthData to flat table row format
 */
function toTableRow(data: VillageHealthData): TableRowData {
  const diseaseMap = new Map<string, number>();
  for (const disease of data.diseases) {
    diseaseMap.set(disease.diseaseCode, disease.patientCount);
  }

  return {
    villageId: data.village.villageId,
    villageMoo: data.village.villageMoo,
    villageName: data.village.villageName,
    householdCount: data.village.householdCount,
    totalPopulation: data.village.totalPopulation,
    dmCount: diseaseMap.get('001') ?? 0,
    htCount: diseaseMap.get('002') ?? 0,
    copdCount: diseaseMap.get('003') ?? 0,
    asthmaCount: diseaseMap.get('004') ?? 0,
    tbCount: diseaseMap.get('005') ?? 0,
    ckdCount: diseaseMap.get('006') ?? 0,
    cancerCount: diseaseMap.get('007') ?? 0,
    psychiatryCount: diseaseMap.get('008') ?? 0,
    dmScreeningPercent: data.screening?.dmCoveragePercent ?? null,
    htScreeningPercent: data.screening?.htCoveragePercent ?? null,
    isOutOfArea: data.village.isOutOfArea,
    original: data,
  };
}

// ---------------------------------------------------------------------------
// Column Definitions
// ---------------------------------------------------------------------------

const columnHelper = createColumnHelper<TableRowData>();

const columns = [
  columnHelper.accessor('villageName', {
    header: 'หมู่บ้าน',
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.villageMoo !== '0' ? `หมู่ ${row.villageMoo}` : ''} {info.getValue()}</span>
          {row.isOutOfArea && (
            <Badge variant="outline" className="text-xs">นอกเขต</Badge>
          )}
        </div>
      );
    },
    filterFn: 'includesString',
  }),
  columnHelper.accessor('householdCount', {
    header: 'ครัวเรือน',
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  columnHelper.accessor('totalPopulation', {
    header: 'ประชากร',
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  columnHelper.accessor('dmCount', {
    header: 'เบาหวาน',
    cell: (info) => (
      <Badge variant={info.getValue() > 30 ? 'destructive' : info.getValue() > 15 ? 'secondary' : 'default'}>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor('htCount', {
    header: 'ความดันโลหิตสูง',
    cell: (info) => (
      <Badge variant={info.getValue() > 30 ? 'destructive' : info.getValue() > 15 ? 'secondary' : 'default'}>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor('copdCount', {
    header: 'COPD',
    cell: (info) => <span className="font-mono">{info.getValue()}</span>,
  }),
  columnHelper.accessor('dmScreeningPercent', {
    header: 'คัดกรอง DM',
    cell: (info) => {
      const value = info.getValue();
      if (value === null) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge variant={value >= 80 ? 'default' : value >= 60 ? 'secondary' : 'destructive'}>
          {value.toFixed(1)}%
        </Badge>
      );
    },
  }),
  columnHelper.accessor('htScreeningPercent', {
    header: 'คัดกรอง HT',
    cell: (info) => {
      const value = info.getValue();
      if (value === null) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge variant={value >= 80 ? 'default' : value >= 60 ? 'secondary' : 'destructive'}>
          {value.toFixed(1)}%
        </Badge>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => row.original.original && console.log('View details', row.original.villageId)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  }),
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function VillageTable({
  data,
  onVillageSelect,
  onExport,
  className,
}: VillageTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Transform data for table
  const tableData = useMemo(() => data.map(toTableRow), [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => String(row.villageId),
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original.villageId);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="ค้นหาหมู่บ้าน..."
            value={(table.getColumn('villageName')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('villageName')?.setFilterValue(e.target.value)}
          />
        </div>
        {selectedRows.length > 0 && onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport(selectedIds)}
          >
            <Download className="h-4 w-4 mr-2" />
            ส่งออก ({selectedRows.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:bg-muted'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className="text-xs">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-t hover:bg-muted/30 transition-colors cursor-pointer',
                  row.getIsSelected() && 'bg-blue-50'
                )}
                onClick={() => onVillageSelect?.(row.original.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          แสดง {table.getFilteredRowModel().rows.length} จาก {tableData.length} หมู่บ้าน
        </span>
        {selectedRows.length > 0 && (
          <span>เลือก {selectedRows.length} หมู่บ้าน</span>
        )}
      </div>
    </div>
  );
}
