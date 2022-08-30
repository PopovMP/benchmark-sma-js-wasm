# Performance test - JS v WASM

It generates fictional prices for 200000 bars.
Then calculates SMA for periods form 1 to 1000.

```shell
# Compile wat to wasm
npm run wat2wasm

# Run benchmark
node sma-test.js
```

The JS and Wasm performance is virtually equal.

```text
JS   test: 466ms
Wasm test: 463ms
```
