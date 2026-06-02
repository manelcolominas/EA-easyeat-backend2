import http from 'http';
import { URL } from 'url';
import { config } from '../config/config';

export interface LLMGenerateRequest {
  model: string;
  prompt: string;
  stop?: string[];
  [key: string]: unknown;
}

const LLM_API_URL = "http://10.4.119.50:8080/api/generate";

export async function generateText(request: LLMGenerateRequest): Promise<any> {
  const endpoint = config.llm.url;
  const parsedUrl = new URL(endpoint);
  const body = JSON.stringify(request);

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || '80',
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : {};

            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(json);
            } else {
              reject(new Error(`LLM service returned status ${res.statusCode}: ${data}`));
            }
          } catch (error) {
            reject(new Error(`Invalid JSON response from LLM service: ${error}`));
          }
        });
      }
    );

    req.on('error', (error) => reject(error));
    req.write(body);
    req.end();
  });
}
