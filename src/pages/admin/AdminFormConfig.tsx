import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFormConfig, saveFormConfig, type FormFieldConfig } from '@/lib/storage';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

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
    setFields(f => [...f, {
      id: `custom_${Date.now()}`,
      label: '새 필드',
      type: 'text',
      enabled: true,
      required: false,
      isCustom: true,
    }]);
  };

  const removeField = (id: string) => {
    setFields(f => f.filter(ff => ff.id !== id));
  };

  const handleSave = () => {
    saveFormConfig(fields);
    toast.success('양식 설정이 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80" onClick={() => nav('/admin')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">신청 양식 관리</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground text-sm">사용자 신청 폼의 필드를 관리합니다. 변경사항은 즉시 반영됩니다.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addField}><Plus className="w-4 h-4 mr-1" /> 필드 추가</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSave}><Save className="w-4 h-4 mr-1" /> 저장</Button>
          </div>
        </div>

        <Card className="shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>활성화</TableHead>
                  <TableHead>필드명</TableHead>
                  <TableHead>타입</TableHead>
                  <TableHead>필수</TableHead>
                  <TableHead>옵션 (드롭다운)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map(f => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <Switch checked={f.enabled} onCheckedChange={v => updateField(f.id, { enabled: v })} />
                    </TableCell>
                    <TableCell>
                      <Input value={f.label} onChange={e => updateField(f.id, { label: e.target.value })} className="w-36" />
                    </TableCell>
                    <TableCell>
                      {f.isCustom ? (
                        <Select value={f.type} onValueChange={v => updateField(f.id, { type: v as FormFieldConfig['type'] })}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">텍스트</SelectItem>
                            <SelectItem value="number">숫자</SelectItem>
                            <SelectItem value="date">날짜</SelectItem>
                            <SelectItem value="dropdown">드롭다운</SelectItem>
                            <SelectItem value="textarea">긴 텍스트</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">{f.type}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch checked={f.required} onCheckedChange={v => updateField(f.id, { required: v })} />
                    </TableCell>
                    <TableCell>
                      {f.type === 'dropdown' && f.isCustom && (
                        <Input
                          placeholder="콤마로 구분"
                          value={f.options?.join(', ') || ''}
                          onChange={e => updateField(f.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          className="w-48"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {f.isCustom && (
                        <Button variant="ghost" size="icon" onClick={() => removeField(f.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
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
