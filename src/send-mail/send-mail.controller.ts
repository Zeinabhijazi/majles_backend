import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SendMailService } from './send-mail.service';
import { EmailDTO } from '@/dto/email.dto';

@Controller('mail')
export class SendMailController {
    constructor(
        private readonly mailService: SendMailService
      ) {}

    @Post('send')
    @HttpCode(200)
    async send(@Body() data: EmailDTO) {
        const result = await this.mailService.sendContactForm(data);
        return { success: true, message: result }; 
    }

}
