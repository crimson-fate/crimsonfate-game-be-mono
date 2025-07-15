import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ValidateRewardDto } from './dto/validateReward.dto';
import { BaseResult } from '@app/shared/utils/types';
import { AgentService } from './agent.service';

@Controller('agent')
@ApiTags('Agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('validate-reward')
  async validateReward(@Body() body: ValidateRewardDto): Promise<
    BaseResult<{
      multiplier: number;
      keys: string[];
      saltNonce: number;
      progressId: number;
    }>
  > {
    const result = await this.agentService.validateReward(body);
    return new BaseResult(result);
  }
}
