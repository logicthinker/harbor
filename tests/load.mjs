import autocannon from 'autocannon'

const url = process.argv[2] ?? 'http://127.0.0.1:5173/'
const result = await new Promise((resolve, reject) => autocannon({ url, connections: 10, duration: 5 }, (error, summary) => error ? reject(error) : resolve(summary)))
console.log(JSON.stringify({ url, requests: result.requests, throughput: result.throughput, errors: result.errors, timeouts: result.timeouts }, null, 2))
if (result.errors > 0 || result.timeouts > 0) process.exitCode = 1
