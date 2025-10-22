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
import { OrdersStatus } from './orders-type/ordersStatus_ype';
import { PrismaClientKnownRequestError } from '@generated/runtime/library';
import { UserType } from '@generated/index';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(UserContextService)
    private readonly user: UserContextService,
  ) {}

  async getOrderStatus(): Promise<OrdersStatus> {
    const todayUTC = new Date();
    const todayDateOnly = new Date(
      Date.UTC(
        todayUTC.getUTCFullYear(),
        todayUTC.getUTCMonth(),
        todayUTC.getUTCDate(),
      ),
    );

    const accepted = await this.prisma.order.count({
      where: { isAccepted: true, isDeleted: false },
    });

    const cancelled = await this.prisma.order.count({
      where: { 
        OR: [
          { isDeleted: true },
          { orderDate: { gt: todayDateOnly } },
        ],
      },
    });

    const pending = await this.prisma.order.count({
        where:  {
          isAccepted: false,
          isDeleted: false,
          orderDate: {gt: todayDateOnly}
        }
    });

    const completed = await this.prisma.order.count({
      where: { orderDate: {lt: todayDateOnly} },
    });

    return { accepted, cancelled, pending, completed };
  }

  // Get all the orders of the logged in user
  async getOrdersById(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
    startDate?: Date, 
    endDate?: Date, 
    thisMonth?: boolean,
  ) {
    const userId = this.user.user.id;
    const offset = (page - 1) * pageSize;
    let where: any = {
      OR: [{ clientId: userId }, { readerId: userId }],
    };

    // If both provided, use them directly as instants (no timezone conversion)
    if (startDate && endDate) {
      where.orderDate = { gte: startDate, lte: endDate };
    }

    // Add search filter
    if (search) {
      where = {
        AND: [
          where,
          {
            OR: [
              {
                reader: {
                  firstName: { contains: search, mode: 'insensitive' },
                },
              },
              {
                reader: { lastName: { contains: search, mode: 'insensitive' } },
              },
            ],
          },
        ],
      };
    }
    
    const todayUTC = new Date();
    const todayDateOnly = new Date(
      Date.UTC(
        todayUTC.getUTCFullYear(),
        todayUTC.getUTCMonth(),
        todayUTC.getUTCDate(),
      ),
    );

    //If `thisMonth` is true, limit to current month records
    if (thisMonth) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const startOfMonthUTC = new Date(
        Date.UTC(
          startOfMonth.getFullYear(),
          startOfMonth.getMonth(),
          startOfMonth.getDate(),
        ),
      );
      const endOfMonthUTC = new Date(
        Date.UTC(
          endOfMonth.getFullYear(),
          endOfMonth.getMonth(),
          endOfMonth.getDate(),
        ),
      );

      where = {
        ...where,
        orderDate: {
          gte: startOfMonthUTC,
          lt: endOfMonthUTC,
        },
      };
    }

    if (status && status !== 'all') {
      if (status === 'pending') {
        where.isAccepted = false;
        where.isDeleted = false;
        where.orderDate = { gt: todayDateOnly };
      } else if (status === 'completed') {
        where.orderDate = { lt: todayDateOnly };
      } else if (status === 'rejected') {
        where.isDeleted = true;
        where.orderDate = { gt: todayDateOnly };
      } else if (status === 'accepted') {
        where.isAccepted = true;
      }
    }

    const orders = await this.prisma.order.findMany({
      include: {
        client: true,
        reader: true,
      },
      where,
      skip: offset,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const itemsCount = await this.prisma.order.count({ where });

    const pendingItemsCount = await this.prisma.order.count({
      where: { clientId: userId, isAccepted: false, isDeleted: false },
    });

    const completedItemsCount = await this.prisma.order.count({
      where: { clientId: userId, isAccepted: true, isDeleted: false },
    });

    const totalOrders = await this.prisma.order.count({
      where: { clientId: userId, isDeleted: false },
    });

    if (!orders) {
      throw new NotFoundException(`Order with id ${userId} not found`);
    }

    const ordersWithStatus = orders.map((order) => {
      const orderDateUTC = new Date(order.orderDate);
      const orderDateOnly = new Date(
        Date.UTC(
          orderDateUTC.getUTCFullYear(),
          orderDateUTC.getUTCMonth(),
          orderDateUTC.getUTCDate(),
        ),
      );

      const isCompleted = orderDateOnly < todayDateOnly;
      return {
        ...order,
        isCompleted,
      };
    });

    return {
      content: ordersWithStatus,
      pendingItemsCount,
      completedItemsCount,
      totalOrders,
      itemsCount,
      pageCount: Math.ceil(itemsCount / pageSize),
    };
  }

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

  // Cancel order (Remark: client should not cancel order if the order was accepted by reader)
  async cancelOrderById(id: number): Promise<string> {
    // Fetch the order first
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: { isAccepted: true, isDeleted: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Prevent deletion if already accepted
    if (order.isAccepted) {
      throw new Error('Cannot delete order: it has already been accepted');
    }

    await this.prisma.order.update({
      where: { id },
      data: { isDeleted: true },
    });

    return 'Order deleted successfully';
  }

  async updateOrderById(id: number, orderDto: OrderDto) {
    // If user is client --> change info for order
    if (UserType.client) {
      const order = await this.prisma.order.findFirstOrThrow({
        where: {
          id,
          isDeleted: false,
        },
      });

      if (!order) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const orderNewData = {
        orderDate: orderDto.orderDate,
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
    if (UserType.reader) {
      return this.prisma.order.update({
        where: { id },
        data: {
          isAccepted: true,
        },
      });
    }
  }
}
