import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { CourseSidebar, ICourseSidebarProps } from './CourseSidebar';

export const CourseMobileSidebar = ({
  course,
  progressCount,
}: ICourseSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className='md:hidden pr-4 hover:opacity-75 transition'>
        <Menu />
      </SheetTrigger>
      <SheetContent side='left' className='p-0 bg-white w-72'>
        <CourseSidebar course={course} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  );
};
