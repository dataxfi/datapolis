import ganache from 'ganache-core';
import Web3 from 'web3';
import factory from '@oceanprotocol/contracts/artifacts/DTFactory.json';
import datatokensTemplate from '@oceanprotocol/contracts/artifacts/DataTokenTemplate.json';
import bFactory from '@oceanprotocol/contracts/artifacts/BFactory.json';
import proxy from '@dataxfi/datax.js/dist/abi/DataxRouter.json';
import bPool from '@oceanprotocol/contracts/artifacts/BPool.json';
import bToken from '@oceanprotocol/contracts/artifacts/BToken.json';
import { TestContractHandler } from '@dataxfi/datax.js/test/TestContractHandler';
import { BalancerContractHandler } from '@dataxfi/datax.js/test/BalancerContractHandler';
import { Ocean, Config } from '@dataxfi/datax.js';
import { OceanPool } from '@dataxfi/datax.js/dist/balancer';
import { DataTokens } from '@dataxfi/datax.js/dist/Datatokens';
import { AbiItem } from 'web3-utils/types';
import { Logger as LoggerInstance } from '@dataxfi/datax.js/dist/utils/Logger';

export default class LocalSetup {
  public web3 = new Web3(ganache.provider() as any);
  public server = ganache.server({ seed: 'asd123' });

  public DTContracts = new TestContractHandler(
    factory.abi as AbiItem[],
    datatokensTemplate.abi as AbiItem[],
    datatokensTemplate.bytecode,
    factory.bytecode,
    this.web3
  );

  public tom: string;
  public BalancerContracts: BalancerContractHandler;

  public datatoken = new DataTokens(
    this.DTContracts.factoryAddress,
    factory.abi as AbiItem[],
    datatokensTemplate.abi as AbiItem[],
    this.web3,
    new LoggerInstance()
  );

  public dt1Address: string;
  public dt2Address: string;
  public oceanAddress: string;
  public config: Config | undefined;
  public ocean: Ocean | undefined;

  private blob = 'http://localhost:8030/api/v1/services/consume';
  private tokenAmount = 100000;
  private dtAmount = '3000';
  private dtWeight = '3';
  private oceanAmount = (parseFloat(this.dtAmount) * (10 - parseFloat(this.dtWeight))) / parseFloat(this.dtWeight);
  private fee = '0.01';
  private oceanWeight = 10 - parseInt(this.dtWeight);

  constructor() {
    this.tom = '';
    this.DTContracts.getAccounts().then(() => {
      this.tom = this.DTContracts.accounts[0];
      this.DTContracts.deployContracts(this.tom);
    });

    this.BalancerContracts = new BalancerContractHandler(
      bFactory.abi as AbiItem[],
      bFactory.bytecode,
      bPool.abi as AbiItem[],
      bPool.bytecode,
      proxy.abi as AbiItem[],
      proxy.bytecode,
      this.web3
    );

    this.BalancerContracts.getAccounts().then(() => {
      console.log('BALANCER PRE-DEPLOYED');
      this.BalancerContracts.SdeployContracts(this.tom).then(() => {
        console.log('BALANCER DEPLOYED');
      });
    });

    //create ocean / mint ocean
    this.oceanAddress = '';
    this.datatoken.create(this.blob, this.tom, '1000000000000000', 'Ocean Token', 'OCEAN').then((res) => {
      this.oceanAddress = res;
      this.ocean = new Ocean(this.web3, 1337, this.BalancerContracts.factoryAddress, res);
      this.datatoken.mint(res, this.tom, '1000000000000000');
    });

    // create first dt / mint / make pool
    this.dt1Address = '';
    let estGas: number = 1000000;
    this.datatoken.create(this.blob, this.tom, '10000000000', 'SAGACIOUS KRILL TOKEN', 'SAGKRI-94').then((res) => {
      this.dt1Address = res;
      this.datatoken.mint(res, this.tom, this.tokenAmount.toString());
      this.ocean?.approve(res, this.BalancerContracts.pool1Address, this.dtAmount, this.tom);
      this.BalancerContracts.pool1.options.address = this.BalancerContracts.pool1Address;
      this.BalancerContracts.pool1.methods
        .setup(
          this.dt1Address,
          this.web3.utils.toWei(String(this.dtAmount)),
          this.web3.utils.toWei(String(this.dtWeight)),
          this.oceanAddress,
          this.web3.utils.toWei(String(this.oceanAmount)),
          this.web3.utils.toWei(String(this.oceanWeight)),
          this.web3.utils.toWei(this.fee)
        )
        .estimateGas({ from: this.tom }, (err: any, estGas: any) => (err ? 1000000 : estGas))
        .then((res: any) => {
          estGas = res;
          this.BalancerContracts.pool1.methods
            .setup(
              this.dt1Address,
              this.web3.utils.toWei(String(this.dtAmount)),
              this.web3.utils.toWei(String(this.dtWeight)),
              this.oceanAddress,
              this.web3.utils.toWei(String(this.oceanAmount)),
              this.web3.utils.toWei(String(this.oceanWeight)),
              this.web3.utils.toWei(this.fee)
            )
            .send({
              from: this.tom,
              gas: res + 1,
            });
        });
    });

    // create second dt / mint / make pool
    this.dt2Address = '';
    this.datatoken.create(this.blob, this.tom, '10000000000', 'DAZZLING ORCA TOKEN', 'DAZORC-13').then((res) => {
      this.dt2Address = res;
      this.datatoken.mint(res, this.tom, this.tokenAmount.toString());
    });

    this.BalancerContracts.pool2.methods
      .setup(
        this.dt2Address,
        this.web3.utils.toWei(String(this.dtAmount)),
        this.web3.utils.toWei(String(this.dtWeight)),
        this.oceanAddress,
        this.web3.utils.toWei(String(this.oceanAmount)),
        this.web3.utils.toWei(String(this.oceanWeight)),
        this.web3.utils.toWei(this.fee)
      )
      .send({
        from: this.tom,
        gas: estGas + 1,
      });
  }
}




