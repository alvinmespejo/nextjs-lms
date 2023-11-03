import { NavbarRoutes } from '@/components/navbar-routes';
import { ICourseSidebarProps } from './CourseSidebar';
import { CourseMobileSidebar } from './CourseMobileSidebar';

export const CourseNavbar = ({
  course,
  progressCount,
}: ICourseSidebarProps) => {
  return (
    <div className='p-4 border-b h-full flex items-center bg-white shadow-sm'>
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes />
    </div>
  );
};
