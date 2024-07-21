document.addEventListener("DOMContentLoaded", () => {
  let totalSalary = 0;
  let creditDue = 0;
  let sortOrderAscending = true;

  const dateInput = document.getElementById("date");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const paymentMethodInput = document.getElementById("paymentMethod");
  const addExpenseButton = document.getElementById("addExpense");
  const sortButton = document.getElementById("sortButton");
  const expenseSections = document.getElementById("expenseSections");
  const totalSalaryElement = document.getElementById("totalSalary");
  const creditDueElement = document.getElementById("creditDue");

  const expensesByDate = {};

  addExpenseButton.addEventListener("click", () => {
    const date = dateInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const paymentMethod = paymentMethodInput.value;

    if (!date || isNaN(amount)) {
      alert("Please enter valid data");
      return;
    }

    let netAmount = amount;
    if (type === "loss") {
      netAmount = -amount;
    }

    if (paymentMethod === "creditNeedToPaid") {
      creditDue += amount;
      totalSalary -= amount;
    } else if (paymentMethod === "creditPaid") {
      creditDue -= amount;
      netAmount = 0;
    } else {
      totalSalary += netAmount;
    }

    if (!expensesByDate[date]) {
      expensesByDate[date] = [];
      createNewDateSection(date);
    }

    expensesByDate[date].push({
      amount,
      type,
      paymentMethod,
      netAmount,
    });

    updateDateSection(date);
    updateSummary();
    sortAndDisplaySections();

    dateInput.value = "";
    amountInput.value = "";
    typeInput.value = "gain";
    paymentMethodInput.value = "cash";
  });

  sortButton.addEventListener("click", () => {
    sortOrderAscending = !sortOrderAscending;
    sortAndDisplaySections();
    updateSortButtonLabel();
  });

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

  function updateSortButtonLabel() {
    sortButton.innerText = sortOrderAscending
      ? "Sort by Date (Ascending)"
      : "Sort by Date (Descending)";
  }
});
