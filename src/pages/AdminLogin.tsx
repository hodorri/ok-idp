import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-2">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">관리자 로그인</CardTitle>
          <CardDescription>IDP 자격증 비용 지원 관리 시스템</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>관리자 ID</Label>
            <Input placeholder="ID 입력" value={id} onChange={e => setId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>비밀번호</Label>
            <Input type="password" placeholder="비밀번호 입력" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleLogin}>로그인</Button>
          <div className="text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← 사용자 로그인으로</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
