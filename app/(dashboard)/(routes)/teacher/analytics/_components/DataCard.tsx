import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { priceFormat } from '@/lib/priceFormat';

interface IDataCardProps {
  value: number;
  label: string;
  shouldFormat?: boolean;
}
export const DataCard = ({ value, label, shouldFormat }: IDataCardProps) => {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>{shouldFormat ? priceFormat(value) : value}</div>
      </CardContent>
    </Card>
  );
};
