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
      include: {
        muxData: true,
      },
    });

    if (!chapter) {
      return NextResponse.json('Invalid resource.', { status: 404 });
    }

    if (
      !chapter.muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    ) {
      return NextResponse.json('Missing required fields.', { status: 422 });
    }

    const publishedChapter = await db.chapter.update({
      where: { id: chapterId, courseId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishedChapter);
  } catch (err) {
    console.log('[COURSES CHAPTER PATCH PUBLISH]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
