import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProgressTrophyDto } from './dto/progressTrophy.dto';
import { TrophyService } from './trophy.service';
import { BaseResult } from '@app/shared/utils/types';

@Controller('trophy')
@ApiTags('Trophy')
export class TrophyController {
  constructor(private readonly trophyService: TrophyService) {}

  @Post('claim-task-progress-success')
  async claimTaskProgressSuccess(@Body() body: ProgressTrophyDto) {
    const data = await this.trophyService.claimTaskProgressSuccess(body);
    return new BaseResult(data);
  }
}
