import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, FileText, Award, ArrowRight, CheckCircle } from 'lucide-react';
import certiMan from '@/assets/certi-man.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-accent" />
            </div>
            <span className="font-bold text-sm">OK금융그룹 IDP 신청 사이트</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs">로그인</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="text-xs bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">시작하기</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-5">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-foreground">
              자격증 취득 비용,<br />
              <span className="text-accent">회사가 지원합니다</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              IDP 자격증 취득에 소요되는 교육비와 응시료를<br />
              간편하게 신청해보세요.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link to="/login">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md h-11 px-6 text-sm font-semibold">
                  비용 지원 신청하기 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0 animate-float">
            <img src={certiMan} alt="자격증 취득 캐릭터" className="w-64 md:w-80 drop-shadow-lg" />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="shadow-sm border-border/50 bg-accent/5">
            <CardContent className="p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-sm">간편한 신청</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                자격증명 선택, 비용 입력, 증빙서류 첨부까지<br />
                한 번에 신청할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-primary/5">
            <CardContent className="p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-sm">실시간 진행 확인</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                신청 현황과 승인 상태를 실시간으로 확인하고<br />
                관리할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-amber-50">
            <CardContent className="p-6 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm">빠른 환급</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                신청이 승인된 건에 대하여<br />
                IDP 지원비는 급여에 반영되어 지급해드립니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">© 2026 IDP 자격증 비용 지원 시스템. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
