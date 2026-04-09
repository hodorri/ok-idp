import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getUsers, saveUsers, setCurrentUser } from '@/lib/storage';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const nav = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPw, setSignupPw] = useState('');

  const handleLogin = () => {
    const users = getUsers();
    const user = users.find(u => u.employeeId === loginId && u.password === loginPw);
    if (!user) { toast.error('사번 또는 비밀번호가 일치하지 않습니다.'); return; }
    setCurrentUser(user);
    toast.success(`${user.name}님, 환영합니다!`);
    nav('/dashboard');
  };

  const handleSignup = () => {
    if (!signupId || !signupName || !signupPw) { toast.error('모든 필드를 입력해주세요.'); return; }
    const users = getUsers();
    if (users.find(u => u.employeeId === signupId)) { toast.error('이미 등록된 사번입니다.'); return; }
    const newUser = { employeeId: signupId, name: signupName, password: signupPw };
    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    toast.success('회원가입이 완료되었습니다!');
    nav('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-2">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">IDP 자격증 비용 지원</CardTitle>
          <CardDescription>개인개발계획 자격증 취득 비용 환급 시스템</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label>사번</Label>
                <Input placeholder="사번 입력" value={loginId} onChange={e => setLoginId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>비밀번호</Label>
                <Input type="password" placeholder="비밀번호 입력" value={loginPw} onChange={e => setLoginPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleLogin}>로그인</Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label>사번</Label>
                <Input placeholder="사번 입력" value={signupId} onChange={e => setSignupId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>이름</Label>
                <Input placeholder="이름 입력" value={signupName} onChange={e => setSignupName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>비밀번호</Label>
                <Input type="password" placeholder="비밀번호 입력" value={signupPw} onChange={e => setSignupPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} />
              </div>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSignup}>회원가입</Button>
            </TabsContent>
          </Tabs>
          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 관리자 로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
