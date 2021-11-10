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
        numbers[1] = - numbers[1];
        operators.shift();
        numbers.shift();
    }
    let primaryOperands = [];
    operators.forEach((elem, index)=>{
        if(elem === '/' || elem === '*'){
            primaryOperands.push([elem, index]);
        }
    });
    let secondaryOperands = [];
    operators.forEach((elem, index)=>{
        if(elem === '+' || elem === '-'){
            secondaryOperands.push([elem, index]);
        }
    });
    console.log(primaryOperands, 'fir')
    console.log(secondaryOperands, 'sec')
    console.log(secondaryOperands != '')
    let finishing = [];
    let correctFinishing = [];
    if(primaryOperands != ''){
        const firstMaths = prox(primaryOperands);
        finishing = [...sequentialOperation(numbers, firstMaths)];
        if(secondaryOperands != ''){
            correctFinishing = completeMissing(finishing, numbers, secondaryOperands);
        }else{
            correctFinishing = [...finishing];
            console.log('Final result' , correctFinishing[0])
            return correctFinishing[0];
        }
    }else{
        correctFinishing = [...numbers];
    }
    if(secondaryOperands != ''){
        console.log(correctFinishing , 'finishing');
        const finishOperands = secondaryOperands.map((elem, index)=>{
            return [elem[0], index];
        });
        const lastMaths = prox(finishOperands);
        const result = sequentialOperation(correctFinishing, lastMaths);
    console.log(result, 'resultado')
    console.log(finishing, 'finish')
    }
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
        default:
            return;
    }
}

const sequentialOperation = (numbers, operationMap)=>{
    const results = [];
    operationMap.forEach((direct)=>{
        const val = direct.reduce((value, opr)=>{
            return singleOperation(value, opr[0], numbers[opr[1]+1]);
        },numbers[direct[0][1]]);
        results.push(val);
    });
    return results;
};

const prox = (vector)=>{
    const finalVector = [];
    let line = [];
    for(let i = 0; i<vector.length; i++){
        if(i==vector.length-1){
            line.push(vector[i]);
            finalVector.push(line);
            line = [];
        }else if((vector[i][1]) == (vector[i+1][1])-1){
            line.push(vector[i]);
        }else{
            line.push(vector[i]);
            finalVector.push(line);
            line = [];
        }
    }
    console.log(finalVector);
    return finalVector;
};

const completeMissing = (missing, numbers, operands)=>{
    let completeVector = [];
    const copyMissing = [...missing];
    if(operands[0][1] === 0){
        completeVector.push(numbers[0]);
    }else{
        completeVector.push(copyMissing.shift());
    }
    for(let i = 0; i<operands.length; i++){
        if(i==operands.length-1){
            if(operands[i][1] == ((numbers.length)-2)){
                console.log(i)
                completeVector.push(numbers[operands[i][1]+1])
            }else{
                completeVector.push(copyMissing.shift());
            }
        }else if((operands[i][1]) == (operands[i+1][1])-1){
            completeVector.push(numbers[operands[i][1]+1])
        }else{
           completeVector.push(copyMissing.shift());
        }
    }
    return completeVector;
}

//console.log('3*3+5-2+4*2+2');
//completeMissing([ 9, 8 ], [ 3, 3, 5, 2, 4, 2, 2 ], [["+", 1],["-",2],["+",3],["+",5]]);