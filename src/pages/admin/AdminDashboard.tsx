import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getApplications, saveApplications, type Application } from '@/lib/storage';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Download, FileSpreadsheet, ClipboardList, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const nav = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('idp_admin')) { nav('/admin/login'); return; }
    setApps(getApplications());
  }, []);

  const filtered = useMemo(() => {
    return apps.filter(a => {
      const d = new Date(a.appliedDate);
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [apps, startDate, endDate]);

  const stats = useMemo(() => ({
    count: filtered.length,
    eduTotal: filtered.reduce((s, a) => s + a.educationCost, 0),
    examTotal: filtered.reduce((s, a) => s + a.examFee, 0),
    grandTotal: filtered.reduce((s, a) => s + a.total, 0),
  }), [filtered]);

  const updateStatus = (id: string, status: Application['status']) => {
    const updated = apps.map(a => a.id === id ? { ...a, status } : a);
    setApps(updated);
    saveApplications(updated);
    toast.success('상태가 변경되었습니다.');
  };

  const exportExcel = () => {
    const data = filtered.map(a => ({
      '사번': a.employeeId,
      '이름': a.employeeName,
      '자격증명': a.certName,
      '취득일자': a.acquiredDate,
      '교육비': a.educationCost,
      '응시료': a.examFee,
      '합계': a.total,
      '신청일': a.appliedDate,
      '처리상태': a.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '신청내역');
    XLSX.writeFile(wb, `IDP신청내역_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast.success('엑셀 파일이 다운로드되었습니다.');
  };

  const statusColor = (s: string) => {
    if (s === '승인') return 'bg-green-100 text-green-800';
    if (s === '반려') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const handleLogout = () => { sessionStorage.removeItem('idp_admin'); nav('/admin/login'); };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">IDP 관리자</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={() => nav('/admin')}>
            <ClipboardList className="w-4 h-4 mr-1" /> 대시보드
          </Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={() => nav('/admin/form-config')}>
            <Settings className="w-4 h-4 mr-1" /> 양식관리
          </Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={() => nav('/admin/cert-list')}>
            <FileSpreadsheet className="w-4 h-4 mr-1" /> 자격증관리
          </Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> 로그아웃
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <h2 className="text-xl font-bold">신청 현황 대시보드</h2>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">시작일</span>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn(!startDate && 'text-muted-foreground')}>
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {startDate ? format(startDate, 'yyyy-MM-dd') : '시작일'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={d => { setStartDate(d); setStartOpen(false); }} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <span className="text-muted-foreground pb-1">~</span>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">종료일</span>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn(!endDate && 'text-muted-foreground')}>
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {endDate ? format(endDate, 'yyyy-MM-dd') : '종료일'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={d => { setEndDate(d); setEndOpen(false); }} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>초기화</Button>
          <div className="ml-auto">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={exportExcel}>
              <Download className="w-4 h-4 mr-1" /> 엑셀 다운로드
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '총 신청 건수', value: `${stats.count}건` },
            { label: '총 교육비', value: `${stats.eduTotal.toLocaleString()}원` },
            { label: '총 응시료', value: `${stats.examTotal.toLocaleString()}원` },
            { label: '총 지원금액', value: `${stats.grandTotal.toLocaleString()}원` },
          ].map(s => (
            <Card key={s.label} className="shadow-sm">
              <CardHeader className="pb-1"><CardTitle className="text-sm text-muted-foreground font-medium">{s.label}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-primary">{s.value}</p></CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사번</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>자격증명</TableHead>
                  <TableHead>취득일자</TableHead>
                  <TableHead className="text-right">교육비</TableHead>
                  <TableHead className="text-right">응시료</TableHead>
                  <TableHead className="text-right">합계</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead>처리상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">신청 내역이 없습니다.</TableCell></TableRow>
                ) : filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.employeeId}</TableCell>
                    <TableCell>{a.employeeName}</TableCell>
                    <TableCell className="font-medium">{a.certName}</TableCell>
                    <TableCell>{a.acquiredDate}</TableCell>
                    <TableCell className="text-right">{a.educationCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{a.examFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{a.total.toLocaleString()}</TableCell>
                    <TableCell>{a.appliedDate}</TableCell>
                    <TableCell>
                      <Select value={a.status} onValueChange={v => updateStatus(a.id, v as Application['status'])}>
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="대기중">대기중</SelectItem>
                          <SelectItem value="승인">승인</SelectItem>
                          <SelectItem value="반려">반려</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
