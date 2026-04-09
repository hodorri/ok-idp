import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFormConfig, saveFormConfig, type FormFieldConfig } from '@/lib/storage';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Save, GraduationCap, LayoutDashboard, FileSpreadsheet, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminFormConfig() {
  const nav = useNavigate();
  const [fields, setFields] = useState<FormFieldConfig[]>([]);

  useEffect(() => {
    if (!sessionStorage.getItem('idp_admin')) { nav('/admin/login'); return; }
    setFields(getFormConfig());
  }, []);

  const updateField = (id: string, patch: Partial<FormFieldConfig>) => {
    setFields(f => f.map(ff => ff.id === id ? { ...ff, ...patch } : ff));
  };

  const addField = () => {
    setFields(f => [...f, { id: `custom_${Date.now()}`, label: '새 필드', type: 'text', enabled: true, required: false, isCustom: true }]);
  };

  const removeField = (id: string) => setFields(f => f.filter(ff => ff.id !== id));

  const handleSave = () => { saveFormConfig(fields); toast.success('양식 설정이 저장되었습니다.'); };

  const handleLogout = () => { sessionStorage.removeItem('idp_admin'); nav('/admin/login'); };

  const navItems = [
    { label: '대시보드', icon: LayoutDashboard, path: '/admin' },
    { label: '양식관리', icon: Settings, path: '/admin/form-config', active: true },
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

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">신청 양식 관리</h2>
            <p className="text-xs text-muted-foreground mt-0.5">사용자 신청 폼의 필드를 관리합니다.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={addField}><Plus className="w-3.5 h-3.5 mr-1" /> 필드 추가</Button>
            <Button size="sm" className="h-9 bg-accent text-accent-foreground hover:bg-accent/90 text-xs shadow-sm" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1" /> 저장</Button>
          </div>
        </div>

        <Card className="shadow-sm border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs font-semibold w-20">활성화</TableHead>
                <TableHead className="text-xs font-semibold">필드명</TableHead>
                <TableHead className="text-xs font-semibold">타입</TableHead>
                <TableHead className="text-xs font-semibold w-20">필수</TableHead>
                <TableHead className="text-xs font-semibold">옵션 (드롭다운)</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map(f => (
                <TableRow key={f.id} className="hover:bg-muted/20">
                  <TableCell><Switch checked={f.enabled} onCheckedChange={v => updateField(f.id, { enabled: v })} /></TableCell>
                  <TableCell><Input value={f.label} onChange={e => updateField(f.id, { label: e.target.value })} className="w-36 h-9 text-sm bg-muted/30 border-border/60" /></TableCell>
                  <TableCell>
                    {f.isCustom ? (
                      <Select value={f.type} onValueChange={v => updateField(f.id, { type: v as FormFieldConfig['type'] })}>
                        <SelectTrigger className="w-28 h-9 text-xs border-border/60"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">텍스트</SelectItem>
                          <SelectItem value="number">숫자</SelectItem>
                          <SelectItem value="date">날짜</SelectItem>
                          <SelectItem value="dropdown">드롭다운</SelectItem>
                          <SelectItem value="textarea">긴 텍스트</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">{f.type}</span>
                    )}
                  </TableCell>
                  <TableCell><Switch checked={f.required} onCheckedChange={v => updateField(f.id, { required: v })} /></TableCell>
                  <TableCell>
                    {f.type === 'dropdown' && f.isCustom && (
                      <Input placeholder="콤마로 구분" value={f.options?.join(', ') || ''} onChange={e => updateField(f.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-48 h-9 text-xs bg-muted/30 border-border/60" />
                    )}
                  </TableCell>
                  <TableCell>{f.isCustom && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeField(f.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}
