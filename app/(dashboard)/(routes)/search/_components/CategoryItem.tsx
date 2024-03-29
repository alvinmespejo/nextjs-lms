'use client';

import qs from 'query-string';
import { IconType } from 'react-icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';

interface ICategoryItemProps {
  label: string;
  value: string;
  icon: IconType;
}

export const CategoryItem = ({
  label,
  value,
  icon: Icon,
}: ICategoryItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategoryId = searchParams.get('categoryId');
  const currentTitle = searchParams.get('title');
  const isSelected = currentCategoryId === value;

  const onClickCategory = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          title: currentTitle,
          categoryId: isSelected ? null : value,
        },
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  return (
    <>
      <button
        onClick={onClickCategory}
        type='button'
        className={cn(
          'py-2 px-3 border border-slate-200 rounded-full flex items-center gap-x-2, hover:border-sky-700 transition',
          isSelected && 'border-sky-700  text-sky-800 bg-sky-200/20'
        )}
      >
        {Icon && <Icon size={20} />}
        <div className='truncate'>{label}</div>
      </button>
    </>
  );
};
