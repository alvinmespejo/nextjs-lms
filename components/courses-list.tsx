'use client';

import { CourseProgressWithCategory } from '@/actions/getCourses';
import { CourseCard } from './courses-card';

interface ICoursesListProps {
  items: CourseProgressWithCategory[];
}

export const CoursesList = ({ items }: ICoursesListProps) => {
  return (
    <div>
      <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4'>
        {items.map((item) => (
          // <div >{item.title}</div>
          <CourseCard key={item.id} item={item} />
        ))}
      </div>

      {!items.length && (
        <div className='text-center text-sm text-muted-foreground mt-10'>
          No courses found
        </div>
      )}
    </div>
  );
};
