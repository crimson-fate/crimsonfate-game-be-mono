import { TransactionDto } from './transaction.dto';
import { IsUUID } from 'class-validator';

export class ClaimDungeonGemDto extends TransactionDto {
  @IsUUID()
  gameId: string;
}
