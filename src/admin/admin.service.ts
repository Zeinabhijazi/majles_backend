import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignReaderDto } from '@/dto/assignReader.dto';
import { OrderStatus, UserType } from '@generated/index';
import { UserTypeRes } from './model_structure/users_response';
import { OrderTypeRes } from './model_structure/orders_response';
import { PaginationDto } from '@/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthlyRegistrationStats(year?: number) {
    const targetYear = year || new Date().getFullYear();

    // Fetch only users created in the given year
    const users = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(`${targetYear}-01-01T00:00:00Z`),
          lt: new Date(`${targetYear + 1}-01-01T00:00:00Z`),
        },
      },
      select: { createdAt: true },
    });

    // Initialize stats for all 12 months
    const stats: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) {
      const key = `${targetYear}-${String(i).padStart(2, '0')}`;
      stats[key] = 0;
    }

    // Count registrations per month
    for (const user of users) {
      const date = new Date(user.createdAt);
      const month = date.getMonth() + 1;
      const key = `${date.getFullYear()}-${String(month).padStart(2, '0')}`;
      stats[key]++;
    }

    return stats;
  }

  async getAllUsers(
    page: number,
    pageSize: number,
    userType?: string,
    isDeleted?: string,
    search?: string,
  ): Promise<PaginationDto<UserTypeRes>> {
    const offset = (page - 1) * pageSize;
    const users = await this.prisma.user.findMany({
      where: {
        ...(userType && userType !== 'all'
          ? { userType: userType as UserType }
          : {}),
        ...(isDeleted && isDeleted !== 'all'
          ? { isDeleted: isDeleted === 'true' }
          : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                {
                  AND: search.includes(' ')
                    ? search.split(' ').map((part, i, arr) => {
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
        userType: true,
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
    });

    const itemsCount = await this.prisma.user.count({
      where: {
        ...(userType && userType !== 'all'
          ? { userType: userType as UserType }
          : {}),
        ...(isDeleted && isDeleted !== 'all'
          ? { isDeleted: isDeleted === 'true' }
          : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    });

    return {
      content: users,
      itemsCount,
      pageCount: Math.ceil(itemsCount / pageSize),
    } as PaginationDto<UserTypeRes>;
  }

  async deleteUserById(id: number): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.prisma.authToken.deleteMany({
      where: { userId: id },
    });

    await this.prisma.user.update({
      where: {
        id,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    return 'User deleted successfully';
  }

  async getAllOrders(
    page: number,
    pageSize: number,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PaginationDto<OrderTypeRes>> {
    const offset = (page - 1) * pageSize;
    let where: any = {};

    if (status && status !== "all") {
      if (status === "assigned") {
        where = {
          readerId: { not: null },
          status: OrderStatus.pending,
        }
      } 
      else if (status === "pending") {
        where = {
          readerId: null,
          status: OrderStatus.pending,
        }
      }
      else {
        where = { status: status as OrderStatus }
      }
    }

    // If both provided, use them directly as instants (no timezone conversion)
    if (startDate && endDate) {
      where.orderDate = { gte: startDate, lte: endDate };
    }

    const orders = await this.prisma.order.findMany({
      include: {
        client: true,
        reader: true,
      },
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: pageSize,
    });

    const itemsCount = await this.prisma.order.count({ where });

    const itemsCountWithDel = await this.prisma.order.count({
      where:{
        NOT: { status: 'deleted' },
      }
    });

    return {
      content: orders,
      itemsCount,
      itemsCountWithDel,
      pageCount: Math.ceil(itemsCount / pageSize),
    } as PaginationDto<OrderTypeRes>;
  }

  async assignReader(
    id: number,
    assignReaderDto: AssignReaderDto,
  ): Promise<any> {
    const newData = {
      readerId: assignReaderDto.readerId,
    };
    return this.prisma.order.update({
      where: { id },
      data: newData,
    });
  }
}
