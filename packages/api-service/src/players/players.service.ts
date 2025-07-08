import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Players,
  PlayersDocument,
} from '@app/shared/models/schema/player.schema';
import {
  formattedContractAddress,
  unformattedContractAddress,
} from '@app/shared/utils/formatAddress';
import { lookupAddresses } from '@cartridge/controller';
import { v1 as uuidv1 } from 'uuid';
import { typedData, TypedData } from 'starknet';
import { VerifySignatureDto } from './dto/verifySignature.dto';
import { Web3Service } from '@app/web3';
import { JwtService } from '@nestjs/jwt';
import configuration from '@app/shared/configuration';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Players.name)
    private readonly playerModel: Model<Players>,
    private readonly web3Service: Web3Service,
    private readonly jwtService: JwtService,
  ) {}

  async getPlayerInfo(address: string): Promise<PlayersDocument> {
    const player = await this.playerModel.findOne(
      {
        address: formattedContractAddress(address),
      },
      { nonce: 0 },
    );

    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    return player;
  }

  async getOrCreeatePlayer(walletAddress: string): Promise<PlayersDocument> {
    const formattedAddress = formattedContractAddress(walletAddress);
    let player = await this.playerModel.findOne({
      address: formattedAddress,
    });

    if (!player) {
      const unformattedAddress = unformattedContractAddress(formattedAddress);
      const addressesMap = await lookupAddresses([unformattedAddress]);
      const username = addressesMap.get(unformattedAddress);

      const newPlayer = new this.playerModel({
        address: formattedAddress,
        username: username ? username : null,
        nonce: uuidv1(),
        isClaimInitialGem: false,
        initlaGemNonce: Math.floor(Date.now() / 1000),
      });

      player = await newPlayer.save();
    }

    return player;
  }

  async getAuthMessage(address: string): Promise<TypedData> {
    const player = await this.getOrCreeatePlayer(address);
    const typedDataValidate: TypedData = {
      types: {
        StarknetDomain: [
          { name: 'name', type: 'shortstring' },
          { name: 'version', type: 'shortstring' },
          { name: 'chainId', type: 'shortstring' },
          { name: 'revision', type: 'shortstring' },
        ],
        Message: [{ name: 'nonce', type: 'selector' }],
      },
      primaryType: 'Message',
      domain: {
        name: 'CrimsonFate',
        version: '1',
        revision: '1',
        chainId: 'SN_MAIN',
      },
      message: {
        nonce: player.nonce,
      },
    };
    return typedDataValidate;
  }

  async updateRandomNonce(address: string): Promise<PlayersDocument> {
    const formattedAddress = formattedContractAddress(address);
    const user = await this.playerModel
      .findOneAndUpdate(
        { address: formattedAddress },
        { $set: { nonce: uuidv1() } },
        { new: true },
      )
      .exec();

    return user;
  }

  async verifySignature(query: VerifySignatureDto): Promise<string> {
    try {
      const { address, signature } = query;
      const provider = this.web3Service.getProvider();

      const message = await this.getAuthMessage(address);
      const msgHash = typedData.getMessageHash(message, address);
      await provider.verifyMessageInStarknet(msgHash, signature, address);

      await this.updateRandomNonce(address);

      const token = await this.generateToken(address);
      return token;
    } catch (error) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }
  }

  async generateToken(address: string) {
    const token = await this.jwtService.signAsync(
      { address: formattedContractAddress(address) },
      {
        secret: configuration().JWT_SECRET,
      },
    );
    return token;
  }
}
