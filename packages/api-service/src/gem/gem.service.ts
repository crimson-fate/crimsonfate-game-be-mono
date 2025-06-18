import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PlayersService } from '../players/players.service';
import { shortString, stark, typedData, TypedData, uint256 } from 'starknet';
import { Web3Service } from '@app/web3';

@Injectable()
export class GemService {
  constructor(
    private readonly playerService: PlayersService,
    private readonly web3Service: Web3Service,
  ) {}

  async claimInitialGem(address: string): Promise<string[]> {
    const player = await this.playerService.getPlayerInfo(address);
    if (player.isClaimInitialGem) {
      throw new HttpException('Player already claimed', HttpStatus.BAD_REQUEST);
    }

    player.isClaimInitialGem = true;
    await player.save();
    const message = this.getClaimGemMessage(address, player.initlaGemNonce);
    const valAccount = this.web3Service.getValidatorAccount();
    const signature = await valAccount.signMessage(message);
    const formattedKeys = stark.formatSignature(signature);

    return formattedKeys;
  }

  getClaimGemMessage(address: string, nonce: number): TypedData {
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
        chainId: shortString.encodeShortString('SN_SEPOLIA'),
      },
      message: {
        player: address,
        amount: uint256.bnToUint256(50 * 1e18),
        salt_nonce: nonce,
      },
    };

    return message;
  }
}
