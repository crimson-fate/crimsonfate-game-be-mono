import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { BaseResult } from '@app/shared/utils/types';

@Controller('activities')
@ApiTags('Activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Get players activities' })
  async getActivities() {
    const result = await this.activitiesService.getActivities();
    return new BaseResult(result);
  }
}
