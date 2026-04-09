import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentUser, getApplications, setCurrentUser, type Application } from '@/lib/storage';
import { Plus, LogOut, Award } from 'lucide-react';

export default function UserDashboard() {
  const nav = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) { nav('/'); return; }
    setApps(getApplications().filter(a => a.employeeId === user.employeeId));
  }, []);

  const totalApproved = apps.filter(a => a.status === '승인').reduce((s, a) => s + a.total, 0);

  const statusColor = (s: string) => {
    if (s === '승인') return 'bg-green-100 text-green-800 hover:bg-green-100';
    if (s === '반려') return 'bg-red-100 text-red-800 hover:bg-red-100';
    return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
  };

  const handleLogout = () => { setCurrentUser(null); nav('/'); };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6" />
          <h1 className="text-lg font-bold">IDP 자격증 비용 지원</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80">{user?.name} ({user?.employeeId})</span>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> 로그아웃
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">자격증 신청 현황 조회</h2>
          <Link to="/apply">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-1" /> IDP 신규 신청
            </Button>
          </Link>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">총 승인 지원금액</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalApproved.toLocaleString()}원</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
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
                {apps.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">신청 내역이 없습니다.</TableCell></TableRow>
                ) : apps.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.certName}</TableCell>
                    <TableCell>{a.acquiredDate}</TableCell>
                    <TableCell className="text-right">{a.educationCost.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{a.examFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{a.total.toLocaleString()}</TableCell>
                    <TableCell>{a.appliedDate}</TableCell>
                    <TableCell><Badge className={statusColor(a.status)}>{a.status}</Badge></TableCell>
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
