const getmeobj = (value) => {
  const add = (num) => num + 2

  const object = {
    result: (val) => val + 2,
    notfunc: () => 'hello',
  }
  return object[value];
}

const myresult = getmeobj('notfunc');

const myarray = myresult(2)

console.log(`this is an array: ${myarray}`);
console.log('this' + "test")