const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("@nomiclabs/buidler");
const { utils } = require("ethers");

async function main() {
  console.log("📡 Deploy \n");

  // auto deploy to read contract directory and deploy them all (add ".args" files for arguments)
  //await autoDeploy();
  // OR
  // custom deploy (to use deployed addresses dynamically for example:)

  const MVPCLR = await deploy("MVPCLR",[120])// 778111

  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐶 Dog On it Dapps"))// 70-90k gas ~>$1 40G
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐰 Cotton Tailor"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🦊 Foxy Optics"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐻 Bear Market Liquors"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐹 Gerbilnomics Labs"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐭 Whiskerific Widgets"))


  await MVPCLR.startRound() // 45k gas  ~<$1 40G

  //add give support to a project
  await MVPCLR.donate(0,{ value: ethers.utils.parseEther("0.01") })  // 48212
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })



  //recipientWithdraw() ~70k per recipient but anyone can run it
                  // 1 dollar per ?



}





async function deploy(name, _args) {
  const args = _args || [];

  console.log(` 🛰  Deploying ${name}`);
  const contractArtifacts = await ethers.getContractFactory(name);
  const contract = await contractArtifacts.deploy(...args);
  console.log(" 📄",
    chalk.cyan(name),
    "deployed to:",
    chalk.magenta(contract.address),
    "\n"
  );
  fs.writeFileSync(`artifacts/${name}.address`, contract.address);
  console.log("💾  Artifacts (address, abi, and args) saved to: ",chalk.blue("packages/buidler/artifacts/"),"\n")
  return contract;
}

const isSolidity = (fileName) =>
  fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp.") < 0;

function readArgumentsFile(contractName) {
  let args = [];
  try {
    const argsFile = `./contracts/${contractName}.args`;
    if (fs.existsSync(argsFile)) {
      args = JSON.parse(fs.readFileSync(argsFile));
    }
  } catch (e) {
    console.log(e);
  }

  return args;
}

async function autoDeploy() {
  const contractList = fs.readdirSync(config.paths.sources);
  return contractList
    .filter((fileName) => isSolidity(fileName))
    .reduce((lastDeployment, fileName) => {
      const contractName = fileName.replace(".sol", "");
      const args = readArgumentsFile(contractName);

      // Wait for last deployment to complete before starting the next
      return lastDeployment.then((resultArrSoFar) =>
        deploy(contractName, args).then((result,b,c) => {

          if(args&&result&&result.interface&&result.interface.deploy){
            let encoded = utils.defaultAbiCoder.encode(result.interface.deploy.inputs,args)
            fs.writeFileSync(`artifacts/${contractName}.args`, encoded);
          }

          return [...resultArrSoFar, result]
        })
      );
    }, Promise.resolve([]));
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
