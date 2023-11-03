'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';

import { isTeacher } from '@/lib/teacher';

import { Button } from './ui/button';
import { SearchInput } from './search-input';

export const NavbarRoutes = () => {
  const pathname = usePathname();

  const isTeacherPage = pathname?.startsWith('/teacher');
  const isCoursePage = pathname?.startsWith('/courses');
  const isSearchPage = pathname?.startsWith('/search');

  const { userId } = useAuth();

  return (
    <>
      {isSearchPage && (
        <div className='hidden md:block'>
          <SearchInput />
        </div>
      )}
      <div className='flex gap-x-2 ml-auto'>
        {isTeacherPage || isCoursePage ? (
          <Link href='/'>
            <Button size='sm' variant='ghost'>
              <LogOut className='w-4 h-4 mr-2' />
              Exit
            </Button>
          </Link>
        ) : isTeacher(userId) ? (
          <Link href='/teacher/courses'>
            <Button size='sm' variant='ghost'>
              Teacher Mode
            </Button>
          </Link>
        ) : null}

        <UserButton afterSignOutUrl='/' />
      </div>
    </>
  );
};
