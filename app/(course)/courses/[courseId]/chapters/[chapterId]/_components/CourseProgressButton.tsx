'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

import { useConfettiStore } from '@/hooks/useConfettiStore';

import { Button } from '@/components/ui/button';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ICourseProgressButtonProps {
  chapterId: string;
  courseId: string;
  nextChapterId?: string;
  isCompleted: boolean;
}
export const CourseProgressButton = ({
  chapterId,
  courseId,
  nextChapterId,
  isCompleted,
}: ICourseProgressButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const confetti = useConfettiStore();

  const Icon = isCompleted ? XCircle : CheckCircle;

  const onClick = async () => {
    try {
      setIsLoading(true);
      const resp = await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          isCompleted: !isCompleted,
        }
      );

      if (!isCompleted && !nextChapterId) {
        confetti.onOpen();
      }

      if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${chapterId}`);
      }

      toast.success('Course progress updated!');
      router.refresh();
    } catch (err) {
      toast.error(
        'An error occured while processing request. Please refresh and try again!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      type='button'
      variant={isCompleted ? 'outline' : 'success'}
      className='w-full md:w-auto'
    >
      {isCompleted ? 'Mark not complete' : 'Mark as complete'}
      <Icon className='w-4 h-4 ml-2' />
    </Button>
  );
};
