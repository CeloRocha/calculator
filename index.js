const buttons = document.querySelectorAll('.keyboard > button');
const displayInput = document.querySelector('#displayInput');
const displayResult = document.querySelector('#displayResult');

displayInput.innerHTML = '';
displayResult.innerHTML = '';

//Button on click send info to display
buttons.forEach((elem)=>{
    elem.onclick = function(){
        info(elem.value);
    }
});

const info = (number)=>{
    const regexOperations = /[+-\/*]/;
    const regexNumbers = /[\.0-9]/;

    //Keyboard press a number or a dot.
    if(regexNumbers.test(number)){
        const dot = /\./;
        //if a dot already exist, dot button will do nothing
        if(number === '.' && dot.test(displayResult.innerHTML)){
            console.log(dot.test(displayResult.innerHTML))
            return;
        }
        displayResult.innerHTML += number;

    //Pressing a operator
    }else if(regexOperations.test(number)){
        //If non exist a value in display, just a minus can be put.
        if(displayResult.innerHTML === '' && displayInput.innerHTML === ''){
            if(number ==='-'){
                displayInput.innerHTML += number;
            }
        //If a operator is being pressed and non have a new input value
        //then changes de operator.
        }else if(regexOperations.test(displayInput.innerHTML.slice(-1)) && displayResult.innerHTML === ''){
            if(displayInput.innerHTML!=='-'){
            displayInput.innerHTML = eraseOne(displayInput.innerHTML)+number;
            }
        }else{
        //Pass values do up display and reset de one below
        displayInput.innerHTML += displayResult.innerHTML + number;
        displayResult.innerHTML = '';
        }

    //Pressing del
    }else if(number === 'del'){
        displayResult.innerHTML = eraseOne(displayResult.innerHTML)

    //Pressing clear all;
    }else if(number === 'ac'){
        displayResult.innerHTML = '';
        displayInput.innerHTML = '';

    //Pressing '='.
    }else{
        displayInput.innerHTML += displayResult.innerHTML;
        calculate(displayInput.innerHTML);
    }
}

//Erase the last character of a string.
const eraseOne = (numbers)=>{
    return numbers.slice(0,-1);
};

const calculate = (operation)=>{
    const regexOperations = /[+\-/*]/g;
    const firstLetter = operation.slice(0, 1);
    const numbers = operation.split(regexOperations).map((elem)=>Number(elem));
    const operators = operation.match(regexOperations);
    let i = 0;
    if(firstLetter === '-'){
        i = 1;
        numbers[1] = - numbers[1];
    }
    console.log(numbers)
    let primaryOperands = [];
    let secondaryOperands = [];
    operators.forEach((elem, index)=>{
        if(elem === '/' || elem === '*'){
            primaryOperands.push([elem, index]);
        }
    });
    primaryOperands.forEach((opr)=>{
        console.log(singleOperation(numbers[opr[1]], opr[0], numbers[opr[1]+1] ));
        

    })
    operators.forEach((elem, index)=>{
        if(elem === '+' || elem === '-'){
            secondaryOperands.push([elem, index]);
        }
    }); 
};

const singleOperation = (number1, operator, number2)=>{
    switch(operator){
        case '-':
            return number1-number2;
        case '+':
            return number1+number2;
        case '/':
            return number1/number2;
        case '*':
            return number1*number2;
    }
}