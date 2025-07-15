import {
  AgentReward,
  AgentRewardDocument,
} from '@app/shared/models/schema/agent-reward.schema';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidateRewardDto } from './dto/validateReward.dto';
import {
  AgentPlayerData,
  AgentPlayerDataDocument,
} from '@app/shared/models/schema/agent-player-data.schema';
import { shortString, TypedData } from 'starknet';
import { Web3Service } from '@app/web3';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(AgentReward.name)
    private readonly agentRewardModel: Model<AgentRewardDocument>,
    @InjectModel(AgentPlayerData.name)
    private readonly agentPlayerDataModel: Model<AgentPlayerDataDocument>,
    private readonly web3Service: Web3Service,
  ) {}

  async validateReward(body: ValidateRewardDto): Promise<{
    multiplier: number;
    keys: string[];
    saltNonce: number;
    progressId: number;
  }> {
    const { id, multiplier } = body;
    const agentProgress = await this.agentPlayerDataModel.findById(id);

    if (!agentProgress) {
      throw new HttpException('Agent reward not found', HttpStatus.NOT_FOUND);
    }

    const agentReward = await this.agentRewardModel.findOne({
      agentProgressId: agentProgress._id,
    });

    if (agentReward) {
      throw new HttpException(
        'Agent reward already claimed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const saltNonce = Math.floor(Math.random() * 10000);
    const message = this.getClaimValorRewardMessage(
      agentProgress.walletAddress,
      multiplier,
      agentProgress.progressId,
      saltNonce,
    );
    const keys = await this.web3Service.validatorSignMessage(message);
    await this.agentRewardModel.create({
      agentProgressId: agentProgress,
      multiplier,
      saltNonce,
    });

    return {
      multiplier,
      keys,
      saltNonce,
      progressId: agentProgress.progressId,
    };
  }

  getClaimValorRewardMessage(
    player: string,
    multiplier: number,
    progressId: number,
    saltNonce: number,
  ): TypedData {
    const message: TypedData = {
      types: {
        StarkNetDomain: [
          {
            name: 'name',
            type: 'felt',
          },
          {
            name: 'version',
            type: 'felt',
          },
          {
            name: 'chainId',
            type: 'felt',
          },
        ],
        ClaimValorGemParams: [
          {
            name: 'player',
            type: 'felt',
          },
          {
            name: 'multiplier',
            type: 'u32',
          },
          {
            name: 'progress_id',
            type: 'u128',
          },
          {
            name: 'salt_nonce',
            type: 'felt',
          },
        ],
      },
      primaryType: 'ClaimValorGemParams',
      domain: {
        name: 'crimson-fate',
        version: '1',
        chainId: shortString.encodeShortString('SN_MAIN'),
      },
      message: {
        player: player,
        multiplier,
        progress_id: progressId,
        salt_nonce: saltNonce,
      },
    };
    return message;
  }
}
