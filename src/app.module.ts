import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './webhook/webhook.module';
import { ConfigModule } from '@nestjs/config';
import { WebhookService } from './webhook/webhook.service';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), WebhookModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements OnModuleInit {
    constructor(private readonly webhookService: WebhookService) {}

    async onModuleInit() {
        await this.webhookService.configureWebhook();
    }
}
