import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';

import { HeroesModule } from './heroes/heroes.module';
import { EquipmentModule } from './equipment/equipment.module';
import { PlayerLevelModule } from './player-level/player-level.module';
import { ShopModule } from './shop/shop.module';
import { ZoneModule } from './zone/zone.module';
import { DropResourceModule } from './drop-resource/drop-resource.module';
import { ZoneRewardModule } from './zone-reward/zone-reward.module';
import configuration from '@app/shared/configuration';
import { FallbackController } from './fallback.controller';
import { InventoryModule } from './inventory/inventory.module';
import { DungeonModule } from './dungeon/dungeon.module';
import { PlayerResourceModule } from './player-resource/player-resource.module';
import { PlayersModule } from './players/players.module';
import { JwtModule } from '@nestjs/jwt';
import { GemModule } from './gem/gem.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(configuration().MONGODB_URI),
    JwtModule.register({
      secret: configuration().JWT_SECRET,
      signOptions: {
        expiresIn: configuration().JWT_EXPIRE,
      },
      global: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, 'public'), // 😬 fragile
      serveRoot: '/',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000,
          limit: 10,
        },
      ],
    }),
    HeroesModule,
    EquipmentModule,
    PlayerLevelModule,
    ShopModule,
    ZoneModule,
    DropResourceModule,
    ZoneRewardModule,
    InventoryModule,
    DungeonModule,
    PlayerResourceModule,
    PlayersModule,
    GemModule,
  ],
  controllers: [FallbackController],
})
export class AppModule {}
