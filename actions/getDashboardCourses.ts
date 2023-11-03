import { db } from '@/lib/db';
import { Category, Chapter, Course } from '@prisma/client';
import { getProgress } from './getProgress';

type TCourseWithProgressAndCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

type TDashboardCourses = {
  completedCourses: TCourseWithProgressAndCategory[];
  coursesInProgress: TCourseWithProgressAndCategory[];
};

export const getDashboardCourses = async (
  userId: string
): Promise<TDashboardCourses> => {
  try {
    const purchasedCourses = await db.purchase.findMany({
      where: { userId },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: { isPublished: true },
            },
          },
        },
      },
    });

    const courses = purchasedCourses.map(
      (purchasedCourse) => purchasedCourse.course
    ) as TCourseWithProgressAndCategory[];

    const coursePromises = courses.map(async (course) => {
      const progress = await getProgress(userId, course.id);
      course['progress'] = progress;
    });

    await Promise.all(coursePromises);
    const completedCourses = courses.filter(
      (course) => course.progress === 100
    );

    const coursesInProgress = courses.filter(
      (course) => (course.progress ?? 0) < 100
    );

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (err) {
    console.log('GET DASHBOARD COURSE ERROR', err);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};
