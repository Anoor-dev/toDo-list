"use strict";

const title = document.querySelector("body > h1");
const taskName = document.querySelector(".task-input");
const addTaskBtn = document.querySelector(".add-task");
const taskList = document.querySelector(".task-list");
const dueDate = document.querySelector(".duedate");
const emptyState = document.querySelector(".empty-state");
const cardTemplate = document.querySelector("#task-template");
const progressFill = document.querySelector(".progress-fill");
const progressLabel = document.querySelector(".progress-label");

let tasks = [];
const savedTasks = localStorage.getItem("tasks");
const loadedTasks = JSON.parse(savedTasks);
const sentences = [
  "JUST DO IT",
  "KEEP GOING",
  "Plan, Do, BE HAPPY",
  "MAKE IT HAPPEN",
];
title.textContent = sentences[Math.floor(Math.random() * sentences.length)];

const datePickerInstance = flatpickr(".duedate", {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "F j, Y",
  minDate: "today",
});

if (loadedTasks) {
  tasks = loadedTasks;
  loadedTasks.forEach(function (task, index) {
    createtasks(task.id, task.name, task.dueDate, task.done, index);
  });
}
updateEmptyState();
updateProgress();

function updateEmptyState() {
  emptyState.style.display = tasks.length === 0 ? "flex" : "none";
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  progressFill.style.width = pct + "%";
  progressLabel.textContent = `${done} of ${total} done`;
}

function shakeField(el) {
  el.classList.remove("field-error");
  // eslint-disable-next-line no-unused-expressions
  void el.offsetWidth; // restart animation
  el.classList.add("field-error");
}

function createtasks(id, name, due, done = false, index = tasks.length) {
  const node = cardTemplate.content.firstElementChild.cloneNode(true);
  const taskCard = node;
  taskCard.dataset.id = id;
  taskCard.style.animationDelay = Math.min(index * 60, 300) + "ms";

  taskCard.querySelector(".task-name").textContent = name;
  taskCard.querySelector(".task-due").textContent = `due: ${due}`;

  taskList.appendChild(taskCard);

  const checkBtn = taskCard.querySelector(".check-btn");
  const deleteBtn = taskCard.querySelector(".delete-btn");

  if (done) {
    taskCard.classList.add("done");
  }

  checkBtn.addEventListener("click", () => {
    taskCard.classList.toggle("done");

    tasks = tasks.map(function (task) {
      if (task.id === id) {
        return { ...task, done: !task.done };
      }
      return task;
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateProgress();
  });

  deleteBtn.addEventListener("click", () => {
    tasks = tasks.filter(function (task) {
      return task.id !== id;
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));

    taskCard.classList.add("delete");

    taskCard.addEventListener(
      "transitionend",
      () => {
        taskCard.remove();
        updateEmptyState();
        updateProgress();
      },
      { once: true },
    );
  });
}

function addAndDoneTask() {
  if (taskName.value === "") {
    shakeField(taskName);
    taskName.focus();
    return;
  }

  if (dueDate.value === "") {
    shakeField(dueDate);
    return;
  }

  const id = crypto.randomUUID();

  createtasks(id, taskName.value, dueDate.value, false, tasks.length);

  tasks.push({
    id: id,
    name: taskName.value,
    dueDate: dueDate.value,
    done: false,
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));

  datePickerInstance.clear();
  taskName.value = "";
  taskName.focus();

  updateEmptyState();
  updateProgress();

  taskList.scrollTo({ top: taskList.scrollHeight, behavior: "smooth" });
}

addTaskBtn.addEventListener("click", addAndDoneTask);
taskName.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addAndDoneTask();
  }
});
