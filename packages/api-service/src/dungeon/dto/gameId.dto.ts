import { IsUUID } from 'class-validator';

export class GameIdDto {
  @IsUUID()
  gameId: string;
}
