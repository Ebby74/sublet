import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  base: {
    app: 'sublet',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function withRequestContext(
  req: Request | null,
  extra: Record<string, unknown> = {}
) {
  const requestId =
    req?.headers.get('x-request-id') ??
    req?.headers.get('x-correlation-id') ??
    crypto.randomUUID();

  const userId = req?.headers.get('x-user-id') ?? undefined;

  return logger.child({ requestId, userId, ...extra });
}
