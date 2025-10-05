import { ApiResponseDto } from '@/interceptors/api-response.dto';
import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		/*ctx.getRequest<Request>();
		console.log(exception)
		
		const status = exception instanceof HttpException
			? exception.getStatus()
			: HttpStatus.INTERNAL_SERVER_ERROR;
		const message = exception instanceof HttpException
			? exception.message 
			: 'Internal server error';*/
		// New from line 26 to 38
		let status = 500;
		let message: string = 'Internal server error';

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const res = exception.getResponse();

			if (typeof res === 'string') {
			message = res; // e.g., UnauthorizedException
			} else if (typeof res === 'object' && res.hasOwnProperty('message')) {
			message = (res as any).message; // array or string
			}
		}
		
		const errorResponse = ApiResponseDto.error(message);

		response.status(status).json(errorResponse);
	}
}