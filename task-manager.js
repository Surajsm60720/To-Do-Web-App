const newTaskInput = document.querySelector("#taskNameInput");
const timeInput = document.querySelector("#timeInput");
const tasksDiv = document.querySelector("#tasks");
let deleteTasks, editTasks, tasks;
let updateNote = "";
let count;

// Function on window load
window.onload = () => {
  updateNote = "";
  count = Object.keys(localStorage).length;
  displayTasks();
};

// Function to display the tasks
const displayTasks = () => {
  if (Object.keys(localStorage).length > 0) {
    tasksDiv.style.display = "inline-block";
  } else {
    tasksDiv.style.display = "none";
  }

  // Clear the tasks
  tasksDiv.innerHTML = "";

  // Fetch all the keys in local storage
  let tasks = Object.keys(localStorage);
  tasks = tasks.sort();

  for (let key of tasks) {
    let taskData = JSON.parse(localStorage.getItem(key));
    let taskName = key.split("_")[1];
    let isCompleted = taskData.completed;
    let endTime = new Date(taskData.endTime);

    let taskInnerDiv = document.createElement("div");
    taskInnerDiv.classList.add("task");
    taskInnerDiv.setAttribute("id", key);
    taskInnerDiv.innerHTML = `<span id="taskname">${taskName}</span>`;
    
    let timerSpan = document.createElement("span");
    timerSpan.classList.add("timer");
    timerSpan.id = `timer_${key}`;
    taskInnerDiv.appendChild(timerSpan);

    let editButton = document.createElement("button");
    editButton.classList.add("edit");
    editButton.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    if (!isCompleted) {
      editButton.style.visibility = "visible";
    } else {
      editButton.style.visibility = "hidden";
      taskInnerDiv.classList.add("completed");
    }
    taskInnerDiv.appendChild(editButton);
    taskInnerDiv.innerHTML += `<button class="delete"><i class="fa-solid fa-trash"></i></button>`;
    tasksDiv.appendChild(taskInnerDiv);

    // Update timer display
    updateTimerDisplay(`timer_${key}`, endTime);

    // Add click event for completing tasks
    taskInnerDiv.addEventListener("click", () => {
      if (taskInnerDiv.classList.contains("completed")) {
      updateStorage(key.split("_")[0], taskName, taskData.endTime, false);
      clearInterval(timerSpan.countdown); // Stop the timer
      } 
      else {
      updateStorage(key.split("_")[0], taskName, taskData.endTime, true);
      startTimer(timerSpan, endTime); // Start the timer
      }
      displayTasks();
    });
    taskInnerDiv.addEventListener("click", () => {
      if (taskInnerDiv.classList.contains("completed")) {
        updateStorage(key.split("_")[0], taskName, taskData.endTime, false);
      } else {
        updateStorage(key.split("_")[0], taskName, taskData.endTime, true);
      }
      displayTasks();
    });
  }

  // Edit Tasks
  editTasks = document.getElementsByClassName("edit");
  Array.from(editTasks).forEach((element) => {
    element.addEventListener("click", (e) => {
      e.stopPropagation();
      disableButtons(true);
      let parent = element.parentElement;
      newTaskInput.value = parent.querySelector("#taskname").innerText;
      timeInput.value = new Date(JSON.parse(localStorage.getItem(parent.id)).endTime).toLocaleTimeString('en-US', { hour12: false });
      updateNote = parent.id;
      parent.remove();
    });
  });

  // Delete Tasks
  deleteTasks = document.getElementsByClassName("delete");
  Array.from(deleteTasks).forEach((element) => {
    element.addEventListener("click", (e) => {
      e.stopPropagation();
      let parent = element.parentElement;
      removeTask(parent.id);
      parent.remove();
      count -= 1;
      // Remove timer display
      let timerId = `timer_${parent.id}`;
      let timerSpan = document.getElementById(timerId);
      if (timerSpan) {
        clearInterval(timerSpan.countdown);
      }
      // Remove alert if present
      let taskName = parent.querySelector("#taskname").innerText;
      let alertMessage = `Time is up for ${taskName}!`;
      let existingAlert = document.querySelector(`[data-alert="${alertMessage}"]`);
      if (existingAlert) {
        existingAlert.remove();
      }
    });
  });
};

// Disable Edit Button
const disableButtons = (bool) => {
  let editButtons = document.getElementsByClassName("edit");
  Array.from(editButtons).forEach((element) => {
    element.disabled = bool;
  });
};

// Remove Task from local storage
const removeTask = (taskValue) => {
  localStorage.removeItem(taskValue);
  displayTasks();
};

// Add tasks to local storage
const updateStorage = (index, taskValue, endTime, completed) => {
  localStorage.setItem(`${index}_${taskValue}`, JSON.stringify({ endTime: endTime, completed: completed }));
  displayTasks();
};

// Function to add a new task
document.querySelector("#push").addEventListener("click", () => {
  disableButtons(false);
  if (newTaskInput.value.length == 0 || timeInput.value.length == 0) {
    alert("Please Enter A Task and Time");
  } else {
    const now = new Date();
    const parts = timeInput.value.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    const endTime = new Date(now.getTime() + (hours * 3600 + minutes * 60 + seconds) * 1000).toISOString();

    if (updateNote == "") {
      updateStorage(count, newTaskInput.value, endTime, false);
    } else {
      let existingCount = updateNote.split("_")[0];
      removeTask(updateNote);
      updateStorage(existingCount, newTaskInput.value, endTime, false);
      updateNote = "";
    }
    count += 1;
    newTaskInput.value = "";
    timeInput.value = "";
  }
});

// Function to update timer display
const updateTimerDisplay = (timerId, endTime) => {
  const timerSpan = document.getElementById(timerId);
  if (timerSpan) {
    const countdown = setInterval(() => {
      const currentTime = new Date();
      const timeRemaining = new Date(endTime) - currentTime;

      const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      timerSpan.textContent = 
        (hoursLeft < 10 ? '0' : '') + hoursLeft + ':' +
        (minutesLeft < 10 ? '0' : '') + minutesLeft + ':' +
        (secondsLeft < 10 ? '0' : '') + secondsLeft;

      if (timeRemaining <= 0) {
        clearInterval(countdown);
        timerSpan.textContent = '00:00:00';
        alert('Time is up for ' + timerSpan.parentElement.querySelector("#taskname").innerText + '!');
        // Stop the timer and remove it from the DOM
        clearInterval(timerSpan.countdown);
        timerSpan.parentElement.removeChild(timerSpan);
      }
    }, 1);
    timerSpan.countdown = countdown;
  }
};