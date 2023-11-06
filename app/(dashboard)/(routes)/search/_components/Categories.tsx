'use client';

import { Category } from '@prisma/client';
import {
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
} from 'react-icons/fc';
import { IconType } from 'react-icons';

import { CategoryItem } from './CategoryItem';

interface ICategoriesProps {
  items: Category[];
}

const iconMap: Record<Category['name'], IconType> = {
  Music: FcMusic,
  Photography: FcOldTimeCamera,
  Fitness: FcSportsMode,
  Accounting: FcSalesPerformance,
  'Computer Science': FcMultipleDevices,
  Filming: FcFilmReel,
  Engineering: FcEngineering,
};

export const Categories = ({ items }: ICategoriesProps) => {
  return (
    <div className='flex items-center gap-x-2 overflow-x-auto pb-2'>
      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          value={item.id}
          icon={iconMap[item.name]}
        />
      ))}
    </div>
  );
};
