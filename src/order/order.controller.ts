import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto } from '@/dto/order.dto';
import { RolesGuard } from '@/auth/auth.guards';
import { Roles } from '@/auth/roles.decorator';
import { UserType } from '@generated/index';
@UseGuards(RolesGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // Get order status:
  @Roles(UserType.admin)
  @Get('status')
  getStatus() {
    return this.orderService.getOrderStatus();
  }

  // Fetch all orders of a user who is currently logged in:
  @Roles(UserType.client, UserType.reader)
  @Get()
  findOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('thisMonth') thisMonth?: boolean,
  ) {
    const startMs = start ? Number(start) : undefined;
    const endMs = end ? Number(end) : undefined;

    const startDate =
      startMs && !Number.isNaN(startMs) ? new Date(startMs) : undefined;
    const endDate = endMs && !Number.isNaN(endMs) ? new Date(endMs) : undefined;
    return this.orderService.getOrdersById(
      page,
      limit,
      status,
      search,
      startDate,
      endDate,
      thisMonth,
    );
  }

  // Add order:
  @Roles(UserType.client)
  @Post()
  @HttpCode(200)
  createOrder(@Body() body: OrderDto) {
    return this.orderService.createOrder(body);
  }

  // Cancel order:
  @Roles(UserType.client)
  @Delete(':id')
  deleteOrder(@Param('id') id: number) {
    return this.orderService.cancelOrderById(id);
  }

  // Edit order details:
  @Roles(UserType.client, UserType.reader)
  @Put(':id')
  updateOrder(@Param('id') id: number, @Body() body: OrderDto) {
    return this.orderService.updateOrderById(id, body);
  }
}
