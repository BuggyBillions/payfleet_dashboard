import React from "react";
import type { IconType } from "react-icons/lib";

// ==========================================
// 1. CORE UI & COMPONENT TYPES
// ==========================================

export type Theme = "light" | "dark";

export type StatusType = "successful" | "pending" | "failed";

export type OverviewCardsProps = {
  title: string;
  value: string | number | React.ReactNode;
  icon?: IconType;
  icon2?: IconType;
};

export type StatusCardsProps = {
  type: StatusType;
  text?: string;
};

export interface StatusCardProps {
  type: "success" | "pending" | "failed";
  statusText: string | number;
  icon?: IconType;
}

export interface TableColumnProps<T = unknown> {
  label: string | React.ReactNode;
  key?: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  tableHeadingClassName?: string;
}

export interface EmployeeListResponse {
  items: Employee[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
  tableType?: string;
}

export interface ReusableTableProps<
  T extends { id?: number | string },
> extends PaginationControlProps {
  columns: TableColumnProps<T>[];
  isLoading: boolean;
  data: T[];
  error: unknown;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isDeleting?: boolean;
  hasSerialNo?: boolean;
  tableType?: string;
  selectable?: boolean;
  selectedRowIds?: Array<number | string>;
  onToggleRowSelection?: (id: number | string) => void;
  onToggleAllRows?: (checked: boolean) => void;
  getRowId?: (item: T, index: number) => number | string | undefined;
}

export interface SearchableInputProps<T> {
  endpoint: string;
  onSelect: (item: T) => void;
  onInputChange?: (value: string) => void;
  displayKey?: keyof T;
  queryParam?: string;
  requestMethod?: "get" | "post";
  label?: string;
  placeholder?: string;
  className?: string;
  inputContClassName?: string;
  dataKey?: string;
  initialValue?: string;
  showIcon?: boolean;
  fetchOnEmpty?: boolean;
}

export interface ActionButtonProps {
  text: string;
  loadingText?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  action?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  buttonStyle?: string;
  overideBg?: boolean;
}

export interface FormattedInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value: string | number;
  onChange: (e: { target: { name: string; value: number } }) => void;
  name: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface SearchResultsPopupProps {
  results: SearchResult[];
  isLoading: boolean;
  searchQuery: string;
}

export interface PageHeaderProps {
  heading?: string;
  value?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  pageName: string;
}

export interface OtherActionProps {
  name: string;
  icon?: React.ReactNode;
  action: () => void;
}

export interface ActionCellProps {
  rowId: number | string;
  onEdit?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
  onView?: (id: number | string) => void;
  toggleAction?: () => void;
  canView?: boolean;
  otherActions?: OtherActionProps[];
}

export interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  showClose?: boolean;
  customMode?: boolean;
}

export type modalProps = ModalProps;

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

// ==========================================
// 2. NAVIGATION TYPES
// ==========================================

export interface NavChild {
  name: string;
  path: string;
}

export interface NavItem {
  name: string;
  icon: IconType;
  path?: string;
  role: string[];
  children?: NavChild[];
}

// ==========================================
// 3. AUTHENTICATION & USER TYPES
// ==========================================

