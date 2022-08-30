'use strict'

const {readFileSync} = require('node:fs')
const wasm = readFileSync('./sma-test.wasm')

const _bars = 200_000

const _price = Array(_bars)
const _ma    = Array(_bars)

for (let bar = 0; bar < _bars; bar++)
	_price[bar] = 1 + Math.random()

WebAssembly.instantiate(wasm, {}).then( res => {
	const {pushPrice, testSma} = res.instance.exports

	for(const pr of _price)
		pushPrice(pr)

	const jsSatrt = Date.now()
	testJsSma(1000)
	const jsEnd = Date.now()

	const wasmSatrt = Date.now()
	testSma(1000)
	const wasmEnd = Date.now()

	console.log('JS   test: ' + (jsEnd   - jsSatrt  ) + 'ms')
	console.log('Wasm test: ' + (wasmEnd - wasmSatrt) + 'ms')
})

function testJsSma(maxPeriod)
{
	for (let period = 1; period < maxPeriod; period++)
		jsSma(period)	
}

function jsSma(period)
{
	let sum = 0
	for (let bar = 0; bar < period; bar++) {
		_ma[bar] = 0
		sum += _price[bar]
	}

	_ma[period-1] = sum / period

	for (let bar = period; bar < _bars; bar++)
		_ma[bar] = _ma[bar-1] + (_price[bar] - _price[bar-period]) / period
}