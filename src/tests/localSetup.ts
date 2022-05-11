import ganache from 'ganache-core';
import Web3 from 'web3';
import factory from '@oceanprotocol/contracts/artifacts/DTFactory.json';
import datatokensTemplate from '@oceanprotocol/contracts/artifacts/DataTokenTemplate.json';
import bFactory from '@oceanprotocol/contracts/artifacts/BFactory.json';
// import proxy from '@dataxfi/datax.js/dist/abi/DataxRouter.json';
import bPool from '@oceanprotocol/contracts/artifacts/BPool.json';
// import bToken from '@oceanprotocol/contracts/artifacts/BToken.json';
import { Ocean, Config } from '@dataxfi/datax.js';
// import { OceanPool } from '@dataxfi/datax.js/dist/balancer';
import { DataTokens } from '@dataxfi/datax.js/dist/Datatokens';
import { AbiItem } from 'web3-utils/types';
import { Logger } from '@dataxfi/datax.js/dist/utils/Logger';

async function setupGanache(): Promise<Web3> {
  const server = ganache.server({ seed: 'asd123', account_keys_path: 'src/tests/privateKeys.json' });
  return await new Promise<Web3>((resolve) => {
    server.listen(8545, () => {
      console.log('Ganache running at http://localhost:8545');
      // @ts-ignore
      resolve(new Web3(server.provider));
    });
  });
}

// function getAccounts(web3: Web3): Promise<string[]> {
//   return web3.eth.getAccounts();
// }

// function getBalance(address: string, web3: Web3): Promise<string> {
//   return web3.eth.getBalance(address);
// }

async function deployContract(web3: Web3, abi: AbiItem[] | AbiItem, minter: string, options: any): Promise<any> {
  const contract = new web3.eth.Contract(abi);
  const deploy = contract.deploy(options);
  const estGas = await deploy.estimateGas((err, estGas) => {
    if (err) throw err;
    return estGas;
  });

  console.log('ESTIMATED GAS:', estGas);
  const address = await deploy
    .send({
      from: minter,
      gas: estGas + 100000,
      gasPrice: '3000000000',
    })
    .then((contract) => {
      return contract.options.address;
    });

  return [address, contract];
}

async function setupPool(
  contract: any,
  acct: string,
  baseAddress: string,
  baseAmt: string,
  baseWeight: string,
  otherAddress: string,
  otherAmt: string,
  otherWeight: string,
  fee: string
) {
  const estGas = await contract.methods
    .setup(otherAddress, otherAmt, otherWeight, baseAddress, baseWeight, baseAmt, fee)
    .estimateGas({ from: acct }, (err: any, estGas: any) => {
      return err ? 10000000 : estGas + 1000;
    });

  const setupTx = await contract.methods
    .setup(otherAddress, otherAmt, otherWeight, baseAddress, baseWeight, baseAmt, fee)
    .send({ from: acct, gas: estGas });
  return setupTx;
}

export default class LocalSetup {
  public accounts: string[];
  public privateKeys: string[];
  public pool1Address: any;
  public coolToken: string;
  public oceanToken: string;

  private web3: Web3;
  private server: any;
  private dtTemplateAddress: any;
  private dtTemplateContract: any;
  private factoryAddress: any;
  private factoryContract: any;
  private pool1Contract: any;
  private balFactoryAddress: any;
  private balFactoryContract: any;
  private datatoken: DataTokens;
  private config: Config | undefined;
  private ocean: Ocean | undefined;
  private blob = 'http://localhost:8030/api/v1/services/consume';
  private tokenAmount = 100000;
  private dtAmount = '10';
  private dtWeight = '3';
  private oceanAmount = (parseFloat(this.dtAmount) * (10 - parseFloat(this.dtWeight))) / parseFloat(this.dtWeight);
  private fee = '0.01';
  private oceanWeight = '3';

  private async setupLocalServer() {
    const web3 = await setupGanache();
    this.web3 = web3;
    const accountsFile = require('./privateKeys.json');
    const accounts = Object.keys(accountsFile.private_keys);
    const privateKeys: string[] = Object.values(accountsFile.private_keys);
    this.accounts = accounts;
    this.privateKeys = privateKeys;
  }

