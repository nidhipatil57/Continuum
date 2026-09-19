import React from 'react';

// ============================================================
// BUTTON
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-surface-dark-secondary dark:text-text-dark-primary dark:border-surface-dark-border dark:hover:bg-surface-dark-tertiary',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-tertiary dark:hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    brand: 'brand-gradient-bg text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'h-7 px-2.5 text-xs gap-1.5',
    md: 'h-8 px-3 text-sm gap-2',
    lg: 'h-10 px-4 text-sm gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// ============================================================
// ICON BUTTON
// ============================================================

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary';
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  size = 'md',
  variant = 'ghost',
  children,
  className = '',
  tooltip,
  ...props
}) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-9 w-9',
  };

  const variants = {
    ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-surface-dark-tertiary dark:hover:text-white',
    secondary: 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-surface-dark-secondary dark:text-gray-400 dark:border-surface-dark-border dark:hover:bg-surface-dark-tertiary',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded transition-colors duration-150 ${sizes[size]} ${variants[variant]} ${className}`}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
};

// ============================================================
// CARD
// ============================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg dark:bg-surface-dark-secondary dark:border-surface-dark-border ${paddings[padding]} ${hoverable ? 'hover:border-gray-300 hover:shadow-soft cursor-pointer transition-all duration-150 dark:hover:border-surface-dark-border-strong' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

// ============================================================
// BADGE
// ============================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    muted: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-2xs',
    md: 'px-2 py-0.5 text-xs',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

// ============================================================
// STATUS BADGE
// ============================================================

import { STATUS_CONFIG, type StatusKey } from '@/shared/constants/providers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status as StatusKey];
  if (!config) return <Badge size={size}>{status}</Badge>;

  const variantMap: Record<string, BadgeProps['variant']> = {
    'text-status-confirmed': 'success',
    'text-status-proposed': 'warning',
    'text-status-unverified': 'warning',
    'text-status-conflicting': 'danger',
    'text-status-rejected': 'muted',
    'text-status-outdated': 'muted',
    'text-brand-500': 'info',
  };

  return (
    <Badge variant={variantMap[config.color] ?? 'default'} size={size}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
};

// ============================================================
// MODAL
// ============================================================

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} mx-4 bg-white rounded-lg shadow-overlay animate-scale-in dark:bg-surface-dark`}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-surface-dark-border">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ============================================================
// SEARCH INPUT
// ============================================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  autoFocus,
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-8 pl-8 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-surface-dark-tertiary dark:border-surface-dark-border dark:text-white dark:placeholder:text-gray-500 transition-colors"
      />
    </div>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && <div className="mb-3 text-gray-300 dark:text-gray-600">{icon}</div>}
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
};

// ============================================================
// TABS
// ============================================================

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-0.5 border-b border-gray-200 dark:border-surface-dark-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-2 text-xs font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-2xs text-gray-400 dark:text-gray-500">{tab.count}</span>
          )}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

// ============================================================
// TOGGLE
// ============================================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description }) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5 ${
            checked ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
          }`}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <div className="text-sm text-gray-900 dark:text-white">{label}</div>}
          {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>}
        </div>
      )}
    </label>
  );
};

// ============================================================
// TEXT INPUT
// ============================================================

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <input
        className={`w-full h-9 px-3 text-sm bg-white border rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-surface-dark-tertiary dark:border-surface-dark-border dark:text-white transition-colors ${
          error ? 'border-red-300' : 'border-gray-200 dark:border-surface-dark-border'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// ============================================================
// TEXT AREA
// ============================================================

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <textarea
        className={`w-full px-3 py-2 text-sm bg-white border rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none dark:bg-surface-dark-tertiary dark:border-surface-dark-border dark:text-white transition-colors ${
          error ? 'border-red-300' : 'border-gray-200 dark:border-surface-dark-border'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// ============================================================
// HEALTH INDICATOR
// ============================================================

interface HealthIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ score, size = 'md', showLabel = true }) => {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const label = score >= 80 ? 'Healthy' : score >= 60 ? 'Needs Attention' : 'Critical';

  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <>
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{score}%</span>
          </>
        )}
      </div>
      <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-full ${heights[size]}`}>
        <div
          className={`${color} ${heights[size]} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================
// TOAST
// ============================================================

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const toastIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export const Toast: React.FC<{ toast: ToastData; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const colors = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-lg shadow-medium animate-slide-up ${colors[toast.type]}`}>
      <span>{toastIcons[toast.type]}</span>
      <span>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="ml-auto opacity-60 hover:opacity-100">✕</button>
    </div>
  );
};

// ============================================================
// APPROVAL PANEL
// ============================================================

interface ApprovalPanelProps {
  onAccept: () => void;
  onReject: () => void;
  onEdit?: () => void;
  loading?: boolean;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({ onAccept, onReject, onEdit, loading }) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="primary" size="sm" onClick={onAccept} loading={loading}>Accept</Button>
      <Button variant="secondary" size="sm" onClick={onReject}>Reject</Button>
      {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>}
    </div>
  );
};

// ============================================================
// PROVIDER ICON
// ============================================================

interface ProviderIconProps {
  providerId: string;
  size?: number;
  className?: string;
}

export const ProviderIcon: React.FC<ProviderIconProps> = ({ providerId, size = 16, className = '' }) => {
  const colors: Record<string, string> = {
    chatgpt: '#10a37f',
    claude: '#d97706',
    gemini: '#4285f4',
    perplexity: '#20b2aa',
    kimi: '#6366f1',
    grok: '#1d9bf0',
    deepseek: '#0066ff',
  };

  const labels: Record<string, string> = {
    chatgpt: 'G',
    claude: 'C',
    gemini: 'G',
    perplexity: 'P',
    kimi: 'K',
    grok: 'X',
    deepseek: 'D',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        backgroundColor: colors[providerId] ?? '#6b7280',
      }}
    >
      {labels[providerId] ?? '?'}
    </div>
  );
};

// ============================================================
// SECTION HEADER
// ============================================================

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, className = '' }) => {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</h2>
      {action}
    </div>
  );
};
