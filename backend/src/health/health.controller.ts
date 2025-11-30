import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'credchit-api',
      timestamp: new Date().toISOString(),
    };
  }
}

