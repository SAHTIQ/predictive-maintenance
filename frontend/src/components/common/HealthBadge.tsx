import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, PowerOff } from 'lucide-react';

interface HealthBadgeProps {
  status: string | undefined;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({
  status = 'Healthy',
  size = 'md',
  showIcon = true,
}) => {
  const normStatus = (status || 'Healthy').toLowerCase();

  const getStyle = () => {
    switch (normStatus) {
      case 'healthy':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
          label: 'Healthy',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'Warning',
        };
      case 'critical':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse',
          icon: <AlertOctagon className="w-3.5 h-3.5" />,
          label: 'Critical',
        };
      case 'anomaly':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'Anomaly',
        };
      case 'inactive':
      case 'false':
        return {
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: <PowerOff className="w-3.5 h-3.5" />,
          label: 'Inactive',
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: null,
          label: status,
        };
    }
  };

  const current = getStyle();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${sizeClasses}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
