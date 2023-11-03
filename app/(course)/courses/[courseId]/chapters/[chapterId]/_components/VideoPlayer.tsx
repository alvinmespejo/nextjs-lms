'use client';

import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';

import { cn } from '@/lib/utils';
import { useConfettiStore } from '@/hooks/useConfettiStore';

interface IVideoPlayerProps {
  title: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  playbackId?: string;
  isLocked: Boolean;
  completeOnEnd: Boolean;
}

export const VideoPlayer = ({
  title,
  courseId,
  chapterId,
  nextChapterId,
  playbackId,
  isLocked,
  completeOnEnd,
}: IVideoPlayerProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isReady, setIsReady] = useState<boolean>(false);

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            isCompleted: true,
          }
        );

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success('Course progress updated!');
        router.refresh();
        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch {
      toast.error(
        'An error occurred while processing request. Please refresh the page and try again!'
      );
    }
  };

  return (
    <div className='relative aspect-video'>
      {!isReady && !isLocked && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-800'>
          <Loader2 className='h-8 w-8 animate-spin text-secondary' />
        </div>
      )}

      {isLocked && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary'>
          <Lock className='h-8 w-8' />
          <p className='text-sm'>This chapter is locked</p>
        </div>
      )}

      {!isLocked && (
        <MuxPlayer
          autoPlay
          title={title}
          className={cn(!isReady && 'hidden')}
          onCanPlay={() => setIsReady(true)}
          playbackId={playbackId}
          onEnded={onEnd}
        />
      )}
    </div>
  );
};
