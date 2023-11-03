'use client';

import Image from 'next/image';

const Logo = () => {
  return (
    <div className='h-[32px]'>
      <Image height={130} width={130} alt='LMS Logo' src='/logo.svg' />
    </div>
  );
};

export default Logo;
