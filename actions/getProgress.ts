import { db } from '@/lib/db';

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const publishedChapters = await db.chapter.findMany({
      where: { courseId, isPublished: true },
      select: { id: true },
    });

    const chapterIds = publishedChapters.map((c) => c.id);
    const completedChapters = await db.userProgress.count({
      where: {
        userId,
        chapterId: {
          in: chapterIds,
        },
        isCompleted: true,
      },
    });

    return (completedChapters / chapterIds.length) * 100;
  } catch (err) {
    console.log('Error getting course progress.', err);
    return 0;
  }
};
