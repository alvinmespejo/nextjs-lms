'use client';

import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Course } from '@prisma/client';

interface IDescriptionFormProps {
  initialData: Course;
  courseId: string;
}

const DescriptionForm: React.FC<IDescriptionFormProps> = ({
  initialData,
  courseId,
}) => {
  const router = useRouter();
  const formSchema = z.object({
    description: z.string().min(4, {
      message: 'Description is required.',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || '',
    },
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { isSubmitting, isValid } = form.formState;

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
        Course Description
        <Button onClick={toggleEdit} variant='ghost'>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className='h-4 w-4 mr-2' /> Edit
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className='text-sm mt-2'>{initialData.description}</p>}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 mt-4'
          >
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="e.g. 'This course is about...'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-center gap-x-2'>
              <Button disabled={!isValid || isSubmitting} type='submit'>
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default DescriptionForm;
