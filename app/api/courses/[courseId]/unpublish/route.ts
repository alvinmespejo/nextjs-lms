import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { isTeacher } from '@/lib/teacher';

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
    });

    if (!course) {
      return NextResponse.json('Invalid resource.', { status: 404 });
    }

    if (course.userId !== userId) {
      return NextResponse.json('Unauthorized access.', { status: 403 });
    }

    const unPublishCourse = await db.course.update({
      where: { id: courseId, userId },
      data: { isPublished: false },
    });

    return NextResponse.json(unPublishCourse);
  } catch (err) {
    console.log('[COURSE PATCH UNPUBLISH]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
