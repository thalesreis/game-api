import { Module } from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { PublisherController } from './publisher.controller';
import { GameModule } from '../game/game.module';

@Module({
  providers: [PublisherService],
  controllers: [PublisherController],
  imports: [GameModule],
})
export class PublisherModule {}
