export interface User {
  employeeId: string;
  name: string;
  password: string;
}

export interface Application {
  id: string;
  employeeId: string;
  employeeName: string;
  certName: string;
  acquiredDate: string;
  educationCost: number;
  examFee: number;
  total: number;
  note: string;
  certImageUrl?: string;
  receiptImageUrl?: string;
  appliedDate: string;
  status: '대기중' | '승인' | '반려';
  rejectReason?: string;
  customFields?: Record<string, string>;
}

export interface CertItem {
  id: string;
  name: string;
  category: string;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'textarea';
  enabled: boolean;
  required: boolean;
  isCustom: boolean;
  options?: string[];
}

const KEYS = {
  users: 'idp_users',
  applications: 'idp_applications',
  certList: 'idp_certList',
  formConfig: 'idp_formConfig',
  currentUser: 'idp_currentUser',
};

export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(KEYS.users) || '[]');
}
export function saveUsers(users: User[]) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}
export function getCurrentUser(): User | null {
  const d = localStorage.getItem(KEYS.currentUser);
  return d ? JSON.parse(d) : null;
}
export function setCurrentUser(u: User | null) {
  if (u) localStorage.setItem(KEYS.currentUser, JSON.stringify(u));
  else localStorage.removeItem(KEYS.currentUser);
}

export function getApplications(): Application[] {
  return JSON.parse(localStorage.getItem(KEYS.applications) || '[]');
}
export function saveApplications(apps: Application[]) {
  localStorage.setItem(KEYS.applications, JSON.stringify(apps));
}

export function getCertList(): CertItem[] {
  return JSON.parse(localStorage.getItem(KEYS.certList) || '[]');
}
export function saveCertList(list: CertItem[]) {
  localStorage.setItem(KEYS.certList, JSON.stringify(list));
}

export function getFormConfig(): FormFieldConfig[] {
  const d = localStorage.getItem(KEYS.formConfig);
  if (d) return JSON.parse(d);
  return defaultFormConfig();
}
export function saveFormConfig(config: FormFieldConfig[]) {
  localStorage.setItem(KEYS.formConfig, JSON.stringify(config));
}

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
