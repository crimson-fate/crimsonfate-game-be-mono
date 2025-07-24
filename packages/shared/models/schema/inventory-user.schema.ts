import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryUserDocument = InventoryUser & Document;

@Schema()
export class InventoryUser {
  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop({ type: Object, required: true, default: {} })
  inventory: {
    sortByType: boolean;
    dicEquippedKey: Record<string, string>;
  };

  @Prop({ type: Object, required: true, default: {} })
  stats: {
    lastUpdated: Date;
  };
}

export const InventoryUserSchema = SchemaFactory.createForClass(InventoryUser);
