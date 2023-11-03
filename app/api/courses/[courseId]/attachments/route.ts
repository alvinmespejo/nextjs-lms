import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

import { isTeacher } from '@/lib/teacher';

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { userId } = auth();
  const { courseId } = params;
  const { url, name } = await request.json();

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
      return NextResponse.json('Invalid/missing resource.', { status: 404 });
    }

    if (course.userId !== userId) {
      return NextResponse.json('Unauthorized access.', { status: 403 });
    }

    const attachment = await db.attachment.create({
      data: {
        url,
        name,
        courseId,
      },
    });

    return NextResponse.json(attachment);
  } catch (err) {
    console.log('[COURSES ATTACHMENT PATCH]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
