import LocalSetup from './localSetup';

describe('Local setup works', () => {
  it('local setup works', async () => {
    const local = new LocalSetup();
    console.log(local.dt1Address, local.dt2Address, local.tom, local.oceanAddress);
  });
});
