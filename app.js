
const $ = (id) => document.getElementById(id);

const colors = [
  "#638dca", "#d5a46d", "#80a98c", "#b58acb",
  "#d47f86", "#55a9a5", "#8c91b8", "#c18c70"
];

let data = JSON.parse(localStorage.getItem("expensesApp")) || {
  tabs: [{ name: "Ноябрь", expenses: [] }],
  activeTab: 0
};

let editingId = null;

function saveData() {
  localStorage.setItem("expensesApp", JSON.stringify(data));
}

function currentTab() {
  return data.tabs[data.activeTab];
}

function render() {
  $("tabs").innerHTML = "";

  data.tabs.forEach((tab, index) => {
    const button = document.createElement("button");
    button.textContent = tab.name;
    button.className = "tab" + (index === data.activeTab ? " active" : "");

    button.onclick = () => {
      data.activeTab = index;
      render();
    };

    $("tabs").appendChild(button);
  });

  const expenses = currentTab().expenses;

  $("expenses").innerHTML = "";

  let total = 0;

  expenses.forEach(expense => {
    total += expense.amount;

    const item = document.createElement("div");
    item.className = "expense";
    item.style.borderColor = expense.color;

    const info = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = expense.description;

    const details = document.createElement("small");
    details.textContent =
      `${expense.category} • ${expense.date}`;

    const amount = document.createElement("b");
    amount.textContent = expense.amount.toLocaleString("ru-RU") + " ₸";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.className = "delete";

    deleteButton.onclick = () => {
      currentTab().expenses =
        currentTab().expenses.filter(e => e.id !== expense.id);
      saveData();
      render();
    };

    const editButton = document.createElement("button");
    editButton.textContent = "Изменить";

    editButton.onclick = () => {
      editingId = expense.id;
      $("description").value = expense.description;
      $("amount").value = expense.amount;
      $("category").value = expense.category;
      $("date").value = expense.date;
      $("color").value = expense.color;
      $("expenseForm").querySelector("button[type=submit]").textContent =
        "Сохранить изменения";
    };

    info.append(name, details);
    item.append(info, amount, editButton, deleteButton);
    $("expenses").appendChild(item);
  });

  $("total").textContent = total.toLocaleString("ru-RU") + " ₸";
  $("chartTotal").textContent = total.toLocaleString("ru-RU") + " ₸";

  const parts = [];
  let position = 0;

  expenses.forEach(expense => {
    const percent = total ? expense.amount / total * 100 : 0;
    parts.push(`${expense.color} ${position}% ${position + percent}%`);
    position += percent;
  });

  $("chart").style.background = total
    ? `conic-gradient(${parts.join(", ")})`
    : "conic-gradient(#e8edf5 0% 100%)";

  $("legend").innerHTML = "";

  expenses.forEach(expense => {
    const line = document.createElement("div");
    line.textContent =
      `● ${expense.description}: ${expense.amount.toLocaleString("ru-RU")} ₸`;
    line.style.color = expense.color;
    $("legend").appendChild(line);
  });
}

$("expenseForm").addEventListener("submit", event => {
  event.preventDefault();

  const expense = {
    id: editingId || Date.now(),
    description: $("description").value.trim(),
    amount: Number($("amount").value),
    category: $("category").value,
    date: $("date").value,
    color: $("color").value
  };

  if (!expense.description || expense.amount <= 0 || !expense.date) {
    alert("Проверь название, сумму и дату");
    return;
  }

  if (editingId) {
    const index = currentTab().expenses.findIndex(e => e.id === editingId);
    currentTab().expenses[index] = expense;
  } else {
    currentTab().expenses.push(expense);
  }

  editingId = null;

  $("expenseForm").reset();
  $("date").value = new Date().toISOString().slice(0, 10);

  const count = data.tabs.reduce(
    (sum, tab) => sum + tab.expenses.length, 0
  );
  $("color").value = colors[count % colors.length];

  $("expenseForm").querySelector("button[type=submit]").textContent =
    "Сохранить расход";

  saveData();
  render();
});

$("addTab").onclick = () => {
  const name = prompt("Название новой вкладки:");

  if (!name || !name.trim()) return;

  data.tabs.push({
    name: name.trim(),
    expenses: []
  });

  data.activeTab = data.tabs.length - 1;
  saveData();
  render();
};

$("date").value = new Date().toISOString().slice(0, 10);
$("color").value = colors[0];

render();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch(error => console.log("Ошибка:", error));
  });
}
