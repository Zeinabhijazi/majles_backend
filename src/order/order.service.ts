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
import { OrderTypeRes } from '@/admin/model_structure/orders_response';
import { PaginationDto } from '@/dto/pagination.dto';

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

  async getOrdersById(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
  ) {
    const clientId = this.user.user.id;
    const offset = (page - 1) * pageSize;
    let where: any = {
      OR: [{ clientId: clientId }, { readerId: clientId }],
    };

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

    if (status && status !== 'all') {
      if (status === 'pending') {
        where.isAccepted = false;
        where.isDeleted = false;
      } else if (status === 'completed') {
        where.isAccepted = true;
        where.isDeleted = false;
      } else if (status === 'rejected') {
        where.isDeleted = true;
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

    const itemsCount = await this.prisma.order.count();
    
    const pendingItemsCount = await this.prisma.order.count({
      where: { clientId: clientId, isAccepted: false, isDeleted : false }
    });

    const completedItemsCount = await this.prisma.order.count({
      where:  { clientId: clientId, isAccepted: true, isDeleted : false }
    });

    const totalOrders = await this.prisma.order.count({
      where: { clientId: clientId, isDeleted : false }
    });

    if (!orders) {
      throw new NotFoundException(`Order with id ${clientId} not found`);
    }

    return {
      content: orders,
      pendingItemsCount,
      completedItemsCount,
      totalOrders,
      itemsCount,
      pageCount: Math.ceil(itemsCount / pageSize),
    };
  }

  async updateOrderById(id: number, orderDto: OrderDto) {
    // If user is client --> change info for order
    if (UserType.client) {
      const order = await this.prisma.order.findFirstOrThrow({
        include: {
          client: true,
          reader: true,
        },
        where: {
          OR: [{ clientId: id }, { readerId: id }],
          isDeleted: false,
        },
      });

      if (!order) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      const orderNewData = {
        readerId: orderDto.readerId,
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
        select: {
          id: true,
          readerId: true,
          orderDate: true,
          addressOne: true,
          addressTwo: true,
          country: true,
          city: true,
          postNumber: true,
          latitude: true,
          longitude: true,
        },
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

  async getOrderStatus(): Promise<OrdersStatus> {
    const accepted = await this.prisma.order.count({
      where: { isAccepted: true, isDeleted: false },
    });

    const cancelled = await this.prisma.order.count({
      where: { isDeleted: true },
    });

    const pending = await this.prisma.order.count({
      where: { isAccepted: false, isDeleted: false },
    });

    return { accepted, cancelled, pending };
  }
}
