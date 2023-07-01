"use strict";

const buttons = document.querySelectorAll(".number");
const btnContainer = document.querySelector(".buttons");
const operators = document.querySelectorAll(".operator");
const deletes = document.querySelectorAll(".delete");
const resultBtn = document.querySelector(".result");
const displaySub = document.querySelector(".display-sub");
const displayMain = document.querySelector(".display-main");
let mainDisplayArray = [];
let calculationHistory = [];
let result = 0;

const operationStatus = {
  add: false,
  subtract: false,
  divide: false,
  multiply: false,
  percent: false,
};

// ============ NUMBER BUTTONS ============
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let btnValue = btn.textContent;
    if (btnValue === ".") {
      // Handle decimal point input
      if (!mainDisplayArray.includes(".")) {
        mainDisplayArray.push(btnValue);
        displays.updateMainDisplay(mainDisplayArray);
      }
    } else {
      const btnValueNumber = Number(btnValue);
      mainDisplayArray.push(btnValueNumber);
      displays.updateMainDisplay(mainDisplayArray);
    }
  });
});

// ============= OPERATOR BUTTONS ==============
operators.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const functionName = btn.dataset.operationType;

    // Active effect on operators
    const clickedButton = btn;
    operators.forEach((button) => {
      if (button !== clickedButton && button.classList.contains("active")) {
        button.classList.remove("active");
      }
    });
    clickedButton.classList.add("active");

    // Changing operator type without executing operation function
    // Guard clause
    if (mainDisplayArray.length === 0) {
      functions.toggleValues(operationStatus, functionName);
      return;
    }

    if (result === 0 && calculationHistory.length === 0) {
      functions.toggleValues(operationStatus, functionName);
      result = functions.isFloating(mainDisplayArray);
      functions.calcHistory();
      functions.clearMainArray();
    } else {
      // Check for divide by 0
      if (functions.forbiddenDivide()) return;

      functions.operate(
        functions.findKey(operationStatus),
        functions.isFloating(mainDisplayArray)
      );
      functions.toggleValues(operationStatus, functionName);
      functions.calcHistory();
      functions.clearMainArray();
    }
    displays.updateSubDisplay(calculationHistory);
    displays.updateMainDisplay(result);
  });
});

// ============ RESULT BUTTON =============
resultBtn.addEventListener("click", () => {
  const key = functions.findKey(operationStatus);
  if (!key || mainDisplayArray.length === 0) return;
  if (functions.forbiddenDivide()) return;

  functions.calcHistory();
  functions.operate(key, functions.isFloating(mainDisplayArray));
  functions.clearMainArray(mainDisplayArray);

  displays.updateSubDisplay(calculationHistory);
  displays.updateMainDisplay(result);
  functions.resetOperationStatus();
});

// ============= DELETING OPERATIONS =============
deletes.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const functionName = btn.dataset.deleteType;
    if (mainDisplayArray.length > 0) {
      functions[functionName](mainDisplayArray);
    } else {
      functions[functionName]();
      result = 0;
    }
  });
});

// =============== DISPLAY FUNCTIONS ==============
const displays = {
  updateMainDisplay: function (input) {
    if (Array.isArray(input)) displayMain.textContent = input.join("");
    if (typeof input === "number") {
      if (Number.isInteger(input)) {
        displayMain.textContent = input;
      } else {
        const decimalOutput = input.toString().split(".")[1];
        const decimalCounter = decimalOutput ? decimalOutput.length : 0;

        decimalCounter > 4
          ? (displayMain.textContent = input.toFixed(2))
          : (displayMain.textContent = input.toFixed(decimalCounter));
      }
    }
  },
  updateSubDisplay: function (input) {
    displaySub.textContent = input.join("");
  },
};

// ============== FUNCTIONS ============
const functions = {
  operate: (operation, number) => {
    switch (operation) {
      case "add":
        result += number;
        break;
      case "subtract":
        result -= number;
        break;
      case "multiply":
        result *= number;
        break;
      case "divide":
        result /= number;
        break;
      case "percent":
        result = result - (result * number) / 100;
    }
  },
  delete: (arr) => {
    if (!arr) return;
    arr.pop();
    displays.updateMainDisplay(mainDisplayArray);
  },
  clear: () => {
    mainDisplayArray = [];
    calculationHistory = [];
    result = 0;
    displayMain.textContent = "-";
    displaySub.textContent = "";
    operators.forEach((button) => {
      if (button.classList.contains("active")) {
        button.classList.remove("active");
      }
    });
    functions.resetOperationStatus();
  },
  clearMainArray: () => (mainDisplayArray = []),
  whatOperation: (key) => {
    if (key === "add") return "+";
    if (key === "subtract") return "-";
    if (key === "divide") return "/";
    if (key === "multiply") return "*";
  },
  toggleValues: (obj, key) => {
    Object.keys(obj).forEach((k) => {
      obj[k] = k === key;
    });
  },
  findKey: (status) => Object.keys(status).find((k) => status[k] === true),
  isFloating: (arr) => {
    if (arr.includes(".")) {
      return parseFloat(mainDisplayArray.join(""));
    } else {
      return Number(mainDisplayArray.join(""));
    }
  },
  calcHistory: () => {
    if (mainDisplayArray.length === 0) return;
    calculationHistory.push(functions.isFloating(mainDisplayArray));
    calculationHistory.push(
      functions.whatOperation(functions.findKey(operationStatus))
    );
  },
  resetOperationStatus: () => {
    for (const key in operationStatus) {
      if (
        operationStatus.hasOwnProperty(key) &&
        operationStatus[key] === true
      ) {
        operationStatus[key] = false;
        break;
      }
    }
    operators.forEach((operator) => operator.classList.remove("active"));
  },
  forbiddenDivide: () => {
    if (
      functions.findKey(operationStatus) === "divide" &&
      mainDisplayArray.length === 1 &&
      mainDisplayArray.includes(0)
    ) {
      alert("Dividing by 0? You dummy.");
      operators.forEach((button) => {
        button.classList.remove("active");
        if (button.dataset.deleteType === "divide")
          button.classList.add("active");
      });
      return true;
    }
  },
};
