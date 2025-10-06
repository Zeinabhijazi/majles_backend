import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PaginationDto } from '@/dto/pagination.dto';
import { UserTypeRes } from '@/admin/model_structure/users_response';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Fetch the counts of readers and clients
  @Get('counts')
  async findUserCounts() {
    return await this.dashboardService.getUserCounts();
  }

  // Fetch all Readers 
  @Get('allReaders')
  async findAllReaders(
    @Query('userType') userType: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query("search") search?: string,    
  ): Promise<PaginationDto<UserTypeRes>> {
    return await this.dashboardService.getAllReaders(page, limit, userType, search);
  }
}
