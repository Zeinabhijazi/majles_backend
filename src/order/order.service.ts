import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UserContextService } from '@/singleton/user-context.service';
import { OrderDto } from '@/dto/order.dto';
import { normalizeDate } from '@/normalizeDate/normalize_date';
import { PrismaClientKnownRequestError } from '@generated/runtime/library';
import { OrderStatus, UserType } from '@generated/index';
import { OrdersStatus } from './orders-type/orderStatus_type';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(UserContextService)
    private readonly user: UserContextService,
  ) {}

  // Create order
  async createOrder(dto: OrderDto) {
    try {
      const userId = this.user.user.id; // Getting user id from singleton

      return this.prisma.order.create({
        data: {
          clientId: userId,
          readerId: dto.readerId ?? null,
          orderDate: normalizeDate(dto.orderDate),
          longitude: dto.longitude,
          latitude: dto.latitude,
          addressOne: dto.addressOne,
          addressTwo: dto.addressTwo,
          postNumber: dto.postNumber,
          country: dto.country,
          city: dto.city,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('This order is already exist.');
        }
      }
      throw error;
    }
  }

  async getOrderStatus(): Promise<OrdersStatus> {
    const accepted = await this.prisma.order.count({
      where: { status: 'accepted' },
    });
    const deleted = await this.prisma.order.count({
      where: { status: 'deleted' },
    });
    const pending = await this.prisma.order.count({
      where: { status: 'pending' },
    });
    const completed = await this.prisma.order.count({
      where: { status: 'completed' },
    });
    const rejected = await this.prisma.order.count({
      where: { status: 'rejected' },
    });

    return { accepted, deleted, pending, completed, rejected };
  }

  // Get all the orders of the logged in user
  async getOrdersById(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
    thisMonth?: boolean,
  ) {
    const userId = this.user.user.id;
    const offset = (page - 1) * pageSize;
    if (this.user.user.userType === UserType.client) {
      const andConditions: any[] = [{ clientId: userId }];

      if (status && status !== 'all') {
        andConditions.push({
          status: status as OrderStatus,
        });
      }
      
      if (search?.trim()) {
        const [firstPart, lastPart] = search.trim().split(' ');
        const nameFilters: any[] = [
          {
            reader: {
              firstName: { contains: search, mode: 'insensitive' },
            },
          },
          {
            reader: {
              lastName: { contains: search, mode: 'insensitive' },
            },
          },
        ];

        // Handle full name (e.g. "Zeinab Hijazi")
        if (lastPart) {
          nameFilters.push({
            reader: {
              AND: [
                { firstName: { contains: firstPart, mode: 'insensitive' } },
                { lastName: { contains: lastPart, mode: 'insensitive' } },
              ],
            },
          });
        }

        // Combine with existing AND filters
        andConditions.push({ OR: nameFilters });
      }
      const where = { AND: andConditions };
      const orders = await this.prisma.order.findMany({
        include: { client: true, reader: true },
        where,
        skip: offset,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });
      const itemsCount = await this.prisma.order.count({ where });
      return {
        content: orders,
        itemsCount,
        pageCount: Math.ceil(itemsCount / pageSize),
      };
    } else {
      let where: any = { readerId: userId };

      if (status === OrderStatus.pending) {
        where = {
          ...where,
          status: OrderStatus.pending,
        };
      }

      if (thisMonth) {
        const now = new Date();
        const startOfMonthUTC = new Date(
          Date.UTC(now.getFullYear(), now.getMonth(), 1),
        );
        const endOfMonthUTC = new Date(
          Date.UTC(now.getFullYear(), now.getMonth() + 1, 1),
        );

        where = {
          ...where,
          orderDate: {
            gte: startOfMonthUTC,
            lt: endOfMonthUTC,
          },
          status: OrderStatus.accepted,
        };
      }

      const orders = await this.prisma.order.findMany({
        include: { client: true, reader: true },
        where,
        skip: offset,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      });

      // Counts in parallel
      const [
        itemsCount,
        pendingItemsCount,
        completedItemsCount,
        acceptedItemsCount,
        rejectedItemsCount,
      ] = await Promise.all([
        this.prisma.order.count({ where }),
        this.prisma.order.count({
          where: { readerId: userId, status: OrderStatus.pending },
        }),
        this.prisma.order.count({
          where: { readerId: userId, status: OrderStatus.completed },
        }),
        this.prisma.order.count({
          where: { readerId: userId, status: OrderStatus.accepted },
        }),
        this.prisma.order.count({
          where: { readerId: userId, status: OrderStatus.rejected },
        }),
      ]);
      return {
        content: orders,
        itemsCount,
        pageCount: Math.ceil(itemsCount / pageSize),
        pendingItemsCount,
        completedItemsCount,
        acceptedItemsCount,
        rejectedItemsCount,
      };
    }
  }

  // Update an order
  async updateOrderById(id: number, orderDto: OrderDto) {
    // If user is client --> change info for order
    if (this.user.user.userType === UserType.client) {
      const order = await this.prisma.order.findFirstOrThrow({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const orderNewData = {
        addressOne: orderDto.addressOne,
        addressTwo: orderDto.addressTwo,
        country: orderDto.country,
        city: orderDto.city,
        postNumber: orderDto.postNumber,
        latitude: orderDto.latitude,
        longitude: orderDto.longitude,
      };

      return this.prisma.order.update({
        where: { id },
        data: orderNewData,
      });
    }
    // If user is reader --> accept this order or no
    if (this.user.user.userType === UserType.reader) {
      const newData = {
        readerId: orderDto.readerId,
        status: OrderStatus.accepted,
      };
      return this.prisma.order.update({
        where: { id },
        data: newData,
      });
    }
  }

  // Cancel order (Remark: client should not cancel order if the order was accepted by reader)
  async cancelOrderById(id: number): Promise<string> {
    if (this.user.user.userType === 'client') {
      // Fetch the order first
      const order = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Prevent deletion if already accepted
      if (order.status === OrderStatus.accepted) {
        throw new Error('Cannot delete order: it has already been accepted');
      }

      const newData = {
        status: OrderStatus.deleted,
      };

      await this.prisma.order.update({
        where: { id },
        data: newData,
      });

      return 'Order deleted successfully';
    } 
    else {
      const order = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!order) throw new Error('Order not found');

      const newData = { status: OrderStatus.rejected };

      await this.prisma.order.update({
        where: { id },
        data: newData,
      });
      return 'Order rejected successfully';
    }
  }
}
