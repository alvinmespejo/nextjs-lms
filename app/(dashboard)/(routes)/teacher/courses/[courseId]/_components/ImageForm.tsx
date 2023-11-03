'use client';

import * as z from 'zod';
import axios from 'axios';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Course } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { ImageIcon, Pencil, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/file-upload';

interface IImageFormProps {
  initialData: Course;
  courseId: string;
}

const ImageForm: React.FC<IImageFormProps> = ({ initialData, courseId }) => {
  const router = useRouter();
  const formSchema = z.object({
    imageUrl: z.string().min(1, {
      message: 'Image cover is required.',
    }),
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success('Course updated.');
      toggleEdit();
      router.refresh();
    } catch (err) {
      toast.error(
        'An error occured while processing request. Please try again!'
      );
    }
  };

  return (
    <div className='mt-6 border bg-slate-100 rounded-md p-4'>
      <div className='font-medium flex items-center justify-between'>
        Course Image
        <Button onClick={toggleEdit} variant='ghost'>
          {isEditing && <>Cancel</>}

          {!isEditing && !initialData?.imageUrl && (
            <>
              <PlusCircle className='h-4 w-4 mr-2' /> Add image
            </>
          )}

          {!isEditing && initialData.imageUrl && (
            <>
              <Pencil className='h-4 w-4 mr-2' /> Edit
            </>
          )}
        </Button>
      </div>

      {!isEditing &&
        (!initialData.imageUrl ? (
          <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
            <ImageIcon className='h-10 w-10 text-slate-500' />
          </div>
        ) : (
          <>
            <div className='relative aspect-video mmt-2'>
              <Image fill alt='FileUpload' src={initialData.imageUrl} />
            </div>
          </>
        ))}

      {isEditing && (
        <div>
          <FileUpload
            endpoint='courseImage'
            onChange={(url) => {
              if (url) onSubmit({ imageUrl: url });
            }}
          />
          <div className='text-sm text-muted-foreground mt-4'>
            16:9 aspect ration recommended
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageForm;
