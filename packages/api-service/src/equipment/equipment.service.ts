import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Equipment,
  EquipmentDocument,
} from '@app/shared/models/schema/equipment.schema';
import { Web3Service } from '@app/web3';
import { PlayersService } from '../players/players.service';
import { TransactionDto } from '../gem/dto/transaction.dto';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectModel(Equipment.name)
    private equipmentModel: Model<EquipmentDocument>,
    private readonly web3Service: Web3Service,
    private readonly playerService: PlayersService,
  ) {}

  async getEquipmentData() {
    try {
      const data = await this.equipmentModel.findOne().lean();
      if (!data) {
        return {
          success: false,
          message: 'No equipment data found',
          data: {
            lstSkillVip: [],
            dicStatsCapital: {},
            dicUpradeConfig: {},
            dicMaxLevelUpgrade: {},
            lstEquipmentSetConfig: [],
            offsetMulti: 0,
            maxParterm: 0,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      const { _id, __v, ...equipmentData } = data;
      return {
        success: true,
        message: 'Equipment data retrieved successfully',
        data: equipmentData,
      };
    } catch (error) {
      this.logger.error('Error getting equipment data:', error);
      return {
        success: false,
        message: 'Error retrieving equipment data',
        error: error.message,
      };
    }
  }

  async uploadEquipmentFile(fileContent: string) {
    try {
      const jsonData = JSON.parse(fileContent);
      await this.equipmentModel.deleteMany({});

      // Lưu trực tiếp dữ liệu từ file JSON
      const newEquipment = new this.equipmentModel({
        ...jsonData,
        updatedAt: new Date().toISOString(),
      });

      await newEquipment.save();

      // Lấy dữ liệu vừa lưu để trả về
      const savedData = await this.equipmentModel.findOne().lean();
      const { _id, __v, ...equipmentData } = savedData;

      return {
        success: true,
        message: 'Equipment data uploaded successfully',
        data: equipmentData,
      };
    } catch (error) {
      this.logger.error('Error uploading equipment data:', error);
      return {
        success: false,
        message: 'Error uploading equipment data',
        error: error.message,
      };
    }
  }

  async claimFirstEquipmentSuccess(
    query: TransactionDto,
    address: string,
  ): Promise<boolean> {
    const { transactionHash } = query;
    const player = await this.playerService.getPlayerInfo(address);
    const isSuccess = await this.web3Service.checkTransaction(transactionHash);
    if (!isSuccess) {
      throw new HttpException('Transaction failed', HttpStatus.BAD_REQUEST);
    }

    player.isClaimFirstEquipment = true;
    await player.save();

    return true;
  }
}
