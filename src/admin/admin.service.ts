import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AssignReaderDto } from '@/dto/assignReader.dto';
import { UserType } from '@generated/index';
import { UserTypeRes } from './model_structure/users_response';
import { OrderTypeRes } from './model_structure/orders_response';
import { PaginationDto } from '@/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {} 
  
  async getAllOrders(
    page: number,
    pageSize: number,
    status?: string, 
    startDate?: Date, 
    endDate?: Date 
  ): Promise <PaginationDto<OrderTypeRes>> {
    const offset = (page - 1) * pageSize;
    let where: any = { isDeleted: false };
    if (status && status !== "all") {
      if (status === "assigned") {
        where.isAccepted = true;
      } else if (status === "notAssigned") {
        where.isAccepted = false;
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

    const itemsCount = await this.prisma.order.count();
    const itemsCountWithDel = await this.prisma.order.count({
      where: { isDeleted : false }
    });
    
    return {
      content: orders,
      itemsCount,
      itemsCountWithDel,
      pageCount: Math.ceil(itemsCount / pageSize)
    } as PaginationDto<OrderTypeRes>
  }

  async getAllUsers(
    page: number,
    pageSize: number,
    userType?: string,
    isDeleted?: string,
    search?: string
  ): Promise <PaginationDto<UserTypeRes>> {
    const offset = (page - 1) * pageSize;
    const users = await this.prisma.user.findMany({
      where: {
      ...(userType &&  userType !=="all"
        ? { userType: userType as UserType } 
        : {}),
      ...(isDeleted && isDeleted !== "all"
        ? { isDeleted: isDeleted === "true" } 
        : {}),
      ...(search
        ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
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

    const itemsCount = await this.prisma.user.count();

    return {
      content: users,
      itemsCount,
      pageCount: Math.ceil(itemsCount / pageSize)
    } as PaginationDto<UserTypeRes>
  }

  async deleteUserById(id: number) : Promise<string> {
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
         isDeleted: false 
        },
      data: { 
        isDeleted: true 
      }, 
    });

    return 'User deleted successfully';
  }

  async assignReader(id: number, assignReaderDto: AssignReaderDto): Promise<any>{    
    const newData = {
      readerId: assignReaderDto.readerId,
      isAccepted: true,
    }
    return this.prisma.order.update({
      where: { id },
      data: newData,
    });
  }
}
