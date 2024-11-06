import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WebhookService } from './webhook/webhook.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000;

    await app.listen(port);
    console.log(`Aplicação rodando na porta ${port}`);

    const webhookService = app.get(WebhookService);
    await webhookService.configureWebhook();
}

bootstrap();
