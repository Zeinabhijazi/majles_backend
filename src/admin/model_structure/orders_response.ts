import { Prisma } from "@generated/index";

export type OrderTypeRes = Prisma.orderGetPayload<{
    include: {
        client: true,
        reader: true,
    },
    where: {
        isDeleted: false,
    },
    orderBy: {
        createdAt: 'desc',
    },
}> 