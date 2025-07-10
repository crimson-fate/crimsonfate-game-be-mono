import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PlayersService } from '../players/players.service';
import { shortString, stark, typedData, TypedData, uint256 } from 'starknet';
import { Web3Service } from '@app/web3';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DropGem,
  DropGemDocument,
} from '@app/shared/models/schema/drop-gem.schema';
import { GameIdDto } from '../dungeon/dto/gameId.dto';

@Injectable()
export class GemService {
  constructor(
    @InjectModel(DropGem.name)
    private readonly dropGemModel: Model<DropGemDocument>,
    private readonly playerService: PlayersService,
    private readonly web3Service: Web3Service,
  ) {}

  async claimInitialGem(
    address: string,
  ): Promise<{ saltNonce: number; keys: string[] }> {
    const player = await this.playerService.getPlayerInfo(address);
    if (player.isClaimInitialGem) {
      throw new HttpException('Player already claimed', HttpStatus.BAD_REQUEST);
    }

    const message = this.getClaimGemMessage(address, 50, player.initlaGemNonce);
    const valAccount = this.web3Service.getValidatorAccount();
    const signature = await valAccount.signMessage(message);
    const formattedKeys = stark.formatSignature(signature);

    player.isClaimInitialGem = true;
    await player.save();

    return { saltNonce: player.initlaGemNonce, keys: formattedKeys };
  }

  getClaimGemMessage(
    address: string,
    amount: number,
    nonce: number,
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
        ClaimGemParams: [
          {
            name: 'player',
            type: 'felt',
          },
          {
            name: 'amount',
            type: 'u256',
          },
          {
            name: 'salt_nonce',
            type: 'felt',
          },
        ],
        u256: [
          {
            name: 'low',
            type: 'felt',
          },
          {
            name: 'high',
            type: 'felt',
          },
        ],
      },
      primaryType: 'ClaimGemParams',
      domain: {
        name: 'crimson-fate',
        version: '1',
        chainId: shortString.encodeShortString('SN_MAIN'),
      },
      message: {
        player: address,
        amount: uint256.bnToUint256(amount * 1e18),
        salt_nonce: nonce,
      },
    };

    return message;
  }

  async claimDungeonGem(
    query: GameIdDto,
    address: string,
  ): Promise<{ amount: number; saltNonce: number; keys: string[] }> {
    const player = await this.playerService.getPlayerInfo(address);
    const { gameId } = query;
    const dropGemDocument = await this.dropGemModel.findOne({
      player: player._id,
      gameId,
    });

    if (
      !dropGemDocument ||
      dropGemDocument.isClaimed ||
      dropGemDocument.isCancelled
    ) {
      throw new HttpException(
        'Can not claim gem for this game',
        HttpStatus.BAD_REQUEST,
      );
    }

    const message = this.getClaimGemMessage(
      address,
      dropGemDocument.gems,
      dropGemDocument.saltNonce,
    );
    const valAccount = this.web3Service.getValidatorAccount();
    const signature = await valAccount.signMessage(message);
    const formattedKeys = stark.formatSignature(signature);

    dropGemDocument.isClaimed = true;
    await dropGemDocument.save();

    return {
      amount: dropGemDocument.gems,
      saltNonce: dropGemDocument.saltNonce,
      keys: formattedKeys,
    };
  }
}
