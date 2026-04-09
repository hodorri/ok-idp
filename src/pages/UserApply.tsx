import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { getCurrentUser, type Application, type FormFieldConfig, type CertItem } from '@/lib/storage';
import { fetchCertList, fetchFormConfig, createApplication, uploadImage } from '@/lib/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Check, ChevronsUpDown, Upload, ArrowLeft, X, GraduationCap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function defaultFormConfig(): FormFieldConfig[] {
  return [
    { id: 'certName', label: '자격증명', type: 'dropdown', enabled: true, required: true, isCustom: false },
    { id: 'acquiredDate', label: '취득일자', type: 'date', enabled: true, required: true, isCustom: false },
    { id: 'educationCost', label: '교육비', type: 'number', enabled: true, required: true, isCustom: false },
    { id: 'examFee', label: '응시료', type: 'number', enabled: true, required: true, isCustom: false },
    { id: 'total', label: '합계', type: 'number', enabled: true, required: false, isCustom: false },
    { id: 'note', label: '비고', type: 'textarea', enabled: true, required: false, isCustom: false },
  ];
}

export default function UserApply() {
  const nav = useNavigate();
  const user = getCurrentUser();
  const [certList, setCertList] = useState<CertItem[]>([]);
  const [formConfig, setFormConfig] = useState<FormFieldConfig[]>(defaultFormConfig());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (!user) { nav('/'); return; }
    Promise.all([fetchCertList(), fetchFormConfig()])
      .then(([certs, config]) => {
        setCertList(certs);
        if (config && config.length > 0) setFormConfig(config);
      })
      .catch(() => toast.error('데이터 로딩에 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

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

  const handleSubmit = async () => {
    if (isFieldEnabled('certName') && isRequired('certName') && !certName) { toast.error('자격증명을 선택해주세요.'); return; }
    if (isFieldEnabled('acquiredDate') && isRequired('acquiredDate') && !acquiredDate) { toast.error('취득일자를 선택해주세요.'); return; }

    setSubmitting(true);
    try {
      let certImageUrl = '';
      let receiptImageUrl = '';

      const filePrefix = `${user!.employeeId}_${user!.name}_${certName}`;
      if (certImage) {
        const res = await uploadImage(certImage, `${filePrefix}_자격증빙.png`, '자격증이미지');
        certImageUrl = res.fileUrl || '';
      }
      if (receiptImage) {
        const res = await uploadImage(receiptImage, `${filePrefix}_매출전표.png`, '영수증이미지');
        receiptImageUrl = res.fileUrl || '';
      }

      await createApplication({
        id: crypto.randomUUID(),
        employeeId: user!.employeeId,
        employeeName: user!.name,
        certName,
        acquiredDate: acquiredDate ? format(acquiredDate, 'yyyy-MM-dd') : '',
        educationCost: Number(educationCost) || 0,
        examFee: Number(examFee) || 0,
        total,
        note,
        certImageUrl,
        receiptImageUrl,
        appliedDate: format(new Date(), 'yyyy-MM-dd'),
        status: '대기중',
      });

      toast.success('신청이 완료되었습니다!');
      nav('/dashboard');
    } catch (err) {
      toast.error('신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const customFieldConfigs = enabledFields.filter(f => f.isCustom);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => nav('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4.5 h-4.5 text-accent" />
            <span className="font-semibold text-sm">IDP 신규 신청</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold">자격증 취득 비용 환급 신청</h2>
              <p className="text-xs text-muted-foreground mt-1">필요한 정보를 입력하고 증빙 서류를 첨부해주세요.</p>
            </div>

            <div className="h-px bg-border/60" />

            {isFieldEnabled('certName') && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{getFieldLabel('certName')} {isRequired('certName') && <span className="text-destructive">*</span>}</Label>
                <Popover open={certOpen} onOpenChange={setCertOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between h-11 bg-muted/30 border-border/60", !certName && "text-muted-foreground")}>
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{getFieldLabel('acquiredDate')} {isRequired('acquiredDate') && <span className="text-destructive">*</span>}</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 bg-muted/30 border-border/60", !acquiredDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {acquiredDate ? format(acquiredDate, 'PPP', { locale: ko }) : '날짜를 선택하세요'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={acquiredDate} onSelect={d => { setAcquiredDate(d); setDateOpen(false); }} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isFieldEnabled('educationCost') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{getFieldLabel('educationCost')} (원)</Label>
                  <Input type="number" placeholder="0" value={educationCost} onChange={e => setEducationCost(e.target.value)} className="h-11 bg-muted/30 border-border/60" />
                </div>
              )}
              {isFieldEnabled('examFee') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{getFieldLabel('examFee')} (원)</Label>
                  <Input type="number" placeholder="0" value={examFee} onChange={e => setExamFee(e.target.value)} className="h-11 bg-muted/30 border-border/60" />
                </div>
              )}
              {isFieldEnabled('total') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{getFieldLabel('total')} (원)</Label>
                  <Input type="text" readOnly value={total.toLocaleString()} className="h-11 bg-muted/50 border-border/60 font-semibold" />
                </div>
              )}
            </div>

            {isFieldEnabled('note') && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{getFieldLabel('note')}</Label>
                <Textarea placeholder="비고 입력 (선택사항)" value={note} onChange={e => setNote(e.target.value)} className="bg-muted/30 border-border/60 min-h-[80px]" />
              </div>
            )}

            {customFieldConfigs.map(f => (
              <div key={f.id} className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                {f.type === 'dropdown' && f.options ? (
                  <select className="flex h-11 w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm" value={customFields[f.id] || ''} onChange={e => setCustomFields(p => ({ ...p, [f.id]: e.target.value }))}>
                    <option value="">선택하세요</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <Input value={customFields[f.id] || ''} onChange={e => setCustomFields(p => ({ ...p, [f.id]: e.target.value }))} className="h-11 bg-muted/30 border-border/60" />
                )}
              </div>
            ))}

            <div className="h-px bg-border/60" />

            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">첨부 서류</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">자격증 사본</span>
                  {certImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-border/60">
                      <img src={certImage} alt="cert" className="w-full h-32 object-cover" />
                      <button onClick={() => setCertImage('')} className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm hover:bg-background"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground mb-1.5" />
                      <span className="text-xs text-muted-foreground">클릭하여 업로드</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload(setCertImage)} />
                    </label>
                  )}
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">매출전표/영수증</span>
                  {receiptImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-border/60">
                      <img src={receiptImage} alt="receipt" className="w-full h-32 object-cover" />
                      <button onClick={() => setReceiptImage('')} className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm hover:bg-background"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground mb-1.5" />
                      <span className="text-xs text-muted-foreground">클릭하여 업로드</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload(setReceiptImage)} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <Button className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} 신청하기
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
