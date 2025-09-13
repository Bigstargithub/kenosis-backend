import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplyEntity } from 'src/entities/apply.entity';
import { In, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';

@Injectable()
export class ApplyService {
  constructor(
    @InjectRepository(ApplyEntity)
    private readonly applyEntity: Repository<ApplyEntity>,
  ) {}

  async availableEndDate(startDate: string) {
    // '2025-09-10' 형식의 문자열을 안전하게 Date 객체로 변환하기 위해 split 사용
    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);

    const applyList = await this.applyEntity.find({
      where: {
        end_date: LessThanOrEqual(start),
        status: Not(In(['rejected']))
      },
    });


    let availableEndDateList = [];
    
    for (let i = 0; i < 31; i++) {
      availableEndDateList.push(new Date(start.getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }

    availableEndDateList = availableEndDateList.filter(date => !applyList.some(apply => {
      return apply.end_date >= new Date(date);
    }));
    return {'status': 200, 'data': availableEndDateList};
  }
}
