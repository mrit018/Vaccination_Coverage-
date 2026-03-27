// =============================================================================
// Village Health Population Dashboard - VillageDetail Component
// =============================================================================
// Expandable view showing full health metrics for a village

import { useState, memo } from 'react';
import type {
  VillageHealthData,
  ComorbidityStatistics,
  ScreeningCoverage,
} from '@/types/villageHealth';
import { HealthMetrics } from './HealthMetrics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VillageDetailProps {
  data: VillageHealthData;
  className?: string;
  defaultExpanded?: boolean;
}

// ---------------------------------------------------------------------------
// Comorbidity Display Component
// ---------------------------------------------------------------------------

interface ComorbidityRowProps {
  label: string;
  count: number;
  icon?: string;
}

function ComorbidityRow({ label, count }: ComorbidityRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge variant={count > 0 ? 'secondary' : 'outline'}>{count}</Badge>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const VillageDetail = memo(function VillageDetail({
  data,
  className,
  defaultExpanded = false,
}: VillageDetailProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const { diseases, comorbidities, screening, village } = data;
  const detailId = `village-detail-${village.villageId}`;

  return (
    <section
      className={cn('mt-2', className)}
      aria-labelledby={`village-detail-heading-${village.villageId}`}
    >
      <h4 id={`village-detail-heading-${village.villageId}`} className="sr-only">
        รายละเอียดหมู่บ้าน {village.villageName}
      </h4>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
        aria-expanded={isExpanded}
        aria-controls={detailId}
      >
        <span className="text-sm text-muted-foreground">
          {isExpanded ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      {isExpanded && (
        <div
          id={detailId}
          className="grid gap-4 mt-3 md:grid-cols-2"
          role="region"
          aria-label="รายละเอียดสุขภาพหมู่บ้าน"
        >
          {/* Disease Statistics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">สถิติโรคเรื้อรัง</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthMetrics
                diseases={diseases}
                screening={screening}
                compact={false}
              />
            </CardContent>
          </Card>

          {/* Comorbidity Statistics */}
          {comorbidities && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ภาวะแทรกซ้อน</CardTitle>
              </CardHeader>
              <CardContent>
                <ComorbiditySection comorbidities={comorbidities} />
              </CardContent>
            </Card>
          )}

          {/* Screening Coverage */}
          {screening && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ความครอบคลุมการคัดกรอง</CardTitle>
              </CardHeader>
              <CardContent>
                <ScreeningSection screening={screening} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
});

// ---------------------------------------------------------------------------
// Comorbidity Section
// ---------------------------------------------------------------------------

interface ComorbiditySectionProps {
  comorbidities: ComorbidityStatistics;
}

function ComorbiditySection({ comorbidities }: ComorbiditySectionProps) {
  const items = [
    { label: 'ภาวะแทรกซ้อนที่ตา', count: comorbidities.eyeComplication },
    { label: 'ภาวะแทรกซ้อนที่เท้า', count: comorbidities.footComplication },
    { label: 'ภาวะแทรกซ้อนที่ไต', count: comorbidities.kidneyComplication },
    { label: 'ภาวะแทรกซ้อนหัวใจและหลอดเลือด', count: comorbidities.cardiovascularComplication },
    { label: 'ภาวะแทรกซ้อนหลอดเลือดสมอง', count: comorbidities.cerebrovascularComplication },
    { label: 'ภาวะแทรกซ้อนหลอดเลือดส่วนปลาย', count: comorbidities.peripheralVascularComplication },
    { label: 'ภาวะแทรกซ้อนช่องปาก', count: comorbidities.dentalComplication },
  ];

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <ComorbidityRow key={item.label} label={item.label} count={item.count} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screening Section
// ---------------------------------------------------------------------------

interface ScreeningSectionProps {
  screening: ScreeningCoverage;
}

function ScreeningSection({ screening }: ScreeningSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">เบาหวาน (DM)</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">คัดกรองแล้ว</span>
          <span className="font-medium">
            {screening.dmScreened} / {screening.totalEligible}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">ความครอบคลุม</span>
          <Badge variant={screening.dmCoveragePercent >= 80 ? 'default' : 'secondary'}>
            {screening.dmCoveragePercent.toFixed(1)}%
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">ความดันโลหิตสูง (HT)</h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">คัดกรองแล้ว</span>
          <span className="font-medium">
            {screening.htScreened} / {screening.totalEligible}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">ความครอบคลุม</span>
          <Badge variant={screening.htCoveragePercent >= 80 ? 'default' : 'secondary'}>
            {screening.htCoveragePercent.toFixed(1)}%
          </Badge>
        </div>
      </div>
    </div>
  );
}
