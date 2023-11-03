'use client';

import { useDebounce } from '@/hooks/useDebounce';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';

export const SearchInput = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value);

  const categoryId = searchParams.get('categoryId');

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: categoryId,
          title: debouncedValue,
        },
      },
      { skipNull: true, skipEmptyString: true }
    );
    router.push(url);
  }, [debouncedValue, categoryId, pathname, router]);

  return (
    <div className='relative'>
      <Search className='h-w h-4 absolute top-3 left-3 text-slate-600' />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='w-full md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200'
        placeholder='Search for a course'
      />
    </div>
  );
};
