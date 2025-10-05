import { Prisma } from '@generated/index';

export type UserDataType = Prisma.authTokenGetPayload<{
  include: {
    user: true,
  },
  where: {
    id: string;
  },
}>;
