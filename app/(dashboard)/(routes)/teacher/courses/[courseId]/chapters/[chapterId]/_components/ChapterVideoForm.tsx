'use client';

import * as z from 'zod';
import axios from 'axios';
import MuxPlayer from '@mux/mux-player-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Chapter, MuxData } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Pencil, PlusCircle, VideoIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/file-upload';

interface IChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}

const ChapterVideoForm: React.FC<IChapterVideoFormProps> = ({
  initialData,
  courseId,
  chapterId,
}) => {
  const router = useRouter();
  const formSchema = z.object({
    videoUrl: z.string().min(1),
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleEdit = () => setIsEditing((current) => !current);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values
      );
      toast.success('Chapter updated.');
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
        Chapter Video
        <Button onClick={toggleEdit} variant='ghost'>
          {isEditing && <>Cancel</>}

          {!isEditing && !initialData?.videoUrl && (
            <>
              <PlusCircle className='h-4 w-4 mr-2' /> Add video
            </>
          )}

          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className='h-4 w-4 mr-2' /> Edit
            </>
          )}
        </Button>
      </div>

      {!isEditing &&
        (!initialData.videoUrl ? (
          <div className='flex items-center justify-center h-60 bg-slate-200 rounded-md'>
            <VideoIcon className='h-10 w-10 text-slate-500' />
          </div>
        ) : (
          <>
            <div className='relative aspect-video mmt-2'>
              <MuxPlayer playbackId={initialData?.muxData?.playbackId || ''} />
            </div>
          </>
        ))}

      {isEditing && (
        <div>
          <FileUpload
            endpoint='chapterVideo'
            onChange={(url) => {
              if (url) onSubmit({ videoUrl: url });
            }}
          />
          <div className='text-sm text-muted-foreground mt-4'>
            Upload video for this chapter
          </div>
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className='text-sm text-muted-foreground mt-2'>
          Videos can take a fiew minutes to process. Refresh the page if video
          does not appear.
        </div>
      )}
    </div>
  );
};

export default ChapterVideoForm;
