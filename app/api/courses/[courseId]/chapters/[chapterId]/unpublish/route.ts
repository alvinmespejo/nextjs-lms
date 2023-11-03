import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  const { userId } = auth();
  const { courseId, chapterId } = params;

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  if (!courseId || !chapterId) {
    return NextResponse.json('Invalid resource.', { status: 422 });
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json('Invalid resource.', { status: 404 });
    }

    if (course.userId !== userId) {
      return NextResponse.json('Unauthorized access.', { status: 403 });
    }

    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return NextResponse.json('Invalid resource.', { status: 404 });
    }

    const unpublishedChapter = await db.chapter.update({
      where: { id: chapterId, courseId },
      data: { isPublished: false },
    });

    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
    });

    if (!publishedChapters.length) {
      await db.course.update({
        where: { id: courseId },
        data: { isPublished: false },
      });
    }
    return NextResponse.json(unpublishedChapter);
  } catch (err) {
    console.log('[COURSES CHAPTER PATCH UNPUBLISH]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
