const API_URL = 'https://script.google.com/macros/s/AKfycbwKvYOPXkkkj5E7amiLQu0oritKTR-hJJGAluFMhkMBvqmCyeuMoBKkxWJUCetaohHd3g/exec';

async function apiGet(action: string, params?: Record<string, string>) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

async function apiPost(action: string, body: unknown) {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(body),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ── Users ──
export async function fetchUsers() {
  const rows = await apiGet('getUsers');
  return (rows as any[]).map(r => ({
    employeeId: String(r['사번'] || ''),
    name: String(r['이름'] || ''),
    password: String(r['비밀번호'] || ''),
  }));
}

export async function createUser(user: { employeeId: string; name: string; password: string }) {
  return apiPost('saveUser', { '사번': user.employeeId, '이름': user.name, '비밀번호': user.password });
}

// ── Applications ──
export async function fetchApplications() {
  const rows = await apiGet('getApplications');
  return (rows as any[]).map(r => ({
    id: String(r['ID'] || ''),
    employeeId: String(r['사번'] || ''),
    employeeName: String(r['이름'] || ''),
    certName: String(r['자격증명'] || ''),
    acquiredDate: String(r['취득일자'] || ''),
    educationCost: Number(r['교육비'] || 0),
    examFee: Number(r['응시료'] || 0),
    total: Number(r['합계'] || 0),
    note: String(r['비고'] || ''),
    certImageUrl: String(r['자격증이미지'] || ''),
    receiptImageUrl: String(r['영수증이미지'] || ''),
    appliedDate: String(r['신청일'] || ''),
    status: (String(r['상태'] || '대기중') as '대기중' | '승인' | '반려'),
    rejectReason: String(r['반려사유'] || ''),
  }));
}

export async function createApplication(app: {
  id: string; employeeId: string; employeeName: string; certName: string;
  acquiredDate: string; educationCost: number; examFee: number; total: number;
  note: string; certImageUrl?: string; receiptImageUrl?: string; appliedDate: string; status: string;
}) {
  return apiPost('saveApplication', {
    'ID': app.id, '사번': app.employeeId, '이름': app.employeeName, '자격증명': app.certName,
    '취득일자': app.acquiredDate, '교육비': app.educationCost, '응시료': app.examFee,
    '합계': app.total, '비고': app.note, '자격증이미지': app.certImageUrl || '',
    '영수증이미지': app.receiptImageUrl || '', '신청일': app.appliedDate, '상태': app.status,
  });
}

export async function updateApplicationStatus(id: string, status: string, rejectReason?: string) {
  return apiPost('updateApplicationStatus', { id, status, '반려사유': rejectReason || '' });
}

// ── Cert List ──
export async function fetchCertList() {
  const rows = await apiGet('getCertList');
  return (rows as any[]).map(r => ({
    id: String(r['ID'] || ''),
    name: String(r['자격증명'] || ''),
    category: String(r['분류'] || ''),
  }));
}

export async function saveCertListRemote(items: { id: string; name: string; category: string }[]) {
  return apiPost('saveCertList', items.map(i => ({ 'ID': i.id, '자격증명': i.name, '분류': i.category })));
}

export async function deleteCertItemRemote(id: string) {
  return apiGet('deleteCertItem', { id });
}

// ── Form Config ──
export async function fetchFormConfig() {
  const rows = await apiGet('getFormConfig');
  if (!rows || (rows as any[]).length === 0) return null;
  return (rows as any[]).map(r => ({
    id: String(r['id'] || ''),
    label: String(r['label'] || ''),
    type: String(r['type'] || 'text') as any,
    enabled: r['enabled'] === true || r['enabled'] === 'true' || r['enabled'] === 'TRUE',
    required: r['required'] === true || r['required'] === 'true' || r['required'] === 'TRUE',
    isCustom: r['isCustom'] === true || r['isCustom'] === 'true' || r['isCustom'] === 'TRUE',
    options: r['options'] ? String(r['options']).split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
  }));
}

export async function saveFormConfigRemote(config: any[]) {
  return apiPost('saveFormConfig', config.map(f => ({
    id: f.id, label: f.label, type: f.type,
    enabled: f.enabled, required: f.required, isCustom: f.isCustom,
    options: f.options ? f.options.join(',') : '',
  })));
}

// ── Image Upload ──
export async function uploadImage(base64: string, fileName: string, folderType: '자격증이미지' | '영수증이미지') {
  return apiPost('uploadImage', { base64, fileName, folderType });
}
