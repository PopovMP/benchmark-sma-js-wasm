'use strict'

const {readFileSync} = require('node:fs')
const wasm = readFileSync('./sma-test.wasm')

WebAssembly.instantiate(wasm, {}).then(res => {
	const {pushPrice, testSma, getSma} = res.instance.exports

	const bars  = 200_000
	const price = Array(bars)
	const ma    = Array(bars)

	for (let bar = 0; bar < bars; bar++)
		price[bar] = 1 + Math.random()

	for(const pr of price)
		pushPrice(pr)

	const warmPeriod = 10
	const maxPeriod  = 1000

	testJsSma(price, ma, warmPeriod)
	testSma(warmPeriod)

	const jsStart = Date.now()
	testJsSma(price, ma, maxPeriod)
	const jsEnd = Date.now()

	const wasmStart = Date.now()
	testSma(maxPeriod)
	const wasmEnd = Date.now()

	console.log('JS   test: ' + (jsEnd   - jsStart  ) + 'ms')
	console.log('Wasm test: ' + (wasmEnd - wasmStart) + 'ms')
	console.log()
	console.log('JS   MA: ' + ma[bars-1]    )
	console.log('Wasm MA: ' + getSma(bars-1))
})

function testJsSma(price, ma, maxPeriod)
{
	for (let period = 1; period < maxPeriod; period++)
		jsSma(price, ma, period)
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