// fib function to calculate the nth fibonacci number
function fib(n: number): number {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

// main function to call the fib function and print the result
function main() {
  const n = 10;
  const result = fib(n);
  console.log(`The ${n}th fibonacci number is ${result}`);
}

main();
