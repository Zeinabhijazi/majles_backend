import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
  constructor(
    private readonly orderService: OrderService,
  ) {}

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

  // Fetch all orders of a user who is currently logged in:
  @Roles(UserType.client, UserType.reader)
  @Get()
  findOrders() {
    return this.orderService.getOrdersById();
  }

  // Edit order details:
  @Roles(UserType.client, UserType.reader)
  @Put(':id')
  updateOrder(@Param('id') id: number, @Body() body: OrderDto) {
    return this.orderService.updateOrderById(id, body);
  }

  // Get order status:
  @Roles(UserType.admin)
  @Get('status')
  getStatus(){
    return this.orderService.getOrderStatus();
  }
}
