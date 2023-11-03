import { db } from '@/lib/db';
import { Course, Purchase } from '@prisma/client';

type TPurchasedWithCourse = Purchase & {
  course: Course;
};

export const getAnalytics = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId,
        },
      },
      include: {
        course: true,
      },
    });

    const groudEarnings = groupByCourse(purchases);
    const data = Object.entries(groudEarnings).map(([title, price]) => ({
      name: title,
      total: price,
    }));

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = purchases.length;

    return {
      data,
      totalRevenue,
      totalSales,
    };
  } catch (err) {
    console.log('GET ANALYTICS ERROR', err);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};

const groupByCourse = (purchases: TPurchasedWithCourse[]) => {
  const group: { [courseTitle: string]: number } = {};

  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;
    if (!group[courseTitle]) {
      group[courseTitle] = 0;
    }
    group[courseTitle] += purchase.course.price!;
  });

  return group;
};
