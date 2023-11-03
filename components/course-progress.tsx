'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ICourseProgressProps {
  size?: 'default' | 'sm';
  variant?: 'default' | 'success';
  progressCount: number;
}

const colorByVariant = {
  default: 'text-sky-700',
  success: 'text-emerald-700',
};

const sizeByVariant = {
  default: 'text-sm',
  sm: 'text-xs',
};

export const CourseProgress = ({
  size,
  variant,
  progressCount,
}: ICourseProgressProps) => {
  return (
    <div>
      <Progress className='h-2' variant={variant} value={progressCount} />
      <p
        className={cn(
          'font-medium mt-2 text-sky-700',
          colorByVariant[variant || 'default'],
          sizeByVariant[size || 'default']
        )}
      >
        {Math.round(progressCount)} % Complete
      </p>
    </div>
  );
};
