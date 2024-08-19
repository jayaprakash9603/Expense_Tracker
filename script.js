document.addEventListener("DOMContentLoaded", () => {
  let totalSalary = parseFloat(loadTotalSalaryFromLocalStorage()) || 0;
  let creditDue = parseFloat(loadCreditCardDueFromLocalStorage()) || 0;
  let sortOrderAscending = true;
  let currentCell;
  let currentRow;
  const expensesByDate = loadExpensesFromLocalStorage() || {};

  // Initialize DOM elements
  const expenseNameInput = document.getElementById("expenseName");
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
  const popupMenuDiv = document.getElementById("popup-menu");
  // const searchButton = document.getElementById("searchButton");

  // Set default date to today
  dateInput.value = getTodayDate();

  // Load and display data from local storage
  initializeUI();

  // console.log(expenseNameInput.value);
  // Event listeners
  addExpenseButton.addEventListener("click", handleAddExpense);
  sortButton.addEventListener("click", toggleSortOrder);
  // searchButton.addEventListener("click", handleSearchByDate);
  searchDateInput.addEventListener("input", function () {
    if (this.value) {
      handleSearchByDate();
    }
  });
  setupEditableInput();

  // Helper Functions

  function handleAddExpense() {
    const date = dateInput.value;
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const paymentMethod = paymentMethodInput.value;
    const expenseName = expenseNameInput.value;
    if (!validateInputs(date, amount, type, expenseName)) return;

    const netAmount = calculateNetAmount(amount, type, paymentMethod);
    updateExpensesByDate(
      expenseName,
      date,
      amount,
      type,
      paymentMethod,
      netAmount
    );

    // Reset the view to show all dates
    updateUI();

    saveExpensesToLocalStorage(); // Save updated data to local storage
    saveTotalSalaryToLocalStorage(); // Save total salary
    saveCreditCardDueToLocalStorage(); // Save credit due
    resetInputs();
  }

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

  function validateInputs(date, amount, type, expenseName) {
    // Check if date is empty or amount is not a number
    if (!date || isNaN(amount)) {
      alert("Please enter valid data.");
      return false;
    }

    // Check if amount is negative when type is "gain"
    if (type === "gain" && amount < 0) {
      alert("Please enter a positive number for gains.");
      return false;
    }

    // Check if expense name is empty
    if (!expenseName) {
      alert("Please enter an expense name.");
      return false;
    }

    return true;
  }

  function calculateNetAmount(amount, type, paymentMethod) {
    let netAmount = amount;

    if (type === "loss") {
      netAmount = -Math.abs(amount);
    }

    switch (paymentMethod) {
      case "creditNeedToPaid":
        creditDue += amount;
        break;
      case "creditPaid":
        creditDue -= amount;
        totalSalary -= amount;
        netAmount = 0;
        break;
      default:
        totalSalary += netAmount;
        break;
    }

    return netAmount;
  }

  function updateExpensesByDate(
    expenseName,
    date,
    amount,
    type,
    paymentMethod,
    netAmount
  ) {
    if (!expensesByDate[date]) {
      expensesByDate[date] = [];
      createNewDateSection(date);
    }

    expensesByDate[date].push({
      expenseName,
      amount,
      type,
      paymentMethod,
      netAmount,
    });
  }

  function updateUI() {
    updateSummary();
    sortAndDisplaySections();
  }

  function resetInputs() {
    expenseNameInput.value = "";
    dateInput.value = getTodayDate();
    amountInput.value = "";
    typeInput.value = "loss";
    paymentMethodInput.value = "cash";
  }

  function updateDateSection(date) {
    const tbody = document.getElementById(`tbody-${date}`);
    if (!tbody) return; // Check if tbody exists

    const table = document.querySelector(`table[data-date='${date}']`);

    tbody.innerHTML = "";
    let totalNetAmount = 0;

    expensesByDate[date].forEach((expense) => {
      const row = tbody.insertRow();
      row.insertCell(0).innerText = expense.expenseName;
      row.insertCell(1).innerText = expense.amount;
      row.insertCell(2).innerText = expense.type;
      row.insertCell(3).innerText = expense.paymentMethod;
      row.insertCell(4).innerText = expense.netAmount;

      const actionCell = row.insertCell(5);

      // Create icon element
      const icon = document.createElement("i");
      icon.className = "bi bi-three-dots-vertical iconClass";
      icon.id = "iconID";

      // Create popup menu element
      const popupMenu = document.createElement("div");
      popupMenu.className = "popup-menu";
      popupMenu.id = "popup-menu";
      popupMenu.style.display = "none"; // Hide by default
      popupMenu.innerHTML = `
        <button class="edit-btn" id="edit-btn">Edit</button>
        <button class="delete-btn" id="delete-btn">Delete</button>
      `;

      // Add event listener to toggle popup menu
      icon.addEventListener("click", () => {
        popupMenu.style.display =
          popupMenu.style.display === "block" ? "none" : "block";
      });

      // Append elements to action cell
      actionCell.appendChild(icon);
      actionCell.appendChild(popupMenu);

      totalNetAmount += expense.netAmount;
    });

    addTotalRow(tbody, totalNetAmount);
  }
  // Add event listeners for Add and Delete buttons
  const editButton = document.getElementById("edit-btn");
  const deleteButton = document.getElementById("delete-btn");

  // editButton.addEventListener("click", () => {
  //   setModalValues();

  //   // console.log("hello world");
  //   // addItem();
  // });

  deleteButton.addEventListener("click", () => {
    deleteItem();
  });
  // Example functions to be triggered by the buttons
  function addItem(expense) {
    alert(`Adding item: `);
    // Your logic for adding an item goes here
  }

  function deleteItem(expense, row) {
    alert(`Deleting item: `);
    // Your logic for deleting an item goes here
    row.remove(); // Example of removing the row from the table
  }
  function addTotalRow(tbody, totalNetAmount) {
    const totalRow = tbody.insertRow();
    totalRow.insertCell(0).innerText = "";
    totalRow.insertCell(1).innerText = "";
    totalRow.insertCell(2).innerText = "";
    totalRow.insertCell(3).innerText = "Total Net Amount";
    totalRow.insertCell(4).innerText = totalNetAmount;
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
    table.classList.add("my-table");
    table.setAttribute("data-date", date); // Set data-date attribute
    table.innerHTML = `
          <thead>
              <tr class="table-row">
                  <th data-column="expense" class="sortable" data-order="desc">Expense Name<span class="sort-icon">&#9660;</span></th>
                  <th data-column="amount" class="sortable" data-order="desc">Amount<span class="sort-icon">&#9660;</span></th>
                  <th data-column="type" class="sortable" data-order="desc">Type<span class="sort-icon">&#9660;</span></th>
                  <th data-column="paymentMethod" class="sortable" data-order="desc">Payment Method<span class="sort-icon">&#9660;</span></th>
                  <th data-column="netAmount" class="sortable" data-order="desc">Net Amount<span class="sort-icon">&#9660;</span></th>
                  <th>Action</th>
              </tr>
          </thead>
          <tbody id="tbody-${date}">
          </tbody>
      `;
    section.appendChild(table);
    expenseSections.appendChild(section);
  }

  function renderTableRows(table, data) {
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    let totalNetAmount = 0;

    data.forEach((row) => {
      const tr = document.createElement("tr");
      Object.values(row).forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });

      // // Create the action button cell
      const actionCell = document.createElement("td");
      // const deleteButton = document.createElement("button");
      // deleteButton.className = "hero";
      // deleteButton.onclick = function () {
      //   expenseTracker.deleteRow(this);
      // };
      const icon = document.createElement("i");
      icon.className = "bi bi-three-dots-vertical iconClass";
      icon.id = "iconID";

      // Add an event listener to the icon to show the popup
      icon.addEventListener("click", function (event) {
        showPopup(event);
      });

      // Create the popup menu
      const popupMenu = document.createElement("div");
      popupMenu.className = "popup-menu";
      popupMenu.innerHTML = `
        <button class="edit-btn" id="edit-btn">Edit</button>
        <button class="delete-btn" id="delete-btn">Delete</button>
      `;

      // Append the popup to the action cell
      actionCell.appendChild(icon);
      actionCell.appendChild(popupMenu);
      tr.appendChild(actionCell);
      tbody.appendChild(tr);

      totalNetAmount += row.netAmount;
    });

    addTotalRow(tbody, totalNetAmount);
  }

  function sortTable(table, column, order) {
    const date = table.getAttribute("data-date");
    const tableData = expensesByDate[date];
    // console.log(tableData);
    const sortedData = tableData.slice().sort((a, b) => {
      if (typeof a[column] === "string") {
        return order === "asc"
          ? a[column].localeCompare(b[column])
          : b[column].localeCompare(a[column]);
      } else {
        return order === "asc" ? a[column] - b[column] : b[column] - a[column];
      }
    });
    // console.log(sortedData);
    renderTableRows(table, sortedData);
    // Add event listeners for Add and Delete buttons
    const editButton = document.getElementById("edit-btn");
    const deleteButton = document.getElementById("delete-btn");

    editButton.addEventListener("click", () => {
      console.log("hello world");
      addItem();
    });

    deleteButton.addEventListener("click", () => {
      deleteItem();
    });
  }

  document.addEventListener("click", (event) => {
    const th = event.target.closest("th.sortable");
    if (th) {
      const table = th.closest("table");
      const column = th.getAttribute("data-column");
      let order = th.getAttribute("data-order");
      order = order === "asc" ? "desc" : "asc";
      th.setAttribute("data-order", order);
      sortTable(table, column, order);
      updateSortIcons(table, th, order);
    }
  });

  function updateSortIcons(table, th, order) {
    table.querySelectorAll(".sort-icon").forEach((icon) => {
      icon.classList.remove("asc", "desc");
      icon.innerHTML = "&#9660;"; // Default icon
    });

    const sortIcon = th.querySelector(".sort-icon");
    sortIcon.innerHTML = order === "asc" ? "&#9650;" : "&#9660;";
    sortIcon.classList.add(order); // Add 'asc' or 'desc' class
  }

  function toggleSortOrder() {
    sortOrderAscending = !sortOrderAscending;
    sortAndDisplaySections();
    updateSortButtonLabel();
  }

  function updateSortButtonLabel() {
    sortButton.innerText = sortOrderAscending ? "Sort(Asc)" : "Sort(Desc)";
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

  // Local Storage Functions

  function saveExpensesToLocalStorage() {
    localStorage.setItem("expensesByDate", JSON.stringify(expensesByDate));
  }

  function saveTotalSalaryToLocalStorage() {
    localStorage.setItem("totalSalary", totalSalary);
  }

  function saveCreditCardDueToLocalStorage() {
    localStorage.setItem("creditCardDue", creditDue);
  }

  function loadExpensesFromLocalStorage() {
    const savedData = localStorage.getItem("expensesByDate");
    return savedData ? JSON.parse(savedData) : {};
  }

  function loadTotalSalaryFromLocalStorage() {
    const savedSalary = localStorage.getItem("totalSalary");
    return savedSalary ? parseFloat(savedSalary) : null;
  }

  function loadCreditCardDueFromLocalStorage() {
    const savedCreditDue = localStorage.getItem("creditCardDue");
    return savedCreditDue ? parseFloat(savedCreditDue) : null;
  }
  function initializeUI() {
    Object.keys(expensesByDate).forEach((date) => {
      createNewDateSection(date);
      updateDateSection(date);
    });
    updateSummary();
    sortAndDisplaySections();
  }
  function getLastWorkingDayOfMonth(year, month) {
    const lastDay = new Date(year, month + 1, 0); // Last day of the month
    const dayOfWeek = lastDay.getDay();
    if (dayOfWeek === 6) {
      lastDay.setDate(lastDay.getDate() - 1); // If Saturday, move to Friday
    } else if (dayOfWeek === 0) {
      lastDay.setDate(lastDay.getDate() - 2); // If Sunday, move to Friday
    }

    return lastDay;
  }

  function isSalaryDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastWorkingDay = getLastWorkingDayOfMonth(year, month);

    return date.toDateString() === lastWorkingDay.toDateString();
  }

  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

  const todayDate = new Date(today);
  if (isSalaryDate(todayDate)) {
    typeInput.value = "gain";
  } else {
    typeInput.value = "loss";
  }

  function handleDateChange(event) {
    const selectedDate = new Date(event.target.value);
    const typeSelect = document.getElementById("type");

    if (isSalaryDate(selectedDate)) {
      typeSelect.value = "gain";
    } else {
      typeSelect.value = "loss";
    }
  }

  // Attach event listener
  document.getElementById("date").addEventListener("change", handleDateChange);

  // Set up event listeners
  // document.querySelectorAll("td").forEach((cell) => {
  //   cell.addEventListener("click", function () {
  //     // Check if the cell has the id 'edit-btn'
  //     currentCell = this;
  //     currentRow = this.parentElement;
  //     console.log(currentCell + "" + currentRow);
  //     setModalValues();
  //   });
  // });
  // Set up event listeners for buttons within cells
  document.querySelectorAll("td").forEach((cell) => {
    const button = cell.querySelector("#edit-btn");
    if (button) {
      button.addEventListener("click", function () {
        currentCell = cell; // Set currentCell to the parent cell of the button
        currentRow = cell.parentElement; // Set currentRow to the parent row of the cell
        console.log("Current cell:", currentCell);
        console.log("Current row:", currentRow);
        setModalValues();
        console.log("Current cell:", currentCell);
        console.log("Current row:", currentRow);
        // popupMenuDiv.display = "none";
      });
    }
  });
  /**
   * Set modal values based on the current cell and row.
   */
  function setModalValues() {
    const cells = Array.from(currentRow.children);
    document.getElementById("editExpenseInput").value =
      cells[0].textContent.trim();
    document.getElementById("editAmountInput").value = parseFloat(
      cells[1].textContent.trim()
    );
    document.getElementById("editTypeSelect").value =
      cells[2].textContent.trim();
    document.getElementById("editPaymentMethodSelect").value =
      cells[3].textContent.trim();
    document.getElementById("editNetAmountInput").value = parseFloat(
      cells[4].textContent.trim()
    );

    document.getElementById("editCellIndex").value = Array.from(
      currentRow.children
    ).indexOf(currentCell);
    document.getElementById("editRowIndex").value = Array.from(
      currentRow.parentElement.children
    ).indexOf(currentRow);

    $("#editModal").modal("show");
  }
  /**
   * Update Type and Net Amount based on the current inputs.
   */
  function updateTypeAndNetAmount() {
    const amount = parseFloat(document.getElementById("editAmountInput").value);
    const typeSelect = document.getElementById("editTypeSelect");
    const paymentMethodSelect = document.getElementById(
      "editPaymentMethodSelect"
    );

    // Set Type to Loss and disable it if Amount is negative
    if (amount < 0) {
      typeSelect.value = "loss";
      typeSelect.classList.add("readonly");
      typeSelect.setAttribute("disabled", "true");
      document.getElementById("editNetAmountInput").value = amount;
      updateNetAmount();
      // paymentMethodSelect.value = "creditNeedToPaid";
      // paymentMethodSelect.classList.add("readonly");
      // paymentMethodSelect.setAttribute("disabled", "true");
    } else {
      updateNetAmount();
      typeSelect.classList.remove("readonly");
      typeSelect.removeAttribute("disabled");

      // paymentMethodSelect.classList.remove("readonly");
      // paymentMethodSelect.removeAttribute("disabled");
    }

    if (type == "gain") {
      document.getElementById("editNetAmountInput").value = Math.abs(amount);
      updateNetAmount();
    }
    // Automatically set Type to Loss if Payment Method is Credit (Need to Pay)
    if (paymentMethodSelect.value === "creditNeedToPaid") {
      typeSelect.value = "loss";
      document.getElementById("editNetAmountInput").value = -Math.abs(amount);
      typeSelect.classList.add("readonly");
      typeSelect.setAttribute("disabled", "true");
    }

    updateNetAmount();
  }

  /**
   * Update Net Amount based on the Type and Amount values.
   */
  function updateNetAmount() {
    const amount = parseFloat(document.getElementById("editAmountInput").value);
    const type = document.getElementById("editTypeSelect").value;

    const netAmount = type === "gain" ? amount : -amount;
    if (amount < 0) {
      netAmount = -amount;
    } else if (type === "loss" && amount > 0) {
      netamount = -amount;
    }
    document.getElementById("editNetAmountInput").value = netAmount;
  }
  /**
   * Save changes to the table and close the modal.
   */
  function saveChanges() {
    const expenseName = document.getElementById("editExpenseInput").value;
    const amount = parseFloat(document.getElementById("editAmountInput").value);
    const type = document.getElementById("editTypeSelect").value;
    const paymentMethod = document.getElementById(
      "editPaymentMethodSelect"
    ).value;
    const netAmount = parseFloat(
      document.getElementById("editNetAmountInput").value
    );
    const date = currentRow.parentElement
      .closest(".date-section")
      .querySelector("h2")
      .textContent.trim();
    console.log(date);
    if (currentCell) {
      const rowIndex = parseInt(
        document.getElementById("editRowIndex").value,
        10
      );
      const cellIndex = parseInt(
        document.getElementById("editCellIndex").value,
        10
      );
      const row = currentRow;
      const cells = Array.from(row.children);
      console.log(row + "" + cells);
      console.log(expenseName);
      // Update cells in the table
      cells[0].textContent = expenseName;
      cells[1].textContent = amount;
      cells[2].textContent = type;
      cells[3].textContent = paymentMethod;
      cells[4].textContent = netAmount;
      // **Update global data**
      if (expensesByDate[date]) {
        expensesByDate[date][rowIndex] = {
          expenseName,
          amount,
          type,
          paymentMethod,
          netAmount,
        };
        // **Recalculate totalSalary and creditDue**
        totalSalary = 0;
        creditDue = 0;

        Object.keys(expensesByDate).forEach((date) => {
          expensesByDate[date].forEach((expense) => {
            if (expense.paymentMethod === "creditNeedToPaid") {
              creditDue += expense.amount;
              totalSalary -= expense.amount;
            } else if (expense.paymentMethod === "creditPaid") {
              creditDue -= expense.amount;
            } else {
              totalSalary += expense.netAmount;
            }
          });
        });

        updateSummary(); // **Update UI summary**
        saveExpensesToLocalStorage(); // **Save updated data to local storage**
        saveTotalSalaryToLocalStorage(); // Save updated total salary
        saveCreditCardDueToLocalStorage();
        updateUI(); // Save updated credit due
        console.log("here");
      }

      $(editModal).modal("hide");
      // popupMenu.display = "none";
    }
  }

  document
    .getElementById("editAmountInput")
    .addEventListener("input", updateTypeAndNetAmount);
  document
    .getElementById("editPaymentMethodSelect")
    .addEventListener("change", updateTypeAndNetAmount);
  document
    .getElementById("editTypeSelect")
    .addEventListener("change", updateTypeAndNetAmount);
  document
    .getElementById("editSaveButton")
    .addEventListener("click", saveChanges);
  // console.log(expensesByDate);

  function showPopup(event) {
    // Prevent default click behavior
    event.stopPropagation();

    // Hide any other open popups
    const allPopups = document.querySelectorAll(".popup-menu");
    allPopups.forEach((popup) => (popup.style.display = "none"));

    // Show the clicked popup
    const popup = event.target.nextElementSibling;
    popup.style.display = "block";

    // Close the popup when clicking outside
    document.addEventListener("click", function hidePopup(e) {
      if (!popup.contains(e.target) && !event.target.contains(e.target)) {
        popup.style.display = "none";
        document.removeEventListener("click", hidePopup);
      }
    });
  }

  function showReasons(date) {
    const modal = document.getElementById("reason-modal");
    const modalTableBody = document
      .getElementById("reason-modal-table")
      .getElementsByTagName("tbody")[0];

    modalTableBody.innerHTML = ""; // Clear previous reasons

    if (reasonsByDate[date]) {
      reasonsByDate[date].forEach((detail) => {
        const [reason, amount] = detail.split("-");
        const newRow = modalTableBody.insertRow();
        const dateCell = newRow.insertCell(0);
        const reasonCell = newRow.insertCell(1);
        dateCell.textContent = date;
        reasonCell.textContent = `${reason}-${amount}`;
      });

      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  }

  function showAllReasons() {
    const modal = document.getElementById("reason-modal");
    const modalTableBody = document
      .getElementById("reason-modal-table")
      .getElementsByTagName("tbody")[0];

    modalTableBody.innerHTML = ""; // Clear previous reasons

    Object.keys(expensesByDate).forEach((date) => {
      expensesByDate[date].forEach((detail) => {
        // Assuming each detail is an object with the expenseName property
        const expenseName = detail.expenseName; // Extract the expenseName

        // Print the expenseName
        console.log(expenseName);

        // Create a new row in the modal table
        const newRow = modalTableBody.insertRow();
        const dateCell = newRow.insertCell(0);
        const reasonCell = newRow.insertCell(1);

        // Populate cells with the date and expenseName
        dateCell.textContent = date; // Set date in date cell
        reasonCell.textContent = `${expenseName} - ${detail.amount}`; // Set expenseName in reason cell
      });
    });

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  document
    .getElementById("showAllReasonsButton")
    .addEventListener("click", showAllReasons);

  document
    .getElementById("close-reason-modal-btn")
    .addEventListener("click", function () {
      document.getElementById("reason-modal").style.display = "none";
      document.body.style.overflow = "";
    });

  window.addEventListener("click", function (event) {
    if (event.target === document.getElementById("modal")) {
      document.getElementById("reason-modal").style.display = "none";
      document.body.style.overflow = "";
    }
  });
  console.log(expensesByDate);
});
