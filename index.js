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

// Var for knowing the display state.
let displayingResult = false;
//Pick the pressed button and process
const info = (number)=>{
    const regexOperations = /[+-\/*]/;
    const regexNumbers = /[\.0-9]/;

    
    //Keyboard press a number or a dot.
    if(regexNumbers.test(number)){
        //If a number is pressed after a result, clear display;
        if(displayingResult){
            displayInput.innerHTML = '';
            displayResult.innerHTML = '';
            displayingResult = false;
        }
        const dot = /\./;
        //if a dot already exist, dot button will do nothing
        if(number === '.' && dot.test(displayResult.innerHTML)){
            return;
        }
        displayResult.innerHTML += number;

    //Pressing a operator
    }else{
        //If a operator is pressed after a result, use it for new operation
        if(displayingResult){
            displayInput.innerHTML = displayResult.innerHTML;
            displayResult.innerHTML = '';
            displayingResult = false;
        }
        if(regexOperations.test(number)){
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
            //Put the last number in the account, calculate and display result;
            displayInput.innerHTML += displayResult.innerHTML;
            let result = resolve(displayInput.innerHTML);
            if (result!='Infinity'){ //If value is finite, round it if necessary;
                result = +result.toFixed(4);
            }
            displayResult.innerHTML = String(result);
            displayingResult = true;
        }
    }
}

//Erase the last character of a string.
const eraseOne = (numbers)=>{
    return numbers.slice(0,-1);
};

// - Pick the operation in string, divide it in all operators, separating the numbers.
// - Then it veryfy if exist operators (if it is a valid entry).
// - If valid, verify if the first string component is a minus signal.
// - Separate primaryOperand (* and /), that need to be processed first;
// - Separate the secondaryOperands (+ and -);
// - Verify if primary exist, and process it, then the same thing for secondary;
// - Return result.
const calculate = (operation)=>{
    const regexOperations = /[+\-/*]/g;
    const firstLetter = operation.slice(0, 1);
    const numbers = operation.split(regexOperations).map((elem)=>Number(elem));
    const operators = operation.match(regexOperations);
    let i = 0;
    if(operators != null){ //If non existent, go direct to result;
        if(firstLetter === '-'){
            numbers[1] = - numbers[1]; //Turn first number negative and delete thresh data;
            operators.shift();         //'-';
            numbers.shift();           //0;
        }
        let primaryOperands = []; //Create a vector of ['operator', indexInOriginalOperationString].
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
        let finishing = [];
        let correctFinishing = [];
        if(primaryOperands != ''){ //Exist * or /;
            const firstMaths = prox(primaryOperands); //it create a 'Operation map'
            finishing = [...sequentialOperation(numbers, firstMaths)]; //Operations * and / resolved;
            if(secondaryOperands != ''){
                //Finishing just return the numbers that are processed, so isolated '+2-' need correction.
                correctFinishing = completeMissing(finishing, numbers, secondaryOperands);
            }else{
                //Non exist - and + operations to be made, return result;
                correctFinishing = [...finishing];
                return correctFinishing[0];
            }
        }else{
            //Non '' var, if * and / non exist
            correctFinishing = [...numbers];
        }
        if(secondaryOperands != ''){
            //correcting index of operands, because of the new size of the operation
            const finishOperands = secondaryOperands.map((elem, index)=>{
                return [elem[0], index];
            });
            //convert it to OperationMap and send do sequencial calc.
            const lastMaths = prox(finishOperands);
            const result = sequentialOperation(correctFinishing, lastMaths);
            return result[0];
        }else{
            return operation;
        }
    }else{return operation;}
};


//Receive two numbers and the respective operator.
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


//Receive an array with numbers to be processed and operation map.
const sequentialOperation = (numbers, operationMap)=>{
    const results = [];
    
    //Add to results the needed operations in map.
    operationMap.forEach((direct)=>{
        const val = direct.reduce((value, opr)=>{
            return singleOperation(value, opr[0], numbers[opr[1]+1]);
        },numbers[direct[0][1]]);
        results.push(val);
    });
    return results;
};


//This function translate a vector of [operands, respectiveIndex]
//In a vector with vectors of [operands, respectiveIndex].
//Joining the near index together;
const prox = (vector)=>{
    const finalVector = [];
    let line = [];
    for(let i = 0; i<vector.length; i++){
        if(i==vector.length-1){ //Last operand
            line.push(vector[i]);
            finalVector.push(line);
            line = [];
        }else if((vector[i][1]) == (vector[i+1][1])-1){ //This index is near the next?
            line.push(vector[i]);
        }else{
            //Non near and non last.
            line.push(vector[i]);
            finalVector.push(line);
            line = [];
        }
    }
    return finalVector;
};


//This function reconstructs the numbers processed with the non-processed ones.
//This function pick an array with processed but missing numbers.
//The inicial array of numbers.
//The operands +,- and their index [[operand, index],[op,index]...]
const completeMissing = (missing, numbers, operands)=>{
    let completeVector = [];
    //.Shift would change missing in up code;
    const copyMissing = [...missing];

    //If first operand index is 0, then a base number is missing
    //If not, a already processed one is needed.
    if(operands[0][1] === 0){
        completeVector.push(numbers[0]);
    }else{
        completeVector.push(copyMissing.shift());
    }


    for(let i = 0; i<operands.length; i++){

        if(i==operands.length-1){ //Last insertion
            //Verify the last numbers is missing or already processed;
            if(operands[i][1] == ((numbers.length)-2)){
                completeVector.push(numbers[operands[i][1]+1])
            }else{
                completeVector.push(copyMissing.shift());
            }
        }else if((operands[i][1]) == (operands[i+1][1])-1){ //This index is near the next?
            completeVector.push(numbers[operands[i][1]+1])  //If it is, the next value is missing.
        }else{
           completeVector.push(copyMissing.shift()); //If it isn't, the next value already was processed.
        }
    }
    return completeVector;
}

const resolve = (operation)=>{
    const regParenthesisAll = /\([0-9+\-\.\*\/]*\)/g;
    const regParenthesis = /\([\.0-9+\-\*\/]*\)/;
    let operationPart = operation.match(regParenthesisAll);
    let ops = operation.slice(0);
    while(operationPart!==null){
        let operated = operationPart.map((elem)=>{
            const noParenthesis = elem.slice(1,-1);
            return calculate(noParenthesis);
        });
        for(let i=0; i<operated.length; i++){
            ops = ops.replace(regParenthesis, operated[i]);
        }
        operationPart = ops.match(regParenthesisAll);
    }
    const openParenthesis = /\([0-9+\-\*/\.]*$/;
    let newParenthesis = ops.match(openParenthesis);

    while(newParenthesis!==null){
        let noParenthesis = newParenthesis[0].slice(1);
        let operated = calculate(noParenthesis);
        ops = ops.replace(openParenthesis, operated);
        newParenthesis = ops.match(openParenthesis);
    }

    const endParenthesis = /^[0-9+\-\*/\.]*\)/;
    let endingMatch = ops.match(endParenthesis);
    while(endingMatch!==null){
        let noParenthesis = endingMatch[0].slice(0,-1);
        let operated = calculate(noParenthesis);
        ops = ops.replace(endParenthesis, operated);
        endingMatch = ops.match(endParenthesis);
    }
    return calculate(ops);
};
