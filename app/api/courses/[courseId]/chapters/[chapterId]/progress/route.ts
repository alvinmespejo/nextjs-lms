import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  const { userId } = auth();
  const { courseId, chapterId } = params;
  const { isCompleted } = await request.json();

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

    const userProgress = await db.userProgress.upsert({
      where: {
        chapterId_userId: {
          userId,
          chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId,
        chapterId,
        isCompleted,
      },
    });

    return NextResponse.json(userProgress, { status: 200 });
  } catch (err) {
    console.log('[COURSES CHAPTER PATCH PROGRESS]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
