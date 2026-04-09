import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { setCurrentUser } from '@/lib/storage';
import { fetchUsers, createUser } from '@/lib/api';
import { GraduationCap, ShieldCheck, Loader2 } from 'lucide-react';

export default function Login() {
  const nav = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const users = await fetchUsers();
      const user = users.find(u => u.employeeId === loginId && u.password === loginPw);
      if (!user) { toast.error('사번 또는 비밀번호가 일치하지 않습니다.'); return; }
      setCurrentUser(user);
      toast.success(`${user.name}님, 환영합니다!`);
      nav('/dashboard');
    } catch (err) {
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupId || !signupName || !signupPw) { toast.error('모든 필드를 입력해주세요.'); return; }
    setLoading(true);
    try {
      const users = await fetchUsers();
      if (users.find(u => u.employeeId === signupId)) { toast.error('이미 등록된 사번입니다.'); return; }
      const newUser = { employeeId: signupId, name: signupName, password: signupPw };
      await createUser(newUser);
      setCurrentUser(newUser);
      toast.success('회원가입이 완료되었습니다!');
      nav('/dashboard');
    } catch (err) {
      toast.error('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <GraduationCap className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">IDP 자격증 비용 지원</h1>
          <p className="text-sm text-muted-foreground mt-1.5">개인개발계획 자격증 취득 비용 환급 시스템</p>
        </div>

        <Card className="shadow-sm border-border/60">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/60">
                <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">로그인</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">회원가입</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">사번</Label>
                  <Input placeholder="사번을 입력하세요" value={loginId} onChange={e => setLoginId(e.target.value)} className="h-11 bg-muted/30 border-border/60 focus-visible:ring-accent/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">비밀번호</Label>
                  <Input type="password" placeholder="비밀번호를 입력하세요" value={loginPw} onChange={e => setLoginPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-11 bg-muted/30 border-border/60 focus-visible:ring-accent/30" />
                </div>
                <Button className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-sm mt-2" onClick={handleLogin} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} 로그인
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">사번</Label>
                  <Input placeholder="사번을 입력하세요" value={signupId} onChange={e => setSignupId(e.target.value)} className="h-11 bg-muted/30 border-border/60 focus-visible:ring-accent/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">이름</Label>
                  <Input placeholder="이름을 입력하세요" value={signupName} onChange={e => setSignupName(e.target.value)} className="h-11 bg-muted/30 border-border/60 focus-visible:ring-accent/30" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">비밀번호</Label>
                  <Input type="password" placeholder="비밀번호를 입력하세요" value={signupPw} onChange={e => setSignupPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} className="h-11 bg-muted/30 border-border/60 focus-visible:ring-accent/30" />
                </div>
                <Button className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-sm mt-2" onClick={handleSignup} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} 회원가입
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-5 text-center">
          <Link to="/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> 관리자 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
