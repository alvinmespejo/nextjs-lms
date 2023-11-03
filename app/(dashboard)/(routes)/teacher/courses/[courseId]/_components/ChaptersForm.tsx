'use client';

import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Pencil, PlusCircle } from 'lucide-react';
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
import { Chapter, Course } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ChaptersList, { IReOrder } from './ChaptersList';

interface IChaptersFormProps {
  initialData: Course & { chapters: Chapter[] };
  courseId: string;
}

const ChaptersForm: React.FC<IChaptersFormProps> = ({
  initialData,
  courseId,
}) => {
  const router = useRouter();
  const formSchema = z.object({
    title: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { isSubmitting, isValid } = form.formState;

  const toggleCreating = () => setIsCreating((current) => !current);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters`, values);
      form.reset();
      toast.success('Chapter created.');
      toggleCreating();
      router.refresh();
    } catch (err) {
      toast.error(
        'An error occured while processing request. Please try again!'
      );
    }
  };

  const onReOrder = async (updateData: IReOrder[]) => {
    try {
      setIsUpdating(true);
      await axios.put(`/api/courses/${courseId}/chapters/reorder`, {
        list: updateData,
      });
      router.refresh();
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${id}`);
  };

  return (
    <div className='relative mt-6 border bg-slate-100 rounded-md p-4'>
      {isUpdating && (
        <div className='absolute w-full h-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center'>
          <Loader2 className='h-6 w-6 animate-spin text-sky-700' />
        </div>
      )}

      <div className='font-medium flex items-center justify-between'>
        Course Description
        <Button onClick={toggleCreating} variant='ghost'>
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className='h-4 w-4 mr-2' /> Add Chapter
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 mt-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction to the course'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type='submit'>
              Create
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            'text-sm mt-2',
            !initialData.chapters.length && 'text-slate-500 italic'
          )}
        >
          {!initialData.chapters.length && 'No Chapters'}
          <ChaptersList
            onEdit={onEdit}
            onReOrder={onReOrder}
            items={initialData.chapters || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className='text-sm text-muted-foreground mt-4'>
          Drag and drop to reorder the chapters
        </p>
      )}
    </div>
  );
};

export default ChaptersForm;
