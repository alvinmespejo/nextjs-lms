import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { getCourses } from '@/actions/getCourses';

import { Categories } from './_components/Categories';

import { SearchInput } from '@/components/search-input';
import { CoursesList } from '@/components/courses-list';

interface ISearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}

const SearchPage = async ({ searchParams }: ISearchPageProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirect('/');
  }

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } });
  const courses = await getCourses({ userId, ...searchParams });

  return (
    <>
      <div className='md:hidden md:mb-0 px-6 mt-4 -mb-2 block'>
        <SearchInput />
      </div>

      <div className='p-6 space-y-5'>
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  );
};

export default SearchPage;
