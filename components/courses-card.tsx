import Link from 'next/link';
import Image from 'next/image';

import { CourseProgressWithCategory } from '@/actions/getCourses';

import { IconBadge } from './icon-badge';
import { BookIcon } from 'lucide-react';
import { priceFormat } from '@/lib/priceFormat';
import { CourseProgress } from './course-progress';

interface ICourseCardProps {
  item: CourseProgressWithCategory;
}

export const CourseCard = ({ item }: ICourseCardProps) => {
  return (
    <Link href={`/courses/${item.id}`}>
      <div
        className='
          group 
          hover:shadow-sm
          transition 
          overflow-hidden
          border 
          rounded-lg
          p-3 
          h-full'
      >
        <div className='relative w-full aspect-video rounded-md overflow-hidden'>
          <Image
            fill
            className='object-cover'
            alt={item.title}
            src={item.imageUrl!}
          />
        </div>
        <div className='flex flex-col pt-2'>
          <div className='text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2'>
            {item.title}
          </div>
          <p className='text-sm text-muted-foreground'>{item.category?.name}</p>
          <div className='my-3 flex items-center gap-x-2 text-sm md:text-xs'>
            <div className='flex items-center gap-x-2 text-slate-500'>
              <IconBadge size='sm' icon={BookIcon} />
              <span>
                {item.chapters.length}&nbsp;
                {item.chapters.length > 1 ? 'Chapters' : 'Chapter'}
              </span>
            </div>
          </div>
          {item.progress !== null ? (
            <CourseProgress
              size='sm'
              variant={item.progress === 100 ? 'success' : 'default'}
              progressCount={item.progress}
            />
          ) : (
            <p className='text-md md:text-sm text-slate-700'>
              {priceFormat(item.price!)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};
