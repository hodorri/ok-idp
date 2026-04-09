import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCertList, saveCertList, type CertItem } from '@/lib/storage';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, GraduationCap, LayoutDashboard, FileSpreadsheet, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

export default function AdminCertList() {
  const nav = useNavigate();
  const [list, setList] = useState<CertItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!sessionStorage.getItem('idp_admin')) { nav('/admin/login'); return; }
    setList(getCertList());
  }, []);

  const save = (updated: CertItem[]) => { setList(updated); saveCertList(updated); };

  const addItem = () => {
    if (!newName) { toast.error('자격증명을 입력해주세요.'); return; }
    save([...list, { id: crypto.randomUUID(), name: newName, category: newCategory }]);
    setNewName(''); setNewCategory('');
    toast.success('추가되었습니다.');
  };

  const removeItem = (id: string) => save(list.filter(i => i.id !== id));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        const items: CertItem[] = data.map(row => ({
          id: crypto.randomUUID(),
          name: row['자격증명'] || row['name'] || Object.values(row)[0] || '',
          category: row['분류'] || row['category'] || Object.values(row)[1] || '',
        })).filter(i => i.name);
        save([...list, ...items]);
        toast.success(`${items.length}개 자격증이 추가되었습니다.`);
      } catch { toast.error('파일을 읽는 중 오류가 발생했습니다.'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleLogout = () => { sessionStorage.removeItem('idp_admin'); nav('/admin/login'); };

  const navItems = [
    { label: '대시보드', icon: LayoutDashboard, path: '/admin' },
    { label: '양식관리', icon: Settings, path: '/admin/form-config' },
    { label: '자격증관리', icon: FileSpreadsheet, path: '/admin/cert-list', active: true },
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

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">IDP 지원 자격증 리스트</h2>
          <p className="text-xs text-muted-foreground mt-0.5">사용자 신청 폼의 자격증 드롭다운에 표시될 목록입니다.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">자격증명</Label>
            <Input placeholder="자격증명" value={newName} onChange={e => setNewName(e.target.value)} className="w-52 h-9 bg-muted/30 border-border/60" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">분류</Label>
            <Input placeholder="분류" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-40 h-9 bg-muted/30 border-border/60" />
          </div>
          <Button size="sm" variant="outline" className="h-9 text-xs" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> 추가</Button>
          <label className="ml-auto cursor-pointer">
            <Button size="sm" className="h-9 bg-accent text-accent-foreground hover:bg-accent/90 text-xs shadow-sm pointer-events-none" tabIndex={-1}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> CSV/Excel 업로드
            </Button>
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs font-semibold">자격증명</TableHead>
                <TableHead className="text-xs font-semibold">분류</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-16 text-sm text-muted-foreground">등록된 자격증이 없습니다.</TableCell></TableRow>
              ) : list.map(item => (
                <TableRow key={item.id} className="hover:bg-muted/20">
                  <TableCell className="text-sm font-medium">{item.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <p className="text-xs text-muted-foreground">총 {list.length}개 자격증 등록됨</p>
      </main>
    </div>
  );
}