  private async deployContracts() {
    // 1: deploy all contracts

    console.log(this.accounts, this.privateKeys);

    // datatoken template
    const [dtTemplateAddress, dtTemplateContract] = await deployContract(
      this.web3,
      datatokensTemplate.abi as AbiItem[],
      this.accounts[0],
      {
        data: datatokensTemplate.bytecode,
        arguments: [
          'Template Contract',
          'TEMPLATE',
          this.accounts[0],
          1400000000,
          'https://something.nothing',
          this.accounts[0],
        ],
      }
    );

    this.dtTemplateAddress = dtTemplateAddress;
    this.dtTemplateContract = dtTemplateContract;

    // datatoken factory
    const [factoryAddress, factoryContract] = await deployContract(
      this.web3,
      factory.abi as AbiItem[],
      this.accounts[0],
      {
        data: factory.bytecode,
        arguments: [dtTemplateAddress, this.accounts[0]],
      }
    );

    this.factoryAddress = factoryAddress;
    this.factoryContract = factoryContract;

    // datatoken pool
    const [pool1Address, pool1Contract] = await deployContract(this.web3, bPool.abi as AbiItem[], this.accounts[1], {
      data: bPool.bytecode,
    });

    this.pool1Address = pool1Address;
    this.pool1Contract = pool1Contract;

    // datatoken pool balancer factory
    const [balancerFactoryAddress, balancerFactoryContract] = await deployContract(
      this.web3,
      bFactory.abi as AbiItem[],
      this.accounts[0],
      {
        data: bFactory.bytecode,
        arguments: [pool1Address],
      }
    );

    this.balFactoryAddress = balancerFactoryAddress;
    this.balFactoryContract = balancerFactoryContract;
  }

  private async mintTokens() {
    // #2 mint tokens
    // create ocean token
    const Datatoken = new DataTokens(
      this.factoryAddress,
      factory.abi as AbiItem[],
      datatokensTemplate.abi as AbiItem[],
      this.web3 as Web3,
      new Logger()
    );
    const oceanToken = await Datatoken.create(
      'https://thisIsWhereMyMetadataIs.com',
      this.accounts[0],
      '1400000000',
      'OCEAN Token',
      'OCEAN'
    ); // create a ocean token

    // create another token
    const coolToken = await Datatoken.create(
      'https://thisIsWhereMyMetadataIs.com',
      this.accounts[0],
      '1400000000',
      'Keith',
      'COOL'
    );

    const ocean = new Ocean(this.web3, 1337, this.balFactoryAddress, oceanToken);
    this.ocean = ocean;
    this.coolToken = coolToken;
    this.oceanToken = oceanToken;

    // mint / approve tokens for account 2
    await Datatoken.mint(oceanToken, this.accounts[0], '10000000', this.accounts[1]);
    await Datatoken.mint(coolToken, this.accounts[0], '10000000', this.accounts[1]);
    await Datatoken.mint(oceanToken, this.accounts[2], '10000000', this.accounts[2]);

    await ocean.approve(oceanToken, this.pool1Address, '10000000', this.accounts[1]);
    await ocean.approve(coolToken, this.pool1Address, '10000000', this.accounts[1]);
    await ocean.approve(coolToken, this.pool1Address, '10000000', this.accounts[2]);
  }

  private async setupTestPool() {
    this.pool1Contract.options.address = this.pool1Address;
    // setup pool for testing
    await setupPool(
      this.pool1Address,
      this.accounts[1],
      this.oceanToken,
      this.web3.utils.toWei(String(this.oceanAmount)),
      this.web3.utils.toWei(String(this.oceanWeight)),
      this.coolToken,
      this.web3.utils.toWei(String(this.dtAmount)),
      this.web3.utils.toWei(String(this.dtWeight)),
      this.web3.utils.toWei(String(this.fee))
    );
  }

  public async setupLocalSetup() {
    await this.setupLocalServer();
    await this.deployContracts();
    await this.mintTokens();
    await this.setupTestPool();
  }
}
