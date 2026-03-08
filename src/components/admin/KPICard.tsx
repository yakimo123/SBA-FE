import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: 'amber' | 'blue' | 'green' | 'rose';
}

const colorMap = {
  amber: 'bg-accent/10 text-accent',
  blue: 'bg-admin-info/10 text-admin-info',
  green: 'bg-admin-success/10 text-admin-success',
  rose: 'bg-admin-danger/10 text-admin-danger',
};

const iconBgMap = {
  amber: 'bg-accent',
  blue: 'bg-admin-info',
  green: 'bg-admin-success',
  rose: 'bg-admin-danger',
};

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  color = 'amber',
}: KPICardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card admin-card-shadow transition-all duration-300 hover:admin-card-shadow-hover border border-border/50">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="font-mono-display text-3xl font-bold text-foreground tracking-tight">
              {value}
            </p>
            {change !== undefined && (
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                change >= 0
                  ? 'bg-admin-success/10 text-admin-success'
                  : 'bg-admin-danger/10 text-admin-danger'
              }`}>
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {change >= 0 ? '+' : ''}{change}%
              </div>
            )}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgMap[color]} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-6 w-6 text-card" />
          </div>
        </div>
      </div>
      {/* Subtle bottom accent line */}
      <div className={`h-1 w-full ${iconBgMap[color]} opacity-80`} />
    </div>
  );
}
