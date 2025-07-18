import { IsNumber } from 'class-validator';
import { AgentProgressIdDto } from './AgentProgressId.dto';
import { AddressDto } from 'api-service/src/players/dto/address.dto';

export class ValidateRewardDto extends AddressDto {
  @IsNumber()
  multiplier: number;
  @IsNumber()
  progressId: number;
}
