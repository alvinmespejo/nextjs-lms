import Mux from '@mux/mux-node';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';

import { db } from '@/lib/db';
import { isTeacher } from '@/lib/teacher';

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { userId } = auth();
  const { courseId } = params;
  const values = await request.json();

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  if (userId && !isTeacher(userId)) {
    return NextResponse.json('Unauthorized access', { status: 403 });
  }

  try {
    const course = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(course);
  } catch (err) {
    console.log('[COURSES PATCH]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { userId } = auth();
  const { courseId } = params;

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId, userId },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
        attachments: true,
      },
    });

    if (!course) {
      return NextResponse.json('Invalid resource.', { status: 404 });
    }

    if (course.userId !== userId) {
      return NextResponse.json('Unauthorized access.', { status: 403 });
    }

    // delete muxVideo assets
    let attachmentUrlChunk: string[] = [];
    const muxVidPomises = course.chapters?.map(async (chapter) => {
      if (chapter.videoUrl) {
        let urlChunk = chapter.videoUrl?.split('/');
        if (urlChunk && urlChunk.length > 0) {
          attachmentUrlChunk.push(urlChunk[urlChunk.length - 1]);
        }
      }

      if (chapter.muxData?.assetId) {
        return await Video.Assets.del(chapter.muxData?.assetId);
      }
    });

    await Promise.all(muxVidPomises);

    // delete attachment assets
    course.attachments?.map((attachment) => {
      if (attachment.url) {
        let urlChunk = attachment.url?.split('/');
        if (urlChunk && urlChunk.length > 0) {
          attachmentUrlChunk.push(urlChunk[urlChunk.length - 1]);
        }
      }
    });

    // course cover image
    if (course.imageUrl) {
      let urlChunk = course.imageUrl?.split('/');
      if (urlChunk && urlChunk.length) {
        attachmentUrlChunk.push(urlChunk[urlChunk.length - 1]);
      }
    }

    if (attachmentUrlChunk.length) {
      await new UTApi().deleteFiles(attachmentUrlChunk);
    }

    await db.course.delete({
      where: { id: courseId, userId },
    });

    return NextResponse.json('Course deleted', { status: 200 });
  } catch (err) {
    console.log('[COURSE DELETE]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
