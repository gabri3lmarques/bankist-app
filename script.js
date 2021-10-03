"use strict";

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const displayMoviments = function (moviments, sort = false) {

  const movs = moviments;

  if(sort) {
    movs.sort((a, b) => a - b);
  } else {
    movs.sort((a, b) => b - a);
  }

  containerMovements.innerHTML = "";

  movs.forEach(function (moviment, index) {
    const type = moviment > 0 ? "deposit" : "withdrawal";

    containerMovements.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${moviment}€</div>
      </div>
      `
    );
  });
};

//cria os nomes de usuários
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLocaleLowerCase()
      .split(" ")
      .map(function (name) {
        return name[0];
      })
      .join("");
  });
};

createUsernames(accounts);

//exibe interface do usuário
const updateUI = function (currentAcount) {
  //exibe o saldo da conta
  calcDisplayBalance(currentAcount);

  //exibe o extrato da conta
  displayMoviments(currentAcount.movements);

  //exibe totais positivos, negativos e poupança
  calcDisplaySummary(currentAcount);

  //exibe a data local
  displayCurrentDate();
};

//exibe saldo
const calcDisplayBalance = function (account) {
  const balance = account.movements.reduce(function (acc, cur, i) {
    return acc + cur;
  }, 0);
  account.balance = balance;
  labelBalance.textContent = `${balance}€`;
};

//exibe totais
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const outs = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outs)}€`;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = interest;
};

const max = movements.reduce(function (acc, cur) {
  if (acc > cur) {
    return acc;
  } else {
    return cur;
  }
}, movements[0]);

const findCurrUser = function (arr, name) {
  for (let user of arr) {
    if (user.owner === name) {
      return user;
    }
  }
};

let currentAcount;

//função de login
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  currentAcount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAcount);
  //optional chaining ? a propriedade só vai ser lida se o objeto existir
  if (currentAcount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAcount.owner.split(" ")[0]
    }`;

    //limpa os dados do form
    inputLoginUsername.value = inputLoginPin.value = "";
    //tira o foco do input após o login com "enter"
    inputLoginPin.blur();

    //exibe a UI do app
    containerApp.style.opacity = 1;

    updateUI(currentAcount);
  }
});

//transferir entre contas
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAcount.balance >= amount &&
    receiverAcc?.username !== currentAcount.username
  ) {
    currentAcount.balance -= amount;
    currentAcount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    updateUI(currentAcount);
  } else {
    console.log("ivalid transfer");
  }
});

//deletando conta
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    currentAcount.username === inputCloseUsername.value &&
    currentAcount.pin === Number(inputClosePin.value)
  ) {
    //pega o indice da conta atual no array de accounts
    const currentIndex = accounts.findIndex(function (account) {
      return account.username === currentAcount.username;
    });
    //exclui a conta
    accounts.splice(currentIndex, 1);
    //esconde a UI
    containerApp.style.opacity = 0;
  } else {
    console.log("please, check the entered data");
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  console.log(amount);
  if (
    amount > 0 &&
    currentAcount.movements.some((movement) => movement >= amount * 0.1)
  ) {
    currentAcount.movements.push(amount);
    updateUI(currentAcount);
  } else {
    console.log("Emprestimo negado");
  }

  inputLoanAmount.value = "";
});

let sorted = false;

btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  sorted = !sorted;
  displayMoviments(currentAcount.movements, sorted);
});

function displayCurrentDate () {
  const date = new Date();
  const dd = date.getDate();
  const mm = date.getMonth();
  const yyyy = date.getFullYear();
  const dateString = `${dd}/${mm}/${yyyy}`;
  labelDate.textContent = dateString;
}



