import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AgentPlayerDataDocument } from './agent-player-data.schema';
import { Document, SchemaTypes } from 'mongoose';

export type AgentRewardDocument = AgentReward & Document;

@Schema({ timestamps: true })
export class AgentReward {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'AgentPlayerData' })
  agentProgressId: AgentPlayerDataDocument;

  @Prop()
  multiplier: number;

  @Prop()
  saltNonce: number;
}

export const AgentRewardSchema = SchemaFactory.createForClass(AgentReward);
AgentRewardSchema.index({ agentId: 1 });
