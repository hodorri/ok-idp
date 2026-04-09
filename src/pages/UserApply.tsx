import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { getCurrentUser, getApplications, saveApplications, getCertList, getFormConfig, type Application, type FormFieldConfig } from '@/lib/storage';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Check, ChevronsUpDown, Upload, ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UserApply() {
  const nav = useNavigate();
  const user = getCurrentUser();
  const certList = getCertList();
  const formConfig = getFormConfig();

  const [certName, setCertName] = useState('');
  const [certOpen, setCertOpen] = useState(false);
  const [acquiredDate, setAcquiredDate] = useState<Date>();
  const [dateOpen, setDateOpen] = useState(false);
  const [educationCost, setEducationCost] = useState('');
  const [examFee, setExamFee] = useState('');
  const [note, setNote] = useState('');
  const [certImage, setCertImage] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

  const total = useMemo(() => (Number(educationCost) || 0) + (Number(examFee) || 0), [educationCost, examFee]);

  useEffect(() => { if (!user) nav('/'); }, []);

  const enabledFields = formConfig.filter(f => f.enabled);

  const isFieldEnabled = (id: string) => enabledFields.some(f => f.id === id);
  const getFieldLabel = (id: string) => formConfig.find(f => f.id === id)?.label || id;
  const isRequired = (id: string) => formConfig.find(f => f.id === id)?.required ?? false;

  const handleFileUpload = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (isFieldEnabled('certName') && isRequired('certName') && !certName) { toast.error('자격증명을 선택해주세요.'); return; }
    if (isFieldEnabled('acquiredDate') && isRequired('acquiredDate') && !acquiredDate) { toast.error('취득일자를 선택해주세요.'); return; }

    const app: Application = {
      id: crypto.randomUUID(),
      employeeId: user!.employeeId,
      employeeName: user!.name,
      certName,
      acquiredDate: acquiredDate ? format(acquiredDate, 'yyyy-MM-dd') : '',
      educationCost: Number(educationCost) || 0,
      examFee: Number(examFee) || 0,
      total,
      note,
      certImageUrl: certImage,
      receiptImageUrl: receiptImage,
      appliedDate: format(new Date(), 'yyyy-MM-dd'),
      status: '대기중',
      customFields,
    };

    const apps = getApplications();
    saveApplications([...apps, app]);
    toast.success('신청이 완료되었습니다!');
    nav('/dashboard');
  };

  const customFieldConfigs = enabledFields.filter(f => f.isCustom);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80" onClick={() => nav('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">IDP 신규 신청</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>자격증 취득 비용 환급 신청</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isFieldEnabled('certName') && (
              <div className="space-y-2">
                <Label>{getFieldLabel('certName')} {isRequired('certName') && <span className="text-destructive">*</span>}</Label>
                <Popover open={certOpen} onOpenChange={setCertOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !certName && "text-muted-foreground")}>
                      {certName || '자격증을 선택하세요'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 pointer-events-auto" align="start">
                    <Command>
                      <CommandInput placeholder="자격증 검색..." />
                      <CommandList>
                        <CommandEmpty>등록된 자격증이 없습니다.</CommandEmpty>
                        <CommandGroup>
                          {certList.map(c => (
                            <CommandItem key={c.id} value={c.name} onSelect={() => { setCertName(c.name); setCertOpen(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", certName === c.name ? "opacity-100" : "opacity-0")} />
                              {c.name} <span className="ml-2 text-muted-foreground text-xs">{c.category}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {isFieldEnabled('acquiredDate') && (
              <div className="space-y-2">
                <Label>{getFieldLabel('acquiredDate')} {isRequired('acquiredDate') && <span className="text-destructive">*</span>}</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !acquiredDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {acquiredDate ? format(acquiredDate, 'PPP', { locale: ko }) : '날짜 선택'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={acquiredDate} onSelect={(d) => { setAcquiredDate(d); setDateOpen(false); }} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {isFieldEnabled('educationCost') && (
              <div className="space-y-2">
                <Label>{getFieldLabel('educationCost')} (원) {isRequired('educationCost') && <span className="text-destructive">*</span>}</Label>
                <Input type="number" placeholder="0" value={educationCost} onChange={e => setEducationCost(e.target.value)} />
              </div>
            )}

            {isFieldEnabled('examFee') && (
              <div className="space-y-2">
                <Label>{getFieldLabel('examFee')} (원) {isRequired('examFee') && <span className="text-destructive">*</span>}</Label>
                <Input type="number" placeholder="0" value={examFee} onChange={e => setExamFee(e.target.value)} />
              </div>
            )}

            {isFieldEnabled('total') && (
              <div className="space-y-2">
                <Label>{getFieldLabel('total')} (원)</Label>
                <Input type="text" readOnly value={total.toLocaleString()} className="bg-muted" />
              </div>
            )}

            {isFieldEnabled('note') && (
              <div className="space-y-2">
                <Label>{getFieldLabel('note')}</Label>
                <Textarea placeholder="비고 입력 (선택사항)" value={note} onChange={e => setNote(e.target.value)} />
              </div>
            )}

            {customFieldConfigs.map(f => (
              <div key={f.id} className="space-y-2">
                <Label>{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                {f.type === 'dropdown' && f.options ? (
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={customFields[f.id] || ''} onChange={e => setCustomFields(p => ({ ...p, [f.id]: e.target.value }))}>
                    <option value="">선택하세요</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <Input value={customFields[f.id] || ''} onChange={e => setCustomFields(p => ({ ...p, [f.id]: e.target.value }))} />
                )}
              </div>
            ))}

            <div className="border-t pt-5 space-y-4">
              <h3 className="font-semibold">첨부 서류</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>자격증 사본</Label>
                  {certImage ? (
                    <div className="relative">
                      <img src={certImage} alt="cert" className="w-full h-32 object-cover rounded-lg border" />
                      <button onClick={() => setCertImage('')} className="absolute top-1 right-1 bg-background rounded-full p-0.5 shadow"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">클릭하여 업로드</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload(setCertImage)} />
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>매출전표/영수증</Label>
                  {receiptImage ? (
                    <div className="relative">
                      <img src={receiptImage} alt="receipt" className="w-full h-32 object-cover rounded-lg border" />
                      <button onClick={() => setReceiptImage('')} className="absolute top-1 right-1 bg-background rounded-full p-0.5 shadow"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">클릭하여 업로드</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload(setReceiptImage)} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4" onClick={handleSubmit}>신청하기</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
