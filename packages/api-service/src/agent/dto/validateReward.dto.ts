import { IsNumber } from 'class-validator';
import { AgentProgressIdDto } from './AgentProgressId.dto';

export class ValidateRewardDto extends AgentProgressIdDto {
  @IsNumber()
  multiplier: number;
}
