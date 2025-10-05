import { Prisma } from "@generated/index";

export type UserType = Prisma.userGetPayload<{
    where: { 
        id: number
    },
    select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        addressOne: true,
        addressTwo: true, 
        country: true,
        city: true,
        postNumber: true,
        gender: true,
        userType: true,
        latitude: true,
        longitude: true,
    }
}> 
