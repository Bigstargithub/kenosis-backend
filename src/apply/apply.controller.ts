import { Controller, Get, Query } from '@nestjs/common';
import { ApplyService } from './apply.service';

@Controller('apply')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) {}

  @Get('available-room')
  availableEndDate(@Query() query: { start_date: string; end_date: string }) {
    const startDate = query.start_date;
    const endDate = query.end_date;
    return this.applyService.availableRoomList(startDate, endDate);
  }
}
