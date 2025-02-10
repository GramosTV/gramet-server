import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtAccessPayload } from 'src/common/interfaces/jwt.interface';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtAccessPayload): Promise<JwtAccessPayload> {
    const user = await this.usersService.findOne(payload.email);

    if (user && user.role === Role.ADMIN) {
      return payload;
    } else {
      throw new Error('Unauthorized: User is not an admin');
    }
  }
}
