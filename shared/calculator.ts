export class Calculator {
   add = (num1: number, num2: number) => {
      return num1 + num2;
   };
}

console.log(new Calculator().add(1, 2));
