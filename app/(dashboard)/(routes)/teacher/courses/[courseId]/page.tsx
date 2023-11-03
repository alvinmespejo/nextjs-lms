import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
} from 'lucide-react';

import { db } from '@/lib/db';

import { Banner } from '@/components/banner';
import { Actions } from './_components/Actions';
import PriceForm from './_components/PriceForm';
import TitleForm from './_components/TitleForm';
import ImageForm from './_components/ImageForm';
import { IconBadge } from '@/components/icon-badge';
import ChaptersForm from './_components/ChaptersForm';
import CategoryForm from './_components/CategoryForm';
import AttachmentForm from './_components/AttachmentForm';
import DescriptionForm from './_components/DescriptionForm';

const CourseEditPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) return redirect('/');

  const fetchCourse = () => {
    return db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
      include: {
        attachments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        chapters: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  };

  const fetchCategories = () => {
    return db.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  };

  const [course, categories] = await Promise.all([
    fetchCourse(),
    fetchCategories(),
  ]);

  if (!course) return redirect('/');

  const options = categories?.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const requiredFields = [
    course.title,
    course.categoryId,
    course.imageUrl,
    course.price,
    course.description,
    course.chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && (
        <Banner label='This course is unpbulished, this will not be visible to the students.' />
      )}
      <div className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-y-2'>
            <h1 className='text-2xl font-medium'>Course Setup</h1>
            <span className='text-sm text-slate-700'>
              Complete all fields {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={params.courseId}
            isPublished={course.isPublished}
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-16'>
          <div>
            <div className='flex items-center gap-x-2'>
              <IconBadge icon={LayoutDashboard} />
              <div className='text-xl'>Customize your course</div>
            </div>
            <TitleForm initialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <ImageForm initialData={course} courseId={course.id} />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              options={options}
            />
          </div>
          <div className='space-y-6'>
            <div>
              <div className='flex items-center gap-x-2'>
                <IconBadge icon={ListChecks} />
                <div className='text-xl'>Course Chapters</div>
              </div>
              <div>
                <ChaptersForm initialData={course} courseId={course.id} />
              </div>
            </div>
            <div className='flex items-center gap-x-2'>
              <IconBadge icon={CircleDollarSign} />
              <h2 className='text-xl'>Sell you course</h2>
            </div>
            <PriceForm initialData={course} courseId={course.id} />
          </div>
          <div>
            <div className='flex items-center gap-x-2'>
              <IconBadge icon={File} />
              <h2 className='text-xl'>Resources & Attachments</h2>
            </div>
            <AttachmentForm initialData={course} courseId={course.id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseEditPage;
