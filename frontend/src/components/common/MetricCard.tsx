import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400';
      case 'amber':
        return 'border-amber-500/20 bg-amber-950/10 text-amber-400';
      case 'rose':
        return 'border-rose-500/20 bg-rose-950/10 text-rose-400';
      case 'purple':
        return 'border-purple-500/20 bg-purple-950/10 text-purple-400';
      default:
        return 'border-slate-800 bg-slate-900/80 text-slate-400';
    }
  };

  return (
    <div className={`p-5 rounded-xl border backdrop-blur-md shadow-md flex flex-col justify-between transition-all hover:border-slate-700 ${getVariantStyles()}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-800/80 text-slate-200">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </div>
        
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
