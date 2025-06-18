import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class JwtPayload {
  address: string; //address user
}
export class iInfoToken extends JwtPayload {
  @ApiProperty()
  @IsNumber()
  iat: number;

  @ApiProperty()
  @IsNumber()
  exp: number;
}
