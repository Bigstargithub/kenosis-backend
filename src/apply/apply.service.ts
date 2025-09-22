import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplyEntity } from 'src/entities/apply.entity';
import { In, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { dateFormat } from 'src/utils/date_format';
import { APPLY_ROOL_LIST } from 'src/apply/apply.constant';

@Injectable()
export class ApplyService {
  constructor(
    @InjectRepository(ApplyEntity)
    private readonly applyEntity: Repository<ApplyEntity>,
  ) {}

  async availableRoomList(startDate: string, endDate: string) {
    const start = dateFormat(startDate);
    const end = dateFormat(endDate);

    const applyList = await this.applyEntity.find({
      where: {
        start_date: MoreThanOrEqual(start),
        end_date: LessThanOrEqual(start),
        apply_status: Not(In(['rejected'])),
      },
    });

    const availableRoomList = APPLY_ROOL_LIST.filter(
      (room) => !applyList.some((apply) => apply.room_number !== room),
    );

    return { status: 200, data: availableRoomList };
  }
}
