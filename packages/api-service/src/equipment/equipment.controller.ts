import { Controller, Get, Post, Body } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { iInfoToken, JWT, User } from '@app/shared/jwt';
import { TransactionDto } from '../gem/dto/transaction.dto';

@Controller('api')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @JWT()
  @Post('claim-first-equipment-success')
  async claimFirstEquipmentSuccess(
    @Body() body: TransactionDto,
    @User() user: iInfoToken,
  ) {
    return this.equipmentService.claimFirstEquipmentSuccess(body, user.address);
  }

  @Get('getEquipmentData')
  async getEquipmentData() {
    return this.equipmentService.getEquipmentData();
  }

  @Post('uploadEquipmentFile')
  async uploadEquipmentFile(@Body() body: { fileContent: string }) {
    return this.equipmentService.uploadEquipmentFile(body.fileContent);
  }
}
