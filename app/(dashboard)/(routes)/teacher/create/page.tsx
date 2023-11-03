'use client';

import * as z from 'zod';
import axios from 'axios';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CoursesPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formSchema = z.object({
    title: z.string().min(4, {
      message: 'Title is required.',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const { isValid } = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`/api/courses`, values);
      router.push(`/teacher/courses/${response.data?.id}`);
      toast.success('Course created.');
    } catch (err) {
      setIsSubmitting(false);
      toast.error(
        'An error occured while processing request. Please try again!'
      );
    }
  };

  return (
    <div
      className='
      max-w-5xl 
      mx-auto 
      flex 
      md:items-center 
      md:justify-center 
      h-full 
      p-6'
    >
      <div>
        <h1 className='text-2xl'>Name your course</h1>
        <p className='text-sm text-slate-600'>
          What would you like to name your course? Don&apos;t worry you can
          change it later.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8 mt-8'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder='e.g. Advance web development'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What will you teach in this course.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-center gap-x-2'>
              <Button type='button' variant='outline' disabled={isSubmitting}>
                <Link href='/teacher/courses'>Cancel</Link>
              </Button>
              <Button type='submit' disabled={isSubmitting || !isValid}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CoursesPage;
