import configuration from '@app/shared/configuration';
import { Injectable, Logger } from '@nestjs/common';
import { Account, Provider } from 'starknet';

@Injectable()
export class Web3Service {
  logger = new Logger(Web3Service.name);

  getProvider() {
    const provider = new Provider({ nodeUrl: configuration().RPC_URL });
    return provider;
  }

  getValidatorAccount() {
    const provider = this.getProvider();
    const account = new Account(
      provider,
      configuration().VALIDATOR.ADDRESS,
      configuration().VALIDATOR.PRIVATE_KEY,
    );

    return account;
  }
}
