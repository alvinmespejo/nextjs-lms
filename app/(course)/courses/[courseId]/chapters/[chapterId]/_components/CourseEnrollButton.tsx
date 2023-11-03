'use client';

import { Button } from '@/components/ui/button';
import { priceFormat } from '@/lib/priceFormat';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ICourseEnrollButtonProps {
  courseId: string;
  price: number;
}

export const CourseEnrollButton = ({
  courseId,
  price,
}: ICourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const resp = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.assign(resp.data.url);
    } catch (err) {
      console.log(err);
      toast.error(
        'An error occured while processing request. Please try again!'
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      size='sm'
      className='w-full md:w-auto'
      disabled={isLoading}
      onClick={onClick}
    >
      Enroll for {priceFormat(price)}
    </Button>
  );
};
