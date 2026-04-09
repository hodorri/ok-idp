import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';

const ADMIN_ID = 'okhrd';
const ADMIN_PW = 'dlsworoqkf1!';

export default function AdminLogin() {
  const nav = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleLogin = () => {
    if (id === ADMIN_ID && pw === ADMIN_PW) {
      sessionStorage.setItem('idp_admin', 'true');
      toast.success('관리자 로그인 성공');
      nav('/admin');
    } else {
      toast.error('관리자 ID 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">관리자 로그인</h1>
          <p className="text-sm text-muted-foreground mt-1.5">IDP 자격증 비용 지원 관리 시스템</p>
        </div>

        <Card className="shadow-sm border-border/60">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">관리자 ID</Label>
              <Input placeholder="ID를 입력하세요" value={id} onChange={e => setId(e.target.value)} className="h-11 bg-muted/30 border-border/60" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">비밀번호</Label>
              <Input type="password" placeholder="비밀번호를 입력하세요" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-11 bg-muted/30 border-border/60" />
            </div>
            <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm mt-2" onClick={handleLogin}>로그인</Button>
          </CardContent>
        </Card>

        <div className="mt-5 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← 사용자 로그인으로</Link>
        </div>
      </div>
    </div>
  );
}
