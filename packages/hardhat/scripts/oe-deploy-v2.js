/* eslint no-use-before-define: "warn" */
const { deploy } = require('./utils')

const main = async () => {

  console.log("\n\n 📡 Deploying...\n");

  const l1MessengerAddress = '0x6418E5Da52A3d7543d393ADD3Fa98B0795d27736'
  const l2MessengerAddress = '0x4200000000000000000000000000000000000007'

  const decimals = 18
  const name = "OldEnglish"
  const symbol = "OE"
  const initialSupply = "100"

  const yourContractL2 = await deploy({contractName: "YourContract", rpcUrl: "http://localhost:8545", ovm: true})

  const erc20 = await deploy({contractName: "ERC20", rpcUrl: "http://localhost:9545", ovm: false, _args: [initialSupply, symbol, decimals]}) // <-- add in constructor args like line 19 vvvv

  const l2Deposited = await deploy({contractName: "L2DepositedERC20", rpcUrl: "http://localhost:8545", ovm: true, _args: [l2MessengerAddress, decimals, name, symbol]})

  const l1Erc20Gateway = await deploy({contractName: "L1ERC20Gateway", rpcUrl: "http://localhost:9545", ovm: false, _args: [erc20.address, l2Deposited.address, l1MessengerAddress]})

  const init = await l2Deposited.init(l1Erc20Gateway.address)
  console.log(init)
  //_l2CrossDomainMessenger, _decimals, _name, _symbol
  //_l1ERC20,_l2DepositedERC20,_l1messenger
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
