# ZorgToken
Script Kanggo Deploy ERC20

# Multi-Contract ERC-20 Deployer

Iki skrip Node.js kanggo **nggawe, compile, lan deploy akeh kontrak ERC-20 sekaligus** menyang jaringan EVM (kaya KiiChain). Skrip iki ndhukung fitur tambahan kaya mint, burn, pause, freeze, lan ngatur decimals & total supply.

---

## Fitur Utama

- Deploy **akeh kontrak sekaligus** karo jeneng lan simbol token custom.
- Pilihan kanggo nambah **suffix acak** ing jeneng lan simbol token.
- Fitur tambahan opsional:
  - Fungsi Burn
  - Fungsi Mint
  - Pause / Unpause
  - Freeze / Unfreeze
- Compile otomatis nganggo **solc**.
- Deploy nganggo **ethers.js** karo wallet saka `.env`.
- Auto-generate **link kontrak & transaksi** ing explorer saka `.env`.

---

## Persiapan

1. Clone repository iki.
2. Install dependency:

```
npm install
```

## gawe file .env
```
nano .env
```
### isien .env ne
```
RPC_URL=Gantien RPC testnet
EXPLORER_URL=https://explorer.kiichain.io/ttestnetPRIVATE_KEY=private_key_kamu
```

