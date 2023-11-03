import { UTApi } from 'uploadthing/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import { db } from '@/lib/db';
import { isTeacher } from '@/lib/teacher';

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  const { userId } = auth();
  const { courseId, attachmentId } = params;

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  if (userId && !isTeacher(userId)) {
    return NextResponse.json('Unauthorized access', { status: 403 });
  }

  if (!courseId || !attachmentId) {
    return NextResponse.json('Invalid resource.', { status: 422 });
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        attachments: {
          where: {
            id: attachmentId,
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

    if (course.attachments.length > 0) {
      const urlKey = course.attachments[0].url;
      let urlChunk = urlKey.split('/');
      if (urlChunk.length > 0) {
        await new UTApi().deleteFiles(urlChunk[urlChunk.length - 1]);
      }
    }

    await db.attachment.delete({
      where: {
        id: attachmentId,
        courseId,
      },
    });

    return NextResponse.json('Attachment deleted');
  } catch (err) {
    console.log('[COURSES ATTACHMENT DELETE]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
