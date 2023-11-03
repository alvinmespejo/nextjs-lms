import { db } from '@/lib/db';
import { Attachment, Chapter } from '@prisma/client';

interface IGetChaperProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export const GetChaper = async ({
  userId,
  courseId,
  chapterId,
}: IGetChaperProps) => {
  try {
    const purchaseProm = db.purchase.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    const courseProm = db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
      select: {
        price: true,
      },
    });

    const chapterProm = db.chapter.findUnique({
      where: {
        id: chapterId,
        isPublished: true,
      },
    });

    const [purchase, course, chapter] = await Promise.all([
      purchaseProm,
      courseProm,
      chapterProm,
    ]);

    if (!course || !chapter) {
      throw new Error('Chapter or course is not found.');
    }

    let muxData = null;
    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (purchase) {
      attachments = await db.attachment.findMany({
        where: { courseId },
      });
    }

    if (chapter.isFree || purchase) {
      const muxDataProm = db.muxData.findUnique({
        where: { chapterId },
      });

      const nextChapterProm = db.chapter.findFirst({
        where: {
          courseId,
          isPublished: true,
          position: { gt: chapter?.position },
        },
      });

      [muxData, nextChapter] = await Promise.all([
        muxDataProm,
        nextChapterProm,
      ]);
    }

    const userProgress = await db.userProgress.findUnique({
      where: {
        chapterId_userId: {
          chapterId,
          userId,
        },
      },
    });

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (err) {
    console.log(err);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: null,
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
