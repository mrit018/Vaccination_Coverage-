// =============================================================================
// BMS Session KPI Dashboard - Vaccination Coverage Page
// =============================================================================

import { useMemo } from 'react';
import { useBmsSessionContext } from '@/contexts/BmsSessionContext';
import { useQuery } from '@/hooks/useQuery';
import { getVaccinationCoverage, getSchoolCoverage } from '@/services/vaccinationService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Syringe, ShieldCheck, School, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';

export default function VaccinationCoverage() {
  const { session, connectionConfig } = useBmsSessionContext();
  
  // 1. Vaccine Coverage Query
  const coverageQueryFn = useMemo(() => {
    if (!connectionConfig || !session) return null;
    return () => getVaccinationCoverage(connectionConfig, session.databaseType);
  }, [connectionConfig, session]);

  const { data: coverageData, isLoading: isLoadingCoverage } = useQuery({
    queryFn: coverageQueryFn || (async () => []),
    enabled: !!coverageQueryFn,
  });

  // 2. School Coverage Query
  const schoolQueryFn = useMemo(() => {
    if (!connectionConfig || !session) return null;
    return () => getSchoolCoverage(connectionConfig, session.databaseType);
  }, [connectionConfig, session]);

  const { data: schoolData, isLoading: isLoadingSchool } = useQuery({
    queryFn: schoolQueryFn || (async () => []),
    enabled: !!schoolQueryFn,
  });

  if (!session) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm border border-blue-100/50">
            <Syringe className="h-5.5 w-5.5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">ความครอบคลุมวัคซีน (Vaccination Coverage)</h2>
        </div>
        <p className="text-sm font-medium text-slate-500/80">ระบบติดตามการสร้างภูมิคุ้มกันหมู่ในระดับประชากรและโรงเรียน</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-slate-100/80 p-1 border border-slate-200/50 shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 px-4">
              <TrendingUp className="h-4 w-4" />
              ภาพรวมภูมิคุ้มกันหมู่
            </TabsTrigger>
            <TabsTrigger value="school" className="flex items-center gap-2 px-4">
              <School className="h-4 w-4" />
              เป้าหมายในโรงเรียน
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview & Herd Immunity (Target 90%) */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Chart */}
            <Card className="lg:col-span-2 border-slate-200/60 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center justify-between">
                  <span>สัดส่วนการได้รับวัคซีนพื้นฐาน</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">เป้าหมาย 90%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoadingCoverage ? (
                  <div className="h-full flex items-center justify-center">
                    <LoadingSpinner size="lg" message="กำลังประมวลผลความครอบคลุม..." />
                  </div>
                ) : coverageData && coverageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={coverageData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        dataKey="vaccineName"
                        type="category"
                        tick={{ fontSize: 12, fontWeight: 500 }}
                        width={120}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'ความครอบคลุม']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <ReferenceLine x={90} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal 90%', fill: '#ef4444', fontSize: 10 }} />
                      <Bar
                        dataKey="coveragePercent"
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                      >
                        {coverageData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.coveragePercent >= 90 ? '#22c55e' : '#3b82f6'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="ไม่มีข้อมูลวัคซีน" icon={<Syringe className="h-6 w-6" />} />
                )}
              </CardContent>
            </Card>

            {/* Target Breakdown */}
            <Card className="border-slate-200/60 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800">สรุปความสำเร็จ</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {coverageData?.map((item) => (
                    <div key={item.vaccineCode} className="p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm">{item.vaccineName}</span>
                        <span className="text-[10px] text-slate-400">เป้าหมาย: {item.targetCount.toLocaleString()} ราย</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-bold ${item.isMetGoal ? 'text-green-600' : 'text-blue-600'}`}>
                          {item.coveragePercent.toFixed(1)}%
                        </span>
                        {item.isMetGoal ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none text-[9px] py-0 px-1.5">
                            <CheckCircle2 className="h-2 w-2 mr-1" /> ผ่านเกณฑ์
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-slate-500 text-[9px] py-0 px-1.5">ต่ำกว่าเป้าหมาย</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Schools (Target 95%) */}
        <TabsContent value="school" className="space-y-4 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
             <Card className="bg-emerald-50 border-emerald-100">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-3">
                   <ShieldCheck className="h-8 w-8 text-emerald-600" />
                   <div>
                     <p className="text-xs font-semibold text-emerald-600 uppercase">เป้าหมายโรงเรียน</p>
                     <p className="text-2xl font-bold text-emerald-900">95%</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
             <Card className="bg-slate-50 border-slate-100">
               <CardContent className="pt-6">
                 <div className="flex items-center gap-3">
                   <School className="h-8 w-8 text-slate-600" />
                   <div>
                     <p className="text-xs font-semibold text-slate-600 uppercase">โรงเรียนทั้งหมด</p>
                     <p className="text-2xl font-bold text-slate-900">{schoolData?.length || 0}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
          </div>

          <Card className="border-slate-200/60 shadow-md overflow-hidden">
            <CardContent className="p-0">
              {isLoadingSchool ? (
                <div className="py-20 flex justify-center"><LoadingSpinner /></div>
              ) : schoolData && schoolData.length > 0 ? (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="py-4">ชื่อโรงเรียน</TableHead>
                      <TableHead className="text-right">นักเรียน (เป้าหมาย)</TableHead>
                      <TableHead className="text-right">ได้รับวัคซีน</TableHead>
                      <TableHead className="text-right">ความครอบคลุม (%)</TableHead>
                      <TableHead className="text-right">สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolData.map((item) => (
                      <TableRow key={item.schoolId}>
                        <TableCell className="font-semibold text-slate-800">{item.schoolName}</TableCell>
                        <TableCell className="text-right">{item.studentCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.vaccinatedCount.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-slate-700">{item.coveragePercent.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">
                          {item.isMetGoal ? (
                            <Badge className="bg-green-500 text-white">ผ่านเกณฑ์ 95%</Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> ไม่ผ่านเกณฑ์
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState title="ไม่พบข้อมูลโรงเรียน" icon={<School className="h-6 w-6" />} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
