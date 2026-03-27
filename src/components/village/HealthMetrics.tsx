// =============================================================================
// Village Health Population Dashboard - HealthMetrics Component
// =============================================================================
// Displays disease counts and screening coverage for a village

import type { DiseaseStatistics, ScreeningCoverage } from '@/types/villageHealth';
import { DISEASE_CODE_MAP } from '@/types/villageHealth';
import { formatPercentage } from '@/utils/villageDataTransformers';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HealthMetricsProps {
  diseases: DiseaseStatistics[];
  screening?: ScreeningCoverage | null;
  className?: string;
  compact?: boolean;
}

interface MetricRowProps {
  label: string;
  count: number;
  coverage?: number | null;
  variant?: 'default' | 'secondary' | 'destructive';
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Determine badge variant based on disease count thresholds
 */
function getDiseaseVariant(count: number, diseaseCode: string): 'default' | 'secondary' | 'destructive' {
  // High-prevalence diseases have lower thresholds
  const isHighPrevalence = ['001', '002'].includes(diseaseCode); // DM, HT

  if (isHighPrevalence) {
    if (count >= 50) return 'destructive';
    if (count >= 20) return 'secondary';
  } else {
    if (count >= 20) return 'destructive';
    if (count >= 10) return 'secondary';
  }

  return 'default';
}

/**
 * Determine coverage variant based on percentage
 */
function getCoverageVariant(percent: number | null | undefined): 'default' | 'secondary' | 'destructive' {
  if (percent === null || percent === undefined) return 'default';
  if (percent >= 80) return 'default';
  if (percent >= 60) return 'secondary';
  return 'destructive';
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function MetricRow({ label, count, coverage, variant = 'default' }: MetricRowProps) {
  const coverageVariant = getCoverageVariant(coverage);

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground truncate flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <Badge variant={variant} className="min-w-[3rem] justify-center">
          {count}
        </Badge>
        {coverage !== undefined && coverage !== null && (
          <Badge
            variant={coverageVariant}
            className="min-w-[4rem] justify-center text-xs"
          >
            {formatPercentage(coverage)}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function HealthMetrics({
  diseases,
  screening,
  className,
  compact = false,
}: HealthMetricsProps) {
  if (!diseases || diseases.length === 0) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        ไม่มีข้อมูลโรค
      </div>
    );
  }

  // Compact view shows only DM and HT
  const displayDiseases = compact
    ? diseases.filter((d) => ['001', '002'].includes(d.diseaseCode))
    : diseases;

  return (
    <div className={cn('space-y-1', className)}>
      {displayDiseases.map((disease) => (
        <MetricRow
          key={disease.diseaseCode}
          label={disease.diseaseName || DISEASE_CODE_MAP[disease.diseaseCode]}
          count={disease.patientCount}
          coverage={
            disease.diseaseCode === '001' && screening?.dmCoveragePercent !== undefined
              ? screening.dmCoveragePercent
              : disease.diseaseCode === '002' && screening?.htCoveragePercent !== undefined
                ? screening.htCoveragePercent
                : disease.screeningCoverage
          }
          variant={getDiseaseVariant(disease.patientCount, disease.diseaseCode)}
        />
      ))}
    </div>
  );
}
