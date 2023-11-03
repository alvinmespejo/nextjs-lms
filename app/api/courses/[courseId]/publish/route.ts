import { db } from '@/lib/db';
import { isTeacher } from '@/lib/teacher';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { userId } = auth();
  const { courseId } = params;

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  if (userId && !isTeacher(userId)) {
    return NextResponse.json('Unauthorized access', { status: 403 });
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json('Invalid resource.', { status: 404 });
    }

    if (course.userId !== userId) {
      return NextResponse.json('Unauthorized access.', { status: 403 });
    }

    const hasPublishedChapters = course.chapters.some(
      (chapter) => chapter.isPublished
    );

    if (
      !hasPublishedChapters ||
      !course.description ||
      !course.imageUrl ||
      !course.categoryId ||
      !course.title
    ) {
      return NextResponse.json('Missing required fields.', { status: 422 });
    }

    const publishCourse = await db.course.update({
      where: { id: courseId, userId },
      data: { isPublished: true },
    });

    return NextResponse.json(publishCourse);
  } catch (err) {
    console.log('[COURSE PATCH PUBLISH]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
