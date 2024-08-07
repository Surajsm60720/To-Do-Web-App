const newTaskInput = document.querySelector("#new-task input[type='text']");
const newTaskDateInput = document.querySelector("#task-date");
const newTaskTimeInput = document.querySelector("#task-time");
const tasksDiv = document.querySelector("#tasks");
let deleteTasks, editTasks, tasks;
let updateNote = "";
let count;

window.onload = () => {
  updateNote = "";
  count = Object.keys(localStorage).length;
  displayTasks();
};

const displayTasks = () => {
  if (Object.keys(localStorage).length > 0) {
    tasksDiv.style.display = "inline-block";
  } else {
    tasksDiv.style.display = "none";
  }

  tasksDiv.innerHTML = "";

  let tasks = Object.keys(localStorage).sort();

  for (let key of tasks) {
    let taskData = JSON.parse(localStorage.getItem(key));
    let taskInnerDiv = document.createElement("div");
    taskInnerDiv.classList.add("task");
    taskInnerDiv.setAttribute("id", key);
    taskInnerDiv.innerHTML = `<span id="taskname">${taskData.name}</span>
                              <span id="taskdatetime">${taskData.date} ${taskData.time}</span>`;
    let editButton = document.createElement("button");
    editButton.classList.add("edit");
    editButton.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    if (!taskData.completed) {
      editButton.style.visibility = "visible";
    } else {
      editButton.style.visibility = "hidden";
      taskInnerDiv.classList.add("completed");
    }
    taskInnerDiv.appendChild(editButton);
    taskInnerDiv.innerHTML += `<button class="delete"><i class="fa-solid fa-trash"></i></button>`;
    tasksDiv.appendChild(taskInnerDiv);
  }

  tasks = document.querySelectorAll(".task");
  tasks.forEach((element) => {
    element.onclick = () => {
      let taskData = JSON.parse(localStorage.getItem(element.id));
      updateStorage(element.id.split("_")[0], taskData.name, taskData.date, taskData.time, !taskData.completed);
      element.classList.toggle("completed");
    };
  });

  editTasks = document.getElementsByClassName("edit");
  Array.from(editTasks).forEach((element) => {
    element.addEventListener("click", (e) => {
      e.stopPropagation();
      disableButtons(true);
      let parent = element.parentElement;
      let taskData = JSON.parse(localStorage.getItem(parent.id));
      newTaskInput.value = taskData.name;
      newTaskDateInput.value = taskData.date;
      newTaskTimeInput.value = taskData.time;
      updateNote = parent.id;
      parent.remove();
    });
  });

  deleteTasks = document.getElementsByClassName("delete");
  Array.from(deleteTasks).forEach((element) => {
    element.addEventListener("click", (e) => {
      e.stopPropagation();
      let parent = element.parentElement;
      removeTask(parent.id);
      parent.remove();
      count -= 1;
    });
  });
};

const disableButtons = (bool) => {
  let editButtons = document.getElementsByClassName("edit");
  Array.from(editButtons).forEach((element) => {
    element.disabled = bool;
  });
};

const removeTask = (taskValue) => {
  localStorage.removeItem(taskValue);
  displayTasks();
};

const updateStorage = (index, taskValue, taskDate, taskTime, completed) => {
  let taskData = {
    name: taskValue,
    date: taskDate,
    time: taskTime,
    completed: completed
  };
  localStorage.setItem(`${index}_${taskValue}`, JSON.stringify(taskData));
  displayTasks();
};

document.querySelector("#push").addEventListener("click", () => {
  disableButtons(false);
  if (newTaskInput.value.length == 0 || newTaskDateInput.value.length == 0 || newTaskTimeInput.value.length == 0) {
    alert("Please Enter A Task, Date, and Time");
  } else {
    if (updateNote == "") {
      updateStorage(count, newTaskInput.value, newTaskDateInput.value, newTaskTimeInput.value, false);
    } else {
      let existingCount = updateNote.split("_")[0];
      removeTask(updateNote);
      updateStorage(existingCount, newTaskInput.value, newTaskDateInput.value, newTaskTimeInput.value, false);
      updateNote = "";
    }
    count += 1;
    newTaskInput.value = "";
    newTaskDateInput.value = "";
    newTaskTimeInput.value = "";
  }
});