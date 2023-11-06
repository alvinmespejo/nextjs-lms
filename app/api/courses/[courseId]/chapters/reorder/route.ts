import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { userId } = auth();
  const { courseId } = params;
  const { list } = await request.json();

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  if (!list.length) {
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

    for (let item of list) {
      await db.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }

    return NextResponse.json({ status: 200 });
  } catch (err) {
    console.log('[COURSES CHAPTER REODER PUT]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
