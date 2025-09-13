import { Controller, Get, Query } from '@nestjs/common';
import { ApplyService } from './apply.service';

@Controller('apply')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) {}

  @Get('availableEndDate')
  availableEndDate(@Query() query: { start_date: string }) {
    const startDate = query.start_date;
    return this.applyService.availableEndDate(startDate);
  }

}
