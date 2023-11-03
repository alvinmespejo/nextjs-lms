'use client';

import toast from 'react-hot-toast';
import { UploadDropzone } from '@/lib/uploadthing';

import { ourFileRouter } from '@/app/api/uploadthing/core';

interface IFileUploadProps {
  onChange: (url?: string, name?: string) => void;
  endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, endpoint }: IFileUploadProps) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url, res?.[0].name);
      }}
      onUploadError={(err: Error) => {
        toast.error(
          'An error occrred whilep processing request. Please try again!'
        );
      }}
    />
  );
};
