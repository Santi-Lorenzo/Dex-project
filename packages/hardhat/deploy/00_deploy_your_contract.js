// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("Balloons", {
    from: deployer,
    log: true,
  });

  const balloons = await ethers.getContract("Balloons", deployer);

  await deploy("DEX", {
    from: deployer,
    args: [balloons.address],
    log: true,
    waitConfirmations: 5,
  });

  const dex = await ethers.getContract("DEX", deployer);

  await balloons.transfer(
    "0xa0db1A04a27768624cA086164B0B2B0e87a7a39b",
    "" + 10 * 10 ** 18
  );

  console.log(
    "Approving DEX (" + dex.address + ") to take Balloons from main account..."
  );

  await balloons.approve(dex.address, ethers.utils.parseEther("100"));
  console.log("INIT exchange...");
  await dex.init(ethers.utils.parseEther("5"), {
    value: ethers.utils.parseEther(".2"),
    gasLimit: 200000,
  });
};
module.exports.tags = ["Balloons", "DEX"];
