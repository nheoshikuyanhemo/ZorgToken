#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import solc from "solc";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function randomSuffix() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

async function main() {
  try {
    console.log(`
██████║║██╗║║ ██╗     ██║║║█████║╗   ║
██╔════╝██║     ██║ ██╔═══██╗  ██║ ║║
█████╗  ██║       ██║     ██║  ██╔╝
██╔══╝  ██║     ██║ ██║   ███████╔═║║║
██████╚ ██╔║║╗██║     ██║║██   ██║  ║
╚═════ ╚═══   ══╝    ╚══╝ ╚═╝  ╚═╝
⚡ Multi-Contract Deployer by Eixa
Tekan ENTER untuk memulai...
`);
    await ask("");

    // --- INPUT USER ---
    let contractCount = parseInt(await ask("Berapa banyak smart contract yang mau dibuat? ")) || 1;
    const baseName = await ask("Base Token Name: ");
    const baseSymbol = await ask("Token Symbol: ");
    let totalSupply = BigInt(await ask("Total Supply (angka, ex: 1000000): ")) * 10n ** 18n;
    const addBurn = (await ask("Add burn function? (y/n): ")).toLowerCase() === "y";
    const addMint = (await ask("Add mint function? (y/n): ")).toLowerCase() === "y";
    const addPause = (await ask("Add pause/unpause function? (y/n): ")).toLowerCase() === "y";
    const addFreeze = (await ask("Add freeze/unfreeze function? (y/n): ")).toLowerCase() === "y";
    let decimals = await ask("Decimals (default 18, enter to skip): ");
    decimals = decimals ? parseInt(decimals) : 18;
    const useRandomSuffix = (contractCount > 1)
      ? (await ask("Gunakan suffix random? (y/n): ")).toLowerCase() === "y"
      : false;
    const deleteAfterDeploy = (await ask("Hapus file .sol setelah deploy? (y/n): ")).toLowerCase() === "y";
    const burnAfterDeploy = (await ask("Burn seluruh token ke wallet dead setelah deploy? (y/n): ")).toLowerCase() === "y";

    rl.close();

    const contractsDir = path.join(process.cwd(), "contracts");
    if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir);

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    for (let i = 1; i <= contractCount; i++) {
      let suffix = useRandomSuffix ? randomSuffix() : (contractCount > 1 ? i : "");
      let contractName = `${baseName}${suffix}`;
      let contractSymbol = `${baseSymbol}${useRandomSuffix ? randomSuffix() : suffix}`;
      const fileName = contractName + ".sol";
      const contractPath = path.join(contractsDir, fileName);

      // --- Generate Contract ---
      let code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ${contractName} {
    string public name = "${contractName}";
    string public symbol = "${contractSymbol}";
    uint8 public constant decimals = ${decimals};
    uint256 public totalSupply;
    address public owner;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);`;

      if (addPause) code += `
    bool public paused = false;
    event Paused(address indexed account);
    event Unpaused(address indexed account);`;
      if (addBurn) code += `\n    event Burn(address indexed account, uint256 amount);`;
      if (addMint) code += `\n    event Mint(address indexed account, uint256 amount);`;
      if (addFreeze) code += `
    mapping(address => bool) public frozen;
    event Frozen(address indexed account);
    event Unfrozen(address indexed account);`;

      code += `
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }`;
      if (addPause) code += `\n    modifier whenNotPaused() { require(!paused, "Paused"); _; }`;

      code += `
    constructor() {
        owner = msg.sender;
        totalSupply = ${totalSupply.toString()};
        _balances[owner] = totalSupply;
        emit Transfer(address(0), owner, totalSupply);
        emit OwnershipTransferred(address(0), owner);
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external${addPause ? " whenNotPaused" : ""} returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address holder, address spender) external view returns (uint256) {
        return _allowances[holder][spender];
    }

    function transferFrom(address from, address to, uint256 amount) external${addPause ? " whenNotPaused" : ""} returns (bool) {
        require(_allowances[from][msg.sender] >= amount, "Allowance exceeded");
        require(_balances[from] >= amount, "Insufficient balance");
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }`;

      if (addPause) code += `
    function pause() external onlyOwner { paused = true; emit Paused(msg.sender); }
    function unpause() external onlyOwner { paused = false; emit Unpaused(msg.sender); }`;

      if (addBurn) code += `
    function burn(uint256 amount) external${addPause ? " whenNotPaused" : ""} {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        totalSupply -= amount;
        emit Burn(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }`;

      if (addMint) code += `
    function mint(address to, uint256 amount) external onlyOwner {
        _balances[to] += amount;
        totalSupply += amount;
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }`;

      if (addFreeze) code += `
    function freeze(address account) external onlyOwner { frozen[account] = true; emit Frozen(account); }
    function unfreeze(address account) external onlyOwner { frozen[account] = false; emit Unfrozen(account); }`;

      code += "\n}";

      fs.writeFileSync(contractPath, code);
      console.log(`📄 [${i}/${contractCount}] Kontrak ${fileName} dibuat!`);

      // --- Compile ---
      const input = {
        language: "Solidity",
        sources: { [fileName]: { content: code } },
        settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
      };

      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      if (output.errors && output.errors.some(e => e.severity === "error")) {
        console.error("❌ Error compile:", output.errors);
        continue;
      }

      const contract = output.contracts[fileName][contractName];
      const abi = contract.abi;
      const bytecode = contract.evm.bytecode.object;

      try {
        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        console.log(`🚀 [${i}/${contractCount}] Deploying ${contractName}...`);
        const deployed = await factory.deploy();
        await deployed.deploymentTransaction().wait();

        const txHash = deployed.deploymentTransaction().hash;
        const explorerUrl = process.env.EXPLORER_URL;

        console.log(`✅ [${i}/${contractCount}] Contract deployed: ${deployed.target}`);
        console.log(`🔗 Contract link: ${explorerUrl}/address/${deployed.target}`);
        console.log(`🔗 Deployment TX: ${explorerUrl}/tx/${txHash}`);

        // --- Burn if requested ---
        if (burnAfterDeploy && addBurn) {
          const contractInstance = new ethers.Contract(deployed.target, abi, wallet);
          const balance = await contractInstance.balanceOf(wallet.address);
          if (balance > 0) {
            const burnTx = await contractInstance.burn(balance);
            console.log(`🔥 [${i}/${contractCount}] Seluruh token (${balance}) diburn ke 0x000000000000000000000000000000000000dEaD`);
            console.log(`🔗 Burn TX: ${explorerUrl}/tx/${burnTx.hash}`);
            await burnTx.wait();
          }
        }

        // --- Delete file if requested ---
        if (deleteAfterDeploy) {
          fs.unlinkSync(contractPath);
          console.log(`🗑️ [${i}/${contractCount}] File ${fileName} dihapus setelah deploy.`);
        }

      } catch (deployError) {
        console.error("❌ Deploy gagal:", deployError);
      }
    }

  } catch (err) {
    console.error("Error:", err);
    rl.close();
  }
}

main();
