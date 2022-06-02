import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { PublisherModule } from './publisher/publisher.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GameModule,
    PublisherModule,
    PrismaModule,
  ],
})
export class AppModule {}
