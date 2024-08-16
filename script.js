document.addEventListener("DOMContentLoaded", () => {
  let totalSalary = 0;
  let creditDue = 0;
  let sortOrderAscending = true;
  const expensesByDate = loadExpensesFromLocalStorage() || {};

  // Initialize DOM elements
  const dateInput = document.getElementById("date");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const paymentMethodInput = document.getElementById("paymentMethod");
  const addExpenseButton = document.getElementById("addExpense");
  const sortButton = document.getElementById("sortButton");
  const expenseSections = document.getElementById("expenseSections");
  const totalSalaryElement = document.getElementById("totalSalary");
  const creditDueElement = document.getElementById("creditDue");
  const searchDateInput = document.getElementById("searchDate");
  const searchButton = document.getElementById("searchButton");

  // Set default date to today
  dateInput.value = getTodayDate();

  // Load and display data from local storage
  initializeUI();

  // Event listeners
  addExpenseButton.addEventListener("click", handleAddExpense);
  sortButton.addEventListener("click", toggleSortOrder);
  searchButton.addEventListener("click", handleSearchByDate);
  setupEditableInput();

  // Helper Functions

  function handleAddExpense() {
    const date = dateInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const paymentMethod = paymentMethodInput.value;

    if (!validateInputs(date, amount)) return;

    const netAmount = calculateNetAmount(amount, type, paymentMethod);
    updateExpensesByDate(date, amount, type, paymentMethod, netAmount);

    updateUI(date);
    saveExpensesToLocalStorage(); // Save updated data to local storage
    resetInputs();
  }

  function validateInputs(date, amount) {
    if (!date || isNaN(amount)) {
      alert("Please enter valid data");
      return false;
    }
    return true;
  }

  function calculateNetAmount(amount, type, paymentMethod) {
    let netAmount = amount;

    if (type === "loss") {
      netAmount = -amount;
    }

    switch (paymentMethod) {
      case "creditNeedToPaid":
        creditDue += amount;
        totalSalary -= amount;
        break;
      case "creditPaid":
        creditDue -= amount;
        netAmount = 0;
        break;
      default:
        totalSalary += netAmount;
        break;
    }

    return netAmount;
  }

  function updateExpensesByDate(date, amount, type, paymentMethod, netAmount) {
    if (!expensesByDate[date]) {
      expensesByDate[date] = [];
      createNewDateSection(date);
    }

    expensesByDate[date].push({ amount, type, paymentMethod, netAmount });
  }

  function updateUI(date) {
    updateDateSection(date);
    updateSummary();
    sortAndDisplaySections();
  }

  function resetInputs() {
    dateInput.value = getTodayDate();
    amountInput.value = "";
    typeInput.value = "loss";
    paymentMethodInput.value = "cash";
  }

  function updateDateSection(date) {
    const tbody = document.getElementById(`tbody-${date}`);
    tbody.innerHTML = "";

    let totalNetAmount = 0;

    expensesByDate[date].forEach((expense) => {
      const row = tbody.insertRow();
      row.insertCell(0).innerText = expense.amount;
      row.insertCell(1).innerText = expense.type;
      row.insertCell(2).innerText = expense.paymentMethod;
      row.insertCell(3).innerText = expense.netAmount;
      totalNetAmount += expense.netAmount;
    });

    addTotalRow(tbody, totalNetAmount);
  }

  function addTotalRow(tbody, totalNetAmount) {
    const totalRow = tbody.insertRow();
    totalRow.insertCell(0).innerText = "";
    totalRow.insertCell(1).innerText = "";
    totalRow.insertCell(2).innerText = "Total Net Amount";
    totalRow.insertCell(3).innerText = totalNetAmount;
  }

  function updateSummary() {
    totalSalaryElement.innerText = totalSalary;
    creditDueElement.innerText = creditDue;
  }

  function sortAndDisplaySections() {
    const dates = Object.keys(expensesByDate).sort((a, b) => {
      return sortOrderAscending
        ? new Date(a) - new Date(b)
        : new Date(b) - new Date(a);
    });

    expenseSections.innerHTML = "";
    dates.forEach((date) => {
      createNewDateSection(date);
      updateDateSection(date);
    });
  }

  function createNewDateSection(date) {
    const section = document.createElement("div");
    section.className = "date-section";
    section.id = `section-${date}`;

    const title = document.createElement("h2");
    title.innerText = date;
    section.appendChild(title);

    const table = document.createElement("table");
    table.innerHTML = `
          <thead>
              <tr>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Payment Method</th>
                  <th>Net Amount</th>
              </tr>
          </thead>
          <tbody id="tbody-${date}">
          </tbody>
      `;
    section.appendChild(table);

    expenseSections.appendChild(section);
  }

  function toggleSortOrder() {
    sortOrderAscending = !sortOrderAscending;
    sortAndDisplaySections();
    updateSortButtonLabel();
  }

  function updateSortButtonLabel() {
    sortButton.innerText = sortOrderAscending
      ? "Sort by Date (Ascending)"
      : "Sort by Date (Descending)";
  }

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  function setupEditableInput() {
    const monthSalaryInput = document.getElementById("editableInput");
    const monthSalaryInputsaveButton = document.getElementById("saveButton");
    const errorMessage = document.getElementById("errorMessage");

    monthSalaryInput.addEventListener("dblclick", () =>
      enableEditing(monthSalaryInput, monthSalaryInputsaveButton, errorMessage)
    );

    monthSalaryInputsaveButton.addEventListener("click", () =>
      validateAndSaveInput(
        monthSalaryInput,
        monthSalaryInputsaveButton,
        errorMessage
      )
    );

    monthSalaryInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        monthSalaryInputsaveButton.click();
      }
    });
  }

  function enableEditing(input, saveButton, errorMessage) {
    input.removeAttribute("readonly");
    input.focus();
    saveButton.style.display = "inline";
    errorMessage.style.display = "none";
  }

  function validateAndSaveInput(input, saveButton, errorMessage) {
    let inputValue = input.value.trim();
    if (isNaN(inputValue) || inputValue === "") {
      errorMessage.style.display = "block";
    } else {
      inputValue = parseInt(inputValue, 10);
      input.value = inputValue;
      input.setAttribute("readonly", "readonly");
      saveButton.style.display = "none";
      errorMessage.style.display = "none";
    }
  }

  // Handle Search by Date
  function handleSearchByDate() {
    const searchDate = searchDateInput.value;
    if (searchDate && expensesByDate[searchDate]) {
      // Clear the expenseSections and display only the searched date
      expenseSections.innerHTML = "";
      createNewDateSection(searchDate);
      updateDateSection(searchDate);
    } else {
      alert("No expenses found for the selected date.");
    }
  }

  // Local Storage Functions

  function saveExpensesToLocalStorage() {
    localStorage.setItem("expensesByDate", JSON.stringify(expensesByDate));
  }

  function loadExpensesFromLocalStorage() {
    const savedData = localStorage.getItem("expensesByDate");
    return savedData ? JSON.parse(savedData) : null;
  }

  function initializeUI() {
    Object.keys(expensesByDate).forEach((date) => {
      createNewDateSection(date);
      updateDateSection(date);
    });
    updateSummary();
    sortAndDisplaySections();
  }
});
