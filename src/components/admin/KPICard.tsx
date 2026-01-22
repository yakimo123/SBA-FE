import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  color = 'purple',
}: KPICardProps) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-['Fira_Sans'] text-sm font-medium text-gray-600">
              {title}
            </p>
            <p className="mt-2 font-['Fira_Code'] text-3xl font-bold text-gray-900">
              {value}
            </p>
            {change !== undefined && (
              <p
                className={`mt-2 font-['Fira_Sans'] text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {change}% from last period
              </p>
            )}
          </div>
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${colorClasses[color]} shadow-md`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
