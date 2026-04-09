import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { type Application } from '@/lib/storage';
import { fetchApplications, updateApplicationStatus } from '@/lib/api';
import { format } from 'date-fns';
import { CalendarIcon, Download, FileSpreadsheet, Settings, LogOut, LayoutDashboard, GraduationCap, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const nav = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('idp_admin')) { nav('/admin/login'); return; }
    fetchApplications()
      .then(setApps)
      .catch(() => toast.error('데이터 로딩 실패'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return apps.filter(a => {
      const d = new Date(a.appliedDate);
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.employeeId.toLowerCase().includes(q) && !a.employeeName.toLowerCase().includes(q) && !a.certName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [apps, startDate, endDate, searchQuery]);

  const stats = useMemo(() => ({
    count: filtered.length,
    eduTotal: filtered.reduce((s, a) => s + a.educationCost, 0),
    examTotal: filtered.reduce((s, a) => s + a.examFee, 0),
    grandTotal: filtered.reduce((s, a) => s + a.total, 0),
  }), [filtered]);

  const handleStatusChange = (id: string, status: Application['status']) => {
    if (status === '반려') {
      setRejectTargetId(id);
      setRejectReason('');
      setRejectDialogOpen(true);
      return;
    }
    doUpdateStatus(id, status);
  };

  const doUpdateStatus = async (id: string, status: Application['status'], reason?: string) => {
    try {
      await updateApplicationStatus(id, status, reason);
      setApps(prev => prev.map(a => a.id === id ? { ...a, status, rejectReason: reason || '' } : a));
      toast.success('상태가 변경되었습니다.');
    } catch {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) { toast.error('반려 사유를 입력해주세요.'); return; }
    doUpdateStatus(rejectTargetId, '반려', rejectReason);
    setRejectDialogOpen(false);
  };

  const exportExcel = () => {
    const data = filtered.map(a => ({
      '사번': a.employeeId, '이름': a.employeeName, '자격증명': a.certName,
      '취득일자': a.acquiredDate, '교육비': a.educationCost, '응시료': a.examFee,
      '합계': a.total, '신청일': a.appliedDate, '처리상태': a.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '신청내역');
    XLSX.writeFile(wb, `IDP신청내역_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast.success('엑셀 파일이 다운로드되었습니다.');
  };

  const handleLogout = () => { sessionStorage.removeItem('idp_admin'); nav('/admin/login'); };

  const navItems = [
    { label: '대시보드', icon: LayoutDashboard, path: '/admin', active: true },
    { label: '양식관리', icon: Settings, path: '/admin/form-config' },
    { label: '자격증관리', icon: FileSpreadsheet, path: '/admin/cert-list' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-accent" />
              <span className="font-semibold text-sm">IDP 관리자</span>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map(item => (
                <button key={item.path} onClick={() => nav(item.path)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    item.active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                  <item.icon className="w-3.5 h-3.5" /> {item.label}
                </button>
              ))}
            </nav>
          </div>
          <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" /> 로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="사번, 이름, 자격증명 검색" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="h-9 w-56 pl-8 text-xs bg-muted/30 border-border/60" />
          </div>
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-xs bg-muted/30 border-border/60", !startDate && 'text-muted-foreground')}>
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                {startDate ? format(startDate, 'yyyy-MM-dd') : '시작일'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={d => { setStartDate(d); setStartOpen(false); }} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">~</span>
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 text-xs bg-muted/30 border-border/60", !endDate && 'text-muted-foreground')}>
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                {endDate ? format(endDate, 'yyyy-MM-dd') : '종료일'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={d => { setEndDate(d); setEndOpen(false); }} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>초기화</Button>
          )}
          <div className="ml-auto">
            <Button size="sm" className="h-9 bg-accent text-accent-foreground hover:bg-accent/90 text-xs shadow-sm" onClick={exportExcel}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> 엑셀 다운로드
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '총 신청', value: `${stats.count}건`, color: 'bg-primary/10 text-primary' },
            { label: '총 교육비', value: `${stats.eduTotal.toLocaleString()}원`, color: 'bg-blue-50 text-blue-600' },
            { label: '총 응시료', value: `${stats.examTotal.toLocaleString()}원`, color: 'bg-violet-50 text-violet-600' },
            { label: '총 지원금액', value: `${stats.grandTotal.toLocaleString()}원`, color: 'bg-accent/10 text-accent' },
          ].map(s => (
            <Card key={s.label} className="shadow-sm border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {['사번','이름','자격증명','취득일자','교육비','응시료','합계','신청일','처리상태'].map(h => (
                  <TableHead key={h} className={cn("text-xs font-semibold", ['교육비','응시료','합계'].includes(h) && 'text-right')}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-16"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-16 text-sm text-muted-foreground">신청 내역이 없습니다.</TableCell></TableRow>
              ) : filtered.map(a => (
                <TableRow key={a.id} className="hover:bg-muted/20">
                  <TableCell className="text-sm">{a.employeeId}</TableCell>
                  <TableCell className="text-sm">{a.employeeName}</TableCell>
                  <TableCell className="text-sm font-medium">{a.certName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.acquiredDate}</TableCell>
                  <TableCell className="text-sm text-right">{a.educationCost.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right">{a.examFee.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right font-semibold">{a.total.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.appliedDate}</TableCell>
                  <TableCell>
                    <Select value={a.status} onValueChange={v => handleStatusChange(a.id, v as Application['status'])}>
                      <SelectTrigger className="w-24 h-8 text-xs border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="대기중">대기중</SelectItem>
                        <SelectItem value="승인">승인</SelectItem>
                        <SelectItem value="반려">반려</SelectItem>
                      </SelectContent>
                    </Select>
                    {a.status === '반려' && a.rejectReason && (
                      <p className="text-xs text-destructive mt-1 truncate max-w-[160px]" title={a.rejectReason}>사유: {a.rejectReason}</p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">반려 사유 입력</DialogTitle>
          </DialogHeader>
          <Textarea placeholder="반려 사유를 입력해주세요..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRejectDialogOpen(false)}>취소</Button>
            <Button variant="destructive" size="sm" onClick={handleRejectConfirm}>반려 확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
