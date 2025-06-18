import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import configuration from '@app/shared/configuration';
import { JwtPayload } from './jwt.dto';
import { Players, PlayersDocument } from '../models/schema/player.schema';
import { formattedContractAddress } from '../utils/formatAddress';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(Players.name)
    private readonly playerModel: Model<PlayersDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration().JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { address } = payload;
    const player = await this.playerModel
      .findOne({
        address: formattedContractAddress(address.toLocaleLowerCase()),
      })
      .exec();
    if (!player) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
