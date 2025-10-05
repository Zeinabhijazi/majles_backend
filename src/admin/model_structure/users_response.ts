import { Prisma } from "@generated/index";

export type UserTypeRes = Prisma.userGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    userType: true;
    phoneNumber: true;
    email: true;
    addressOne: true;
    addressTwo: true;
    country: true;
    city: true;
    postNumber: true;
    gender: true;
    latitude: true;
    longitude: true;
    isDeleted: true;
  };
}>;