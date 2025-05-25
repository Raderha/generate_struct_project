let display = document.getElementById('display');

function appendNumber(num) {
  display.value += num;
}

function operate(operator) {
  display.value += operator;
}

function calculate() {
  try {
    display.value = eval(display.value);
  } catch (error) {
    display.value = 'Error';
  }
}

function clearDisplay() {
  display.value = '';
}