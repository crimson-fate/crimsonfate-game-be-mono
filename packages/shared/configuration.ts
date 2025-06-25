import { config } from 'dotenv';
config();
config({ path: '../../.env' });

export default () => ({
  JWT_SECRET: String(process.env.JWT_SECRET),
  JWT_EXPIRE: String(process.env.JWT_EXPIRE),
  MONGODB_URI: String(process.env.MONGODB_URI),
  RPC_URL: String(process.env.RPC_URL),
  SERVER_URL: String(process.env.SERVER_URL),
  PORT: {
    API: Number(process.env.API_PORT),
    AI: Number(process.env.AI_PORT),
  },
  REDIS: {
    HOST: String(process.env.REDIS_HOST),
    PORT: Number(process.env.REDIS_PORT),
    URL: String(process.env.REDIS_URL),
  },
  VALIDATOR: {
    PRIVATE_KEY: String(process.env.VALIDATOR_PRIVATE_KEY),
    ADDRESS: String(process.env.VALIDATOR_ADDRESS),
  },
  VALIDATOR: {
    PRIVATE_KEY: String(process.env.VALIDATOR_PRIVATE_KEY),
    ADDRESS: String(process.env.VALIDATOR_ADDRESS),
  },
});
