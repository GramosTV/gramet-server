import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import mongoose from 'mongoose';

@Catch(mongoose.Error.ValidationError)
export class MongooseValidationExceptionFilter implements ExceptionFilter {
  catch(exception: mongoose.Error.ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = HttpStatus.BAD_REQUEST;

    const errors = Object.entries(exception.errors).map(([key, error]) => ({
      field: key,
      message: (error as any).message,
    }));

    response.status(status).json({
      statusCode: status,
      message: 'Validation failed',
      errors,
    });
  }
}
