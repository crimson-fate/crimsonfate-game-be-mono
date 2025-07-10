export const whitelistPage = [
  '*.starkarcade.com',
  'http://localhost:5173',
  'http://localhost:8001',
  'http://localhost:8000',
];

export function configureCors(whitelist: string[]) {
  const allowedOrigins = whitelist.map((item) => {
    if (item.startsWith('*.')) {
      const domain = item.substring(2).replace(/\./g, '\\.');
      return new RegExp(
        `^(https?://)?(([^.]+\\.)*${domain}|localhost|127\\.0\\.0\\.1)(:\\d{1,5})?(/?.*)?$`,
      );
    }
    return item;
  });

  return {
    origin: function (origin, callback) {
      if (!origin) {
        console.log('AI Allowed CORS for: Local (no origin)');
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return allowed === origin;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        console.log('AI Allowed CORS for:', origin);
        callback(null, true);
      } else {
        console.warn('Blocked CORS for:', origin);

        callback(
          new Error(`Not allowed by CORS: Origin ${origin} not in whitelist.`),
        );
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Content-Length,X-Foo',
  };
}
