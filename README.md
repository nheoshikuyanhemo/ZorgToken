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
```
git clone https://github.com/nheoshikuyanhemo/ZorgToken.git
```
3. Install dependency:

```
npm install
```

### gawe file .env
```
nano .env
```
### isien .env ne
```
RPC_URL=Gantien RPC testnet
EXPLORER_URL=Gantien Explorer sing nggenah
PRIVATE_KEY=private_key_kamu
```
#### di jogo apik-apik file iki, bahaya onok private key mu


## Cara Nggae

Njalanke skrip:
```
node scripts/deploy.js
```
Skrip bakal onok pilihane:

1. Pira kontrak sing arep digawe.


2. Jeneng dasar token (Base Token Name).


3. Simbol token (Token Symbol).


4. Total supply (otomatis dikali 10^18).


5. Pilihan tambahan: burn, mint, pause/unpause, freeze/unfreeze.


6. Decimals (default 18).


7. Gunakake suffix acak? (kanggo kontrak luwih saka siji)



Sakwise input, skrip bakal:

Nggawe file .sol ing folder contracts.

Compile kontrak.

Deploy kontrak nganggo wallet saka .env.

Nampilake link kontrak & transaksi ing explorer.



---

## Contoh Output
```
📄 Kontrak MyToken.sol digawe!
🚀 Deploying MyToken...
✅ Contract deployed: 0x1234567890abcdef...
🔗 Contract link: https://explorer.asu/testnet/address/0x1234567890abcdef...
🔗 Deployment TX: https://explorer.tx.mbut/testnet/tx/0xabcdef1234567890...
```
## File Smart contract.sol di kumpulke ing folder contracts
---

## Dependency

Node.js

ethers.js

solc

dotenv



---

## Cathetan

Pastikne wallet duwe saldo cukup kanggo deploy kontrak.

Tes dhisik ing testnet sadurunge mainnet.

Link explorer otomatis saka EXPLORER_URL ing .env.



---

Digawe dening Eixa / 0xEixa
Multi-Contract Deployer v1.0

---
