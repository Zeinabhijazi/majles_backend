import { Prisma } from '@generated/index';

export type OrdersType = Prisma.orderGetPayload<{
  include: {
    client: true,
    reader: true,
  },
  where: {
    OR: [
      {clientId: number,},
      {readerId: number,}
    ]
  }
}>;
