import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentUser, setCurrentUser, type Application } from '@/lib/storage';
import { fetchApplications } from '@/lib/api';
import { Plus, LogOut, GraduationCap, Wallet, FileText, Loader2 } from 'lucide-react';

export default function UserDashboard() {
  const nav = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) { nav('/'); return; }
    fetchApplications()
      .then(all => setApps(all.filter(a => a.employeeId === user.employeeId)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalApproved = apps.filter(a => a.status === '승인').reduce((s, a) => s + a.total, 0);
  const pendingCount = apps.filter(a => a.status === '대기중').length;

  const statusBadge = (s: string) => {
    const styles: Record<string, string> = {
      '승인': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      '반려': 'bg-red-50 text-red-600 border-red-200',
      '대기중': 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return <Badge variant="outline" className={`${styles[s]} text-xs font-medium`}>{s}</Badge>;
  };

  const handleLogout = () => { setCurrentUser(null); nav('/'); };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-accent" />
            </div>
            <span className="font-semibold text-sm">IDP 자격증 비용 지원</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{user?.name}</span>
            <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" /> 로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">총 승인 지원금액</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{totalApproved.toLocaleString()}<span className="text-sm font-normal text-muted-foreground ml-0.5">원</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">총 신청 건수</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{apps.length}<span className="text-sm font-normal text-muted-foreground ml-0.5">건</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="text-amber-600 text-sm font-bold">{pendingCount}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">대기중</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{pendingCount}<span className="text-sm font-normal text-muted-foreground ml-0.5">건</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">신청 내역</h2>
            <Link to="/apply">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm h-9 px-4 text-xs font-medium">
                <Plus className="w-3.5 h-3.5 mr-1" /> 신규 신청
              </Button>
            </Link>
          </div>

          <Card className="shadow-sm border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold">자격증명</TableHead>
                  <TableHead className="text-xs font-semibold">취득일자</TableHead>
                  <TableHead className="text-xs font-semibold text-right">교육비</TableHead>
                  <TableHead className="text-xs font-semibold text-right">응시료</TableHead>
                  <TableHead className="text-xs font-semibold text-right">합계</TableHead>
                  <TableHead className="text-xs font-semibold">신청일</TableHead>
                  <TableHead className="text-xs font-semibold">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-16"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                ) : apps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">아직 신청 내역이 없습니다</p>
                        <Link to="/apply"><Button variant="outline" size="sm" className="mt-1 text-xs">첫 신청하기</Button></Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : apps.map(a => (
                  <TableRow key={a.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-sm">{a.certName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.acquiredDate}</TableCell>
                    <TableCell className="text-sm text-right">{a.educationCost.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-right">{a.examFee.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-right font-semibold">{a.total.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.appliedDate}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
