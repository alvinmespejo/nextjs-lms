import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { isTeacher } from '@/lib/teacher';

export async function POST(request: Request) {
  const { userId } = auth();
  const { title } = await request.json();

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  if (userId && !isTeacher(userId)) {
    return NextResponse.json('Unauthorized access', { status: 403 });
  }

  try {
    const course = await db.course.create({
      data: { userId, title },
    });

    return NextResponse.json(course);
  } catch (err) {
    console.log('[COURSES POST]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
