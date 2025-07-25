import { IsHexadecimal, IsNumber, IsString } from 'class-validator';

export class ProgressTrophyDto {
  @IsHexadecimal()
  player: string;

  @IsString()
  taskId: string;

  @IsNumber()
  count: number;

  @IsNumber()
  time: number;

  @IsHexadecimal()
  transactionHash: string;
}
