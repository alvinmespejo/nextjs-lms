import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { CheckCircle, Clock } from 'lucide-react';

import { getDashboardCourses } from '@/actions/getDashboardCourses';

import { CoursesList } from '@/components/courses-list';
import { InforCard } from './_components/InfoCard';

export default async function Dashboard() {
  const { userId } = auth();
  if (!userId) return redirect('/');

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  );

  return (
    <div className='p-6 space-y-4'>
      <div className='grid grid-cols-2 sm:grid-cols-2 gap-4'>
        <InforCard
          icon={Clock}
          label='In progress'
          numberOfItems={coursesInProgress.length}
        />

        <InforCard
          icon={CheckCircle}
          label='Completed'
          numberOfItems={completedCourses.length}
          variant='success'
        />
      </div>
      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  );
}
