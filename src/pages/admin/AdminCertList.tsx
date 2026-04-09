import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCertList, saveCertList, type CertItem } from '@/lib/storage';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
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

  const removeItem = (id: string) => { save(list.filter(i => i.id !== id)); };

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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80" onClick={() => nav('/admin')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">IDP 지원 자격증 리스트 관리</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">자격증명</Label>
            <Input placeholder="자격증명" value={newName} onChange={e => setNewName(e.target.value)} className="w-52" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">분류</Label>
            <Input placeholder="분류" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-40" />
          </div>
          <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> 추가</Button>
          <label className="ml-auto">
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <span><Upload className="w-4 h-4 mr-1" /> CSV/Excel 업로드</span>
            </Button>
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>자격증명</TableHead>
                  <TableHead>분류</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">등록된 자격증이 없습니다.</TableCell></TableRow>
                ) : list.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">총 {list.length}개 자격증 등록됨</p>
      </main>
    </div>
  );
}
