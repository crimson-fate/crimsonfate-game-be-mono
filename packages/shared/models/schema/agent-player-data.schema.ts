import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentPlayerDataDocument = AgentPlayerData & Document;

@Schema()
export class AgentPlayerData {
  @Prop({ required: true })
  progressId: number;

  @Prop({ required: true })
  walletAddress: string;

  @Prop({ required: true, default: false })
  isFarming: boolean;

  @Prop({ required: true, default: new Date().getTime() })
  startTime: number;

  @Prop({ required: true, default: 0 })
  duration: number;

  @Prop({ type: Object, required: true, default: {} })
  itemCounts: {
    common: number;
    great: number;
    rare: number;
    epic: number;
  };

  @Prop({ required: false, default: 0 })
  stakedGem: number;
}

export const AgentPlayerDataSchema =
  SchemaFactory.createForClass(AgentPlayerData);

// Ensure the combination of walletAddress and progressId is unique
AgentPlayerDataSchema.index(
  { walletAddress: 1, progressId: 1 },
  { unique: true, name: 'uniq_wallet_progress' },
);
