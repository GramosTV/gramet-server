import 'fastify';
import { JwtAccessPayload } from '../common/interfaces/jwt.interface';
import { UserDocument } from '../users/schemas/user.schema';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtAccessPayload | UserDocument;
  }
}
