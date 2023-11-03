// 'use client';

// import { Button } from '@/components/ui/button';
// import Link from 'next/link';

import { auth } from '@clerk/nextjs';
import { columns } from './_components/columns';
import { DataTable } from './_components/data-table';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

const CoursesPage = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect('/');
  }

  const data = await db.course.findMany({
    where: { userId },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return (
    <div className='p-6'>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default CoursesPage;
