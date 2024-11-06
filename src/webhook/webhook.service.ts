import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(private readonly configService: ConfigService) {}

    private async getNgrokUrl(): Promise<string> {
        try {
            const ngrokApiUrl = this.configService.get<string>('NGROK_API_URL');
            const response = await axios.get(ngrokApiUrl);
            const data = response.data as { tunnels: { public_url: string }[] };
            return data.tunnels[0].public_url;
        } catch (error) {
            this.logger.error('Erro ao obter URL do ngrok:', error);
            throw new Error('Erro ao obter URL do ngrok');
        }
    }

    public async configureWebhook(): Promise<void> {
        try {
            const ngrokUrl = await this.getNgrokUrl();
            const callbackUrl = `${ngrokUrl}/webhook`;
            const appId = this.configService.get<string>('APP_ID');
            const appSecret = this.configService.get<string>('APP_SECRET');
            const verifyToken = this.configService.get<string>('VERIFY_TOKEN');
            const accessToken = `${appId}|${appSecret}`;
            const facebookApiUrl =
                this.configService.get<string>('FACEBOOK_API_URL');

            this.logger.log(`Configurando o Webhook:
                APP_ID: ${appId}, 
                ACCESS_TOKEN: ${accessToken}, 
                VERIFY_TOKEN: ${verifyToken}, 
                CALLBACK_URL: ${callbackUrl}`);

            const response = await axios.post(
                `${facebookApiUrl}/${appId}/subscriptions?access_token=${accessToken}`,
                {
                    object: 'page',
                    callback_url: callbackUrl,
                    verify_token: verifyToken,
                    fields: 'messages,messaging_postbacks',
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                this.logger.log(
                    'Webhook configurado com sucesso:',
                    response.data
                );
            } else {
                this.logger.error(
                    'Erro ao configurar o webhook:',
                    response.data
                );
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                this.logger.error(
                    'Erro na configuração do webhook (detalhes da resposta):',
                    {
                        message: error.message,
                        data: error.response?.data,
                        headers: error.response?.headers,
                        status: error.response?.status,
                    }
                );
            } else {
                this.logger.error(
                    'Erro desconhecido na configuração do webhook:',
                    error
                );
            }
        }
    }
}
