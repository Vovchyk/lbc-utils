# LBC Utils Project

This project demonstrates a basic use case of LBC smart contract. It comes with sample hardhat tasks to calculate quote hash and
register a peg-in BTC transaction.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat help hash-quote
npx hardhat hash-quote --quote '<quote-json-object>'
npx hardhat help register-peg-in
npx hardhat register-peg-in \
  --quote '<quote-json-object>' \
  --signature '<hex-encoded bytes of signature>' \
  --btc-raw-tx '<hex-encoded bytes of BTC raw transaction>' \
  --pmt '<hex-encoded bytes of partial merkle tree>' \
  --height '<height of BTC block>'
```
