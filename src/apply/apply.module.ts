import { Module } from '@nestjs/common';
import { ApplyController } from './apply.controller';
import { ApplyService } from './apply.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplyEntity } from 'src/entities/apply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplyEntity])],
  controllers: [ApplyController],
  providers: [ApplyService]
})
export class ApplyModule {}
