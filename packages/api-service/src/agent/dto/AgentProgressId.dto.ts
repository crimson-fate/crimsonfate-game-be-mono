import { IsMongoId } from 'class-validator';

export class AgentProgressIdDto {
  @IsMongoId()
  id: string;
}
