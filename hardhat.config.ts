import {HardhatUserConfig, task} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import {BigNumber} from "ethers";
import {HardhatRuntimeEnvironment} from "hardhat/types";

const bs58check = require('bs58check');
const bignumJSON = require('json-bignum');

const config: HardhatUserConfig = {
    defaultNetwork: "rskTestnet",
    networks: {
        hardhat: {},
        rskTestnet: {
            chainId: 31,
            url: 'https://public-node.testnet.rsk.co/',
            accounts: [], // require("fs").readFileSync(".secret").toString().trim();
        }
    },
    solidity: "0.8.9",
};

task("hash-quote", "Returns a quote hash")
    .addParam("quote", "Quote object")
    .setAction(async (taskArgs, hre) => {
        const lbcAbi = [
            "function hashQuote(tuple(bytes20 fedBtcAddress, address lbcAddress, address liquidityProviderRskAddress, bytes btcRefundAddress, address payable rskRefundAddress, bytes liquidityProviderBtcAddress, uint256 callFee, uint256 penaltyFee, address contractAddress, bytes data, uint32 gasLimit, int64 nonce, uint256 value, uint32 agreementTimestamp, uint32 timeForDeposit, uint32 callTime, uint16 depositConfirmations, bool callOnRegister) memory quote) public view returns (bytes32)"
        ];

        const lbcQuote = parseLbcQuote(taskArgs.quote, hre);

        const lbc = new hre.ethers.Contract(lbcQuote.lbcAddress, lbcAbi, hre.ethers.provider);

        const hash = await lbc.callStatic.hashQuote(lbcQuote);
        console.log("\nQuote hash: ", hash);
    });

task("register-peg-in", "Registers a peg-in tx")
    .addParam("quote", "Quote object")
    .addParam("signature", "Quote signature")
    .addParam("btcRawTx", "BTC raw transaction")
    .addParam("pmt", "Partial merkle tree")
    .addParam("height", "BTC block height")
    .setAction(async (taskArgs, hre) => {
        const lbcAbi = [
            "function registerPegIn(tuple(bytes20 fedBtcAddress, address lbcAddress, address liquidityProviderRskAddress, bytes btcRefundAddress, address payable rskRefundAddress, bytes liquidityProviderBtcAddress, uint256 callFee, uint256 penaltyFee, address contractAddress, bytes data, uint32 gasLimit, int64 nonce, uint256 value, uint32 agreementTimestamp, uint32 timeForDeposit, uint32 callTime, uint16 depositConfirmations, bool callOnRegister) memory quote, bytes memory signature, bytes memory btcRawTransaction, bytes memory partialMerkleTree, uint256 height) public returns (int256)"
        ];

        const lbcQuote = parseLbcQuote(taskArgs.quote, hre);
        const signature = taskArgs.signature;
        const btcRawTx = taskArgs.btcRawTx;
        const pmt = taskArgs.pmt;
        const height = taskArgs.height;

        const lbc = new hre.ethers.Contract(lbcQuote.lbcAddress, lbcAbi, hre.ethers.provider);

        const tx = await lbc.registerPegIn(lbcQuote, signature, btcRawTx, pmt, height);
        console.log("\nregisterPegIn tx: : ", tx);
    });

function parseLbcQuote(str: string, hre: HardhatRuntimeEnvironment): any {
    const lpsQuote = bignumJSON.parse(str);

    return {
        fedBtcAddress: "0x" + Buffer.from(bs58check.decode(lpsQuote.fedBTCAddr).slice(1)).toString('hex'),
        lbcAddress: hre.ethers.utils.getAddress(lpsQuote.lbcAddr.toLowerCase()),
        liquidityProviderRskAddress: lpsQuote.lpRSKAddr,
        btcRefundAddress: "0x" + Buffer.from(bs58check.decode(lpsQuote.btcRefundAddr)).toString('hex'),
        rskRefundAddress: hre.ethers.utils.getAddress(lpsQuote.rskRefundAddr.toLowerCase()),
        liquidityProviderBtcAddress: "0x" + Buffer.from(bs58check.decode(lpsQuote.lpBTCAddr)).toString('hex'),
        callFee: BigNumber.from(lpsQuote.callFee),
        penaltyFee: BigNumber.from(lpsQuote.penaltyFee),
        contractAddress: hre.ethers.utils.getAddress(lpsQuote.contractAddr.toLowerCase()),
        data: lpsQuote.data,
        gasLimit: lpsQuote.gasLimit,
        nonce: BigNumber.from(lpsQuote.nonce.toString()),
        value: BigNumber.from(lpsQuote.value.toString()),
        agreementTimestamp: lpsQuote.agreementTimestamp,
        timeForDeposit: lpsQuote.timeForDeposit,
        callTime: lpsQuote.callTime,
        depositConfirmations: lpsQuote.confirmations,
        callOnRegister: lpsQuote.callOnRegister,
    };
}

export default config;
