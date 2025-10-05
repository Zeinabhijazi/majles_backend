import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@/auth/auth.guards';
import { AdminService } from './admin.service';
import { Roles } from '@/auth/roles.decorator';
import { UserType } from '@generated/index';
import { AssignReaderDto } from '@/dto/assignReader.dto';
import { PaginationDto } from '@/dto/pagination.dto';
import { UserTypeRes } from './model_structure/users_response';

@UseGuards(RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService
  ) {}

  // Fetch all Users:
  @Roles(UserType.admin)
  @Get('allUsers')
  async findAllUsers(
    @Query("page") page: number = 1, // start with page number 1
    @Query("limit") limit: number = 10, // bring 10 records
    @Query('userType') userType?: string,
    @Query("isDeleted") isDeleted?: string,
    @Query("search") search?: string,    
  ) : Promise<PaginationDto<UserTypeRes>> {
    return await this.adminService.getAllUsers(page, limit, userType, isDeleted, search);
  }

  // Fetch all orders:
  @Roles(UserType.admin)
  @Get('allOrders')
  async findAllOrders(
    @Query("page") page: number = 1, 
    @Query("limit") limit: number = 10,
    @Query('status') status?: string,
    @Query("start") start?: string,
    @Query("end") end?: string,
  ) {
    const startMs = start ? Number(start) : undefined;
    const endMs = end ? Number(end) : undefined;

    const startDate = startMs && !Number.isNaN(startMs) ? new Date(startMs) : undefined;
    const endDate = endMs && !Number.isNaN(endMs) ? new Date(endMs) : undefined;
    return await this.adminService.getAllOrders(page, limit, status, startDate, endDate);
  }
  
  // To delete a reader or a user:
  @Roles(UserType.admin)
  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    return this.adminService.deleteUserById(id);
  }

  // Assign reader by admin:
  @Roles(UserType.admin)
  @Put(':id')
  async assignReaderByAdmin(
    @Body() assignOrderDto: AssignReaderDto,
    @Param('id') id: number
  ) {
    return await this.adminService.assignReader(
      id,
      assignOrderDto,
    );
  }
}
