import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint de salud para monitoreo (Fase 7)
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
