import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class VerifyEmailService {
    constructor(
        private readonly prisma: PrismaService
    ) {}
    
    async verifyEmail(token: string, userId: number) {
        const record = await this.prisma.emailVerification.findUnique({
            where: { tokenId: token },
            include: { user: true },
        });

        if (!record) throw new BadRequestException("Invalid token");
        if (record.userId !== userId) throw new BadRequestException("Token mismatch");
        if (record.expiresAt < new Date()) throw new BadRequestException("Token expired");

        // Mark user as verified
        await this.prisma.user.update({
            where: { id: userId },
            data: { verified: true },
        });

        return { message: "Email verified successfully!" };
    }
}
