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

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  const { userId } = auth();
  const { courseId, chapterId } = params;

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  if (userId && !isTeacher(userId)) {
    return NextResponse.json('Unauthorized access', { status: 403 });
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

    if (chapter?.videoUrl) {
      const existingMuxData = chapter?.muxData;
      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: { id: existingMuxData.id },
        });
      }

      let urlChunk = chapter.videoUrl?.split('/');
      if (urlChunk && urlChunk.length > 0) {
        await new UTApi().deleteFiles(urlChunk[urlChunk.length - 1]);
      }
    }

    await db.chapter.delete({
      where: { id: chapterId, courseId },
    });

    const publishsedChapters = await db.chapter.findMany({
      where: { courseId, isPublished: true },
    });

    if (!publishsedChapters.length) {
      await db.course.update({
        where: { id: courseId },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json('Chapter deleted');
  } catch (err) {
    console.log('[COURSES CHAPTER DELETE]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: { courseId: string; chapterId: string };
  }
) {
  const { userId } = auth();
  const { courseId, chapterId } = params;
  const { isPublished, ...values } = await request.json();

  if (!userId) {
    return NextResponse.json('Unauthenticated request.', { status: 401 });
  }

  if (!courseId || !chapterId) {
    return NextResponse.json('Invalid resource.', { status: 422 });
  }

  try {
    const currentChapterData = await db.chapter.findFirst({
      where: { id: chapterId },
    });

    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        ...values,
      },
    });

    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: { chapterId },
      });

      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: { id: existingMuxData.id },
        });
      }

      if (currentChapterData) {
        const urlKey = currentChapterData.videoUrl;
        let urlChunk = urlKey?.split('/');
        if (urlChunk && urlChunk.length > 0) {
          await new UTApi().deleteFiles(urlChunk[urlChunk.length - 1]);
        }
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: 'public',
        test: false,
      });

      await db.muxData.create({
        data: {
          chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (err) {
    console.log('[COURSES CHAPTER PATCH]', err);
    return NextResponse.json('An error occurred while processing request.', {
      status: 500,
    });
  }
}
