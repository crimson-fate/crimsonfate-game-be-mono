import { IsHexadecimal } from 'class-validator';

export class TransactionDto {
  @IsHexadecimal()
  transactionHash: string;
}
