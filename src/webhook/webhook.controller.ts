import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private configService: ConfigService) {}

    @Get()
    verifyToken(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
        @Res() res: Response
    ) {
        const VERIFY_TOKEN = this.configService.get<string>('VERIFY_TOKEN');

        this.logger.log(
            `Recebido - mode: ${mode}, token: ${token}, challenge: ${challenge}`
        );
        this.logger.log(`VERIFY_TOKEN esperado: ${VERIFY_TOKEN}`);

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            this.logger.log('WEBHOOK_VERIFIED: Token e modo estão corretos');
            res.status(200).send(challenge);
        } else {
            this.logger.error(
                'Token de verificação inválido ou modo incorreto'
            );
            res.status(403).send('Token de verificação inválido');
        }
    }
}
