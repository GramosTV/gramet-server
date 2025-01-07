import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import mongoose from 'mongoose';

@Catch(mongoose.Error.ValidationError)
export class MongooseValidationExceptionFilter implements ExceptionFilter {
  catch(exception: mongoose.Error.ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = HttpStatus.BAD_REQUEST;

    // Extract validation error messages
    const errors = Object.entries(exception.errors).map(([key, error]) => ({
      field: key,
      message: (error as any).message,
    }));

    // Send a structured error response
    response.status(status).json({
      statusCode: status,
      message: 'Validation failed',
      errors,
    });
  }
}
