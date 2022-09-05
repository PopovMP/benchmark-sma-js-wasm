'use strict'

const {readFileSync} = require('node:fs')
const wasm = readFileSync('./sma-test.wasm')

const _bars = 200_000

const _price = Array(_bars)
const _ma    = Array(_bars)

for (let bar = 0; bar < _bars; bar++)
	_price[bar] = 1 + Math.random()

WebAssembly.instantiate(wasm, {}).then( res => {
	const {pushPrice, testSma, getSma} = res.instance.exports

	for(const pr of _price)
		pushPrice(pr)

	testJsSma(100)
	testSma(100)

	const jsStart = Date.now()
	testJsSma(1000)
	const jsEnd = Date.now()

	const wasmStart = Date.now()
	testSma(1000)
	const wasmEnd = Date.now()

	console.log('JS   test: ' + (jsEnd   - jsStart  ) + 'ms')
	console.log('Wasm test: ' + (wasmEnd - wasmStart) + 'ms')
	console.log()
	console.log('JS   MA: ' + _ma[_bars-1]     )
	console.log('Wasm MA: ' + getSma(_bars - 1))
})

function testJsSma(maxPeriod)
{
	for (let period = 1; period < maxPeriod; period++)
		jsSma(_price, _ma, period)
}

function jsSma(price, ma, period)
{
	let sum = 0
	for (let bar = 0; bar < period; bar++) {
		ma[bar] = 0
		sum += price[bar]
	}

	ma[period-1] = sum / period

	for (let bar = period, bars = price.length; bar < bars; bar++)
		ma[bar] = ma[bar-1] + (price[bar] - price[bar-period]) / period
}