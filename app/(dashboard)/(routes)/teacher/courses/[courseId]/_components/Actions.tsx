'use client';

import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { Button } from '@/components/ui/button';
import { useConfettiStore } from '@/hooks/useConfettiStore';
import axios from 'axios';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface IActionsProps {
  courseId: string;
  disabled: boolean;
  isPublished: boolean;
}

export const Actions = ({ courseId, disabled, isPublished }: IActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onClick = async () => {
    setIsLoading(true);
    try {
      if (isPublished) {
        await axios.patch(`/api/courses/${courseId}/unpublish`);
        toast.success('Course unpublish.');
      } else {
        await axios.patch(`/api/courses/${courseId}/publish`);
        toast.success('Course published.');
        confetti.onOpen();
      }
      router.refresh();
    } catch (err) {
      toast.error(
        'An error occured while processing request. Please try again!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/courses/${courseId}`);
      toast.success('Course deleted.');
      router.refresh();
      router.push(`/teacher/courses`);
    } catch (err) {
      toast.error(
        'An error occured while processing request. Please try again!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center gap-x-2'>
      <Button
        onClick={onClick}
        variant='outline'
        disabled={disabled || isLoading}
        size='sm'
      >
        {isPublished ? 'Unpublished' : 'Publish'}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size='sm' disabled={isLoading}>
          <Trash className='h-4 w-4' />
        </Button>
      </ConfirmModal>
    </div>
  );
};
