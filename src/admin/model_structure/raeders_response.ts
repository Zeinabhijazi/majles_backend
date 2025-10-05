import { Prisma, UserType } from "@generated/index";

export type ReaderTypeRes = Prisma.userGetPayload<{
    where: {
        userType: UserType,
        isDeleted: false,
    },
    select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        email: true,
        addressOne: true,
        addressTwo: true, 
        country: true,
        city: true,
        postNumber: true,
        gender: true,
        latitude: true,
        longitude: true,
        isDeleted: true,
    },
    orderBy: {
        createdAt: 'desc',
    },
}>;