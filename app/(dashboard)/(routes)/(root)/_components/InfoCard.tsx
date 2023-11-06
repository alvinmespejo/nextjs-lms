import { LucideIcon } from 'lucide-react';
import { IconBadge } from '@/components/icon-badge';

interface IInfoCardProps {
  icon: LucideIcon;
  label: string;
  numberOfItems: number;
  variant?: 'default' | 'success';
}

export const InforCard = ({
  label,
  icon: Icon,
  variant,
  numberOfItems,
}: IInfoCardProps) => {
  return (
    <div className='border rounded-md flex items-center gap-x-2 p-3'>
      <IconBadge variant={variant} icon={Icon} />
      <div>
        <p className='font-medium'>{label}</p>
        <p className='text-sm text-gray-500'>
          {numberOfItems} {numberOfItems === 1 ? 'Course' : 'Courses'}
        </p>
      </div>
    </div>
  );
};
