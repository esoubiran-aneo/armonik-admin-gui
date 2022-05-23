import { Pagination } from '@armonik.admin.gui/armonik-typing';
import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { Session } from './schemas';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  index(
    @Query('page', ParseIntPipe) page,
    @Query('limit', ParseIntPipe) limit
  ): Promise<Pagination<Session>> {
    return this.sessionsService.findAllPaginated(page, limit);
  }
}
