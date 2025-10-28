import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserCounts } from './dashboard_types/dashboard_types';
import { PaginationDto } from '@/dto/pagination.dto';
import { UserTypeRes } from '@/admin/model_structure/users_response';
import { UserType } from '@generated/index';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserCounts(): Promise<UserCounts> {
    const where = {
      isDeleted: false,
    };

    const [readers, clients] = await Promise.all([
      this.prisma.user.count({ where: { ...where, userType: 'reader' } }),
      this.prisma.user.count({ where: { ...where, userType: 'client' } }),
    ]);

    return { readers, clients };
  }

  async getAllReaders(
    page: number,
    pageSize: number,
    userType: string,
    search?: string,
    name?: string,
  ): Promise<PaginationDto<UserTypeRes>> {
    const offset = (page - 1) * pageSize;
    const users = await this.prisma.user.findMany({
      where: {
        ...(userType && userType !== 'all'
          ? { userType: userType as UserType }
          : {}),
        ...(search
          ? {
              OR: [
                { country: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(name
          ? {
              OR: [
                { firstName: { contains: name, mode: 'insensitive' } },
                { lastName: { contains: name, mode: 'insensitive' } },
                {
                  AND: name.includes(' ')
                    ? name.split(' ').map((part, i, arr) => {
                        if (arr.length === 2) {
                          return i === 0
                            ? {
                                firstName: {
                                  contains: part,
                                  mode: 'insensitive',
                                },
                              }
                            : {
                                lastName: {
                                  contains: part,
                                  mode: 'insensitive',
                                },
                              };
                        }
                        return {};
                      })
                    : undefined,
                },
              ],
            }
          : {}),
      },
      skip: offset,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        addressOne: true,
        addressTwo: true,
        country: true,
        city: true,
        postNumber: true,
        gender: true,
        latitude: true,
        longitude: true,
      },
    });

    const itemsCount = await this.prisma.user.count({
      where: {
        userType: 'reader',
      },
    });

    return {
      content: users,
      itemsCount,
      pageCount: Math.ceil(itemsCount / pageSize),
    } as PaginationDto<UserTypeRes>;
  }
}
