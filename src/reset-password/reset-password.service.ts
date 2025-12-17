import { ResetPasswordDto } from '@/dto/resetPassword';
import { PrismaService } from '@/prisma/prisma.service';
import { VerificationStatus } from '@generated/index';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';

@Injectable()
export class ResetPasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async resetPassword(dto: ResetPasswordDto) {
    // Check if the token is valid  
    const record = await this.prisma.verification.findFirst({ 
        where: { 
            tokenId: dto.token,
            userId: dto.userId,
            status: VerificationStatus.forgetPassword,
            expiresAt: { gt: new Date() }, 
        } 
    });
    if (!record) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await argon.hash(dto.newPassword);
    const password = { password: hashedPassword };

    await this.prisma.user.update({
      where: { id: dto.userId },
      data: password,
    });

    // delete token 
    await this.prisma.verification.delete({
        where: { id: record.id },
    })

    return 'Reset Password successfully';
  }
}
