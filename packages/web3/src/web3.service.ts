import configuration from '@app/shared/configuration';
import { Injectable, Logger } from '@nestjs/common';
import { Account, stark, TypedData, RpcProvider } from 'starknet';

@Injectable()
export class Web3Service {
  logger = new Logger(Web3Service.name);

  getProvider(): RpcProvider {
    const provider = new RpcProvider({ nodeUrl: configuration().RPC_URL });
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

  async validatorSignMessage(message: TypedData): Promise<string[]> {
    const account = this.getValidatorAccount();
    const signature = await account.signMessage(message);
    return stark.formatSignature(signature);
  }

  async checkTransaction(txHash: string): Promise<boolean> {
    const provider = this.getProvider();
    await provider.waitForTransaction(txHash);
    const txReceipt = await provider.getTransactionReceipt(txHash);
    return txReceipt.isSuccess();
  }
}
