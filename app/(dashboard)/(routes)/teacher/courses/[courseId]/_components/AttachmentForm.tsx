'use client';

import * as z from 'zod';
import axios from 'axios';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Course, Attachment } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { File, ImageIcon, Loader2, Pencil, PlusCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/file-upload';
import Link from 'next/link';

interface IAttachmentFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
}

const AttachmentForm: React.FC<IAttachmentFormProps> = ({
  initialData,
  courseId,
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formSchema = z.object({
    url: z
      .string()
      .nullish()
      .transform((x) => x ?? undefined),
    name: z
      .string()
      .nullish()
      .transform((x) => x ?? undefined),
  });

  const toggleEdit = () => setIsEditing((current) => !current);

  const onDelete = async (id: string) => {
    try {
      setDeleteId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success('Course attachment deleted.');
      router.refresh();
    } catch (err) {
      toast.error(
        'An error occured while processing request. Please try again!'
      );
    } finally {
      setDeleteId(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, values);
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
        Course Attachments
        <Button onClick={toggleEdit} variant='ghost'>
          {isEditing && <>Cancel</>}

          {!isEditing && (
            <>
              <PlusCircle className='h-4 w-4 mr-2' /> Add file(s)
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <>
          {initialData.attachments?.length <= 0 && (
            <p className='text-sm mt-2 text-slate-500 italic'>No attachments</p>
          )}

          {initialData.attachments?.length > 0 && (
            <div className='space-y-2'>
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className='
                    flex 
                    items-center 
                    p-3 
                    w-full 
                    bg-sky-100 
                    border 
                    border-sky-200 
                    text-sky-700 
                    rounded-md'
                >
                  <File className='h-4 w-4 mr-2 flex-shrink-0' />
                  <Link href={attachment.url} target='_blank'>
                    <p className='text-sm line-clamp-1'>{attachment.name}</p>
                  </Link>
                  {deleteId === attachment.id && (
                    <>
                      <Loader2 className='w-4 h-4 ml-auto animate-spin' />
                    </>
                  )}
                  {deleteId !== attachment.id && (
                    <>
                      <button
                        onClick={() => onDelete(attachment.id)}
                        className='ml-auto hover:opacity-75 transition'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isEditing && (
        <div>
          <FileUpload
            endpoint='courseAttachment'
            onChange={(url, name) => {
              if (url) onSubmit({ url, name });
            }}
          />
          <div className='text-sm text-muted-foreground mt-4'>
            Add resources for your student to complete the course.
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentForm;
