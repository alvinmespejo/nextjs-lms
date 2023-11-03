import { Category, Course } from '@prisma/client';

import { getProgress } from './getProgress';
import { db } from '@/lib/db';

export type CourseProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface GetCourses {
  userId: string;
  categoryId?: string;
  title?: string;
}

export const getCourses = async ({
  userId,
  categoryId,
  title,
}: GetCourses): Promise<CourseProgressWithCategory[]> => {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
        title: { contains: title },
        categoryId,
      },
      include: {
        category: true,
        chapters: {
          where: {
            isPublished: true,
          },
          select: { id: true },
        },
        purchases: {
          where: { userId },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const coursesWithProgress: CourseProgressWithCategory[] = await Promise.all(
      courses.map(async (course) => {
        if (course.purchases.length <= 0) {
          return {
            ...course,
            progress: null,
          };
        }

        const progress = await getProgress(userId, course.id);
        return {
          ...course,
          progress,
        };
      })
    );

    return coursesWithProgress;
  } catch (err) {
    console.log(err);
    return [];
  }
};