export interface CompanyDetailsProps {
  id: number;
  name: string;
  email: string;
  phone?: string;
  logo?: string | null;
  about?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProps {
  id?: number | string;
  username?: string;
  first_name?: string;
  full_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  is_admin?: number;
  role?: string;
  tier?: string;
  company_name?: string;
  enabled?: number;
  avatar?: string;
  company_details?: CompanyDetailsProps;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface sendEmailVerificationValues {
  email: string;
}
export interface PendingVerification {
  flow: "email_verification" | string;
  email: string;
  savedAt: number;
}
export interface LoginValues {
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export type RegisterFormValues = {
  name: string;
  email: string;
  logo: File | null;
  about: string;
  address: string;
  phone: string;
  password: string;
};

export type ForgotPasswordFormValues = {
  name: string;
  email: string;
  logo: File | null;
  about: string;
  address: string;
  phone: string;
  password: string;
};

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface UserContextType {
  user: UserProps | null;
  token: string | null;
  role: string | null;
  login: (token: string, user: UserProps, role: string) => void;
  saveVerificationToken: (token: string) => void;
  getVerificationToken: () => void;
  logout: () => void;
  isLoggedIn: boolean;
  refreshUser: (token: string) => Promise<void>;
  loading: boolean;
}

export interface UserProviderProps {
  children: React.ReactNode;
}

export type userProviderProps = UserProviderProps;

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

// ==========================================
// 4. ENTITIES: COMPANIES, STAFF, EMPLOYEES & KYC
// ==========================================

export interface BankProps {
  name: string;
  code: string;
}

export interface CompanyProps {
  id?: number | string;
  name?: string;
  companyName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  no_of_employee?: number;
  staff?: number | string;
  tier?: string | number;
  status?: boolean | string;
  is_active?: boolean | number;
  created_at?: string;
  address?: string;
  registeredAddress?: string;
  rc_number?: string;
  rcNumber?: string;
  tin_number?: string;
  tinNumber?: string;
  industry?: string;
  staffCount?: number;
  verificationStatus?: VerificationStatus;
  documents?: {
    cacCertificate?: string;
    statusReport?: string;
    proofOfAddress?: string;
    directorId?: string;
  };
  rejectionReason?: string;
  directorName?: string;
  directorPhone?: string;
}

export interface GetCompaniesParams {
  page?: number;
  searchTerm?: string;
  search?: string;
  per_page?: number;
  status?: string;
}

export interface CompanyListResponse {
  items: CompanyProps[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export interface StaffProps {
  id?: number | string;
  name?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  role: string;
  status: string | boolean | number;
  is_active?: boolean | number;
  enabled?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GetStaffsParams {
  page?: number;
  searchTerm?: string;
  search?: string;
  per_page?: number;
  role?: string;
  status?: string;
}

export interface StaffListResponse {
  items: StaffProps[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export interface CreateStaffPayload {
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  role: "Finance" | "Support" | string;
  password?: string;
  [key: string]: unknown;
}

export interface Bank {
  name: string;
  code: string;
}

export interface BankItem {
  id?: number | string;
  name: string;
  code?: string;
  slug?: string;
  bank_name?: string;
  bank_code?: string;
  logo?: string;
}

export interface BankAccountDetails {
  id?: number | string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  bank_code?: string;
  currency?: string;
  recipient_code?: string;
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAccountPayload {
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code?: string;
  [key: string]: unknown;
}

export interface AddBankModalProps {
  onClose: () => void;
  defaultBank?: BankItem | null;
  onSuccess?: () => void;
}

export interface ResolvedAccount {
  account_name?: string;
  account_number?: string;
  bank_code?: string;
}

export interface EmployeeCompanyProps {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  logo?: string | null;
  about?: string;
  address?: string;
  user_id?: number;
  balance?: string | number;
  tier?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: number | string;
  company_id?: number | string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  job_title: string;
  employment_type: string;
  bank_name: string;
  bank_code?: string;
  account_name: string;
  account_number: string;
  estimate_pay: number | string;
  paying?: string | number;
  deduction_amount?: number | string | null;
  company?: EmployeeCompanyProps;
  created_at?: string;
  updated_at?: string;
}

export type EmployeeInput = Omit<
  Employee,
  "id" | "status" | "created_at" | "updated_at"
>;

export interface EmployeeFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  job_title: string;
  employment_type: string;
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_number: string;
  estimate_pay: number | string;
}

export interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSaved: (updated: Employee) => void;
}

export interface EditStaffModalProps {
  onClose: () => void;
  selectedStaff?: StaffProps | null;
  isEdit: boolean;
  onSuccess?: (staff: Partial<StaffProps>) => void;
}

export interface ViewStaffModalProps {
  staff: StaffProps | null;
  onClose: () => void;
  onStatusChange?: () => void;
  onDelete?: () => void;
}

export interface ReduceSalaryModalProps {
  employee: Employee;
  onClose: () => void;
  onSaved: (updated: Employee) => void;
}

export interface ReductionValues {
  amount: string | number;
  reason: string;
}

export type VerificationStatus =
  | "verified"
  | "pending_verification"
  | "under_review"
  | "action_required";

export interface CompanyVerificationItem {
  id: number;
  companyName: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  rcNumber: string;
  tinNumber: string;
  industry: string;
  staffCount: number;
  tier: "Starter" | "Business" | "Enterprise";
  status: "Active" | "Inactive";
  verificationStatus: VerificationStatus;
  submittedAt: string;
  registeredAddress: string;
  directorName: string;
  directorPhone: string;
  documents: {
    cacCertificate: string;
    statusReport: string;
    proofOfAddress: string;
    directorId: string;
  };
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

// ==========================================
// 5. FINANCIAL & PAYMENTS MANAGEMENT
// ==========================================

export type PaymentCategory =
  | "Salary"
  | "Bonus"
  | "Allowance"
  | "Reimbursement"
  | "Commission";

export type ExtendedPaymentStatus = StatusType | "processing" | "cancelled";

export interface CompanyPaymentItem {
  id: number;
  reference: string;
  batchId: string;
  companyId: number;
  companyName: string;
  companyEmail: string;
  employeeName: string;
  employeeEmail: string;
  employeeRole: string;
  department: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  fee: number;
  netAmount: number;
  paymentType: PaymentCategory;
  status: ExtendedPaymentStatus;
  date: string;
  narration: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  gatewayRef?: string;
}

export interface DemoDeposit {
  id: number;
  reference: string;
  amount: number;
  method: string;
  status: StatusType;
  date: string;
}

export interface DemoApproval {
  id: number;
  reference: string;
  company: string;
  amount: number;
  type: "deposit" | "payment";
  date: string;
  status: "pending" | "approved" | "declined";
}

export interface DemoPayment {
  id: number;
  reference: string;
  employee_name: string;
  amount: number;
  method: string;
  status: StatusType;
  date: string;
}

export interface DepositItemProps {
  id: number | string;
  company_id?: number | string;
  companyId?: number | string;
  companyName: string;
  email: string;
  reference: string;
  amount: number;
  method: string;
  accountNumber?: string;
  bankName?: string;
  status: StatusType;
  date: string;
  rejectionReason?: string;
  approvedAt?: string;
  [key: string]: unknown;
}

export interface DepositListResponse {
  items: DepositItemProps[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

export interface GetDepositsParams {
  page?: number;
  per_page?: number;
  search?: string;
  searchTerm?: string;
  status?: string;
}

export interface ManageDepositProps {
  defaultFilter?: "all" | "pending";
  role?: "superadmin" | "financial" | string;
}

export interface DepositsProps {
  defaultFilter?: "all" | "pending";
}

export type PaymentMethod =
  | "zap"
  | "card"
  | "transfer"
  | "bank"
  | "ussd"
  | "opay";

export type ModalView =
  | "amount"
  | "transfer_details"
  | "waiting_confirmation"
  | "success";

export interface DepositModalProps {
  onClose: () => void;
  onDepositSuccess?: (deposit: DemoDeposit) => void;
  defaultAmount?: number;
  companyId?: number | string;
}

// ==========================================
// 6. CHAT & COMMUNICATION
// ==========================================

export interface ChatUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  online: boolean;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  name: string;
  type: "chat";
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online?: boolean;
  avatar?: string;
  role?: string;
  membersCount?: number;
  messages: ChatMessage[];
}

export interface FloatingWidgetMessage {
  id: number;
  sender: "user" | "support";
  text: string;
  time: string;
}

// ==========================================
// 7. SETTINGS & PROFILE
// ==========================================

export type SettingsTab = "profile" | "pin" | "password";

export interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  maxLength?: number;
  placeholder?: string;
}
