const newTaskInput = document.querySelector("#taskNameInput");
const timeInput = document.querySelector("#timeInput");
const tasksDiv = document.querySelector("#tasks");
let deleteTasks, editTasks, tasks;
let updateNote = "";
let count;

//Function on window load
window.onload = () => {
  updateNote = "";
  count = Object.keys(localStorage).length;
  displayTasks();
};

//Function to Display The Tasks
const displayTasks = () => {
  if (Object.keys(localStorage).length > 0) {
    tasksDiv.style.display = "inline-block";
  } else {
    tasksDiv.style.display = "none";
  }

  //Clear the tasks
  tasksDiv.innerHTML = "";

  //Fetch All The Keys in local storage
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
  }

  //tasks completed
  tasks = document.querySelectorAll(".task");
  tasks.forEach((element) => {
    element.onclick = () => {
      //local storage update
      let taskData = JSON.parse(localStorage.getItem(element.id));
      if (element.classList.contains("completed")) {
        updateStorage(element.id.split("_")[0], element.innerText, taskData.endTime, false);
        // Remove timer display
        let timerId = `timer_${element.id}`;
        let timerSpan = document.getElementById(timerId);
        if (timerSpan) {
          clearInterval(timerSpan.countdown);
        }
      } else {
        updateStorage(element.id.split("_")[0], element.innerText, taskData.endTime, true);
        // Update timer display
        updateTimerDisplay(`timer_${element.id}`, new Date(taskData.endTime));
      }
    };
  });
  //Edit Tasks
  editTasks = document.getElementsByClassName("edit");
  Array.from(editTasks).forEach((element) => {
    element.addEventListener("click", (e) => {
      //Stop propogation to outer elements (if removed when we click delete eventually the click will move to parent)
      e.stopPropagation();
      //disable other edit buttons when one task is being edited
      disableButtons(true);
      //update input value and remove div
      let parent = element.parentElement;
      newTaskInput.value = parent.querySelector("#taskname").innerText;
      timeInput.value = new Date(JSON.parse(localStorage.getItem(parent.id)).endTime).toLocaleTimeString('en-US', { hour12: false });
      //set updateNote to the task that is being edited
      updateNote = parent.id;
      //remove task
      parent.remove();
    });
  });

  //Delete Tasks
  deleteTasks = document.getElementsByClassName("delete");
  Array.from(deleteTasks).forEach((element) => {
    element.addEventListener("click", (e) => {
      e.stopPropagation();
      //Delete from local storage and remove div
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

//Disable Edit Button
const disableButtons = (bool) => {
  let editButtons = document.getElementsByClassName("edit");
  Array.from(editButtons).forEach((element) => {
    element.disabled = bool;
  });
};

//Remove Task from local storage
const removeTask = (taskValue) => {
  localStorage.removeItem(taskValue);
  displayTasks();
};

//Add tasks to local storage
const updateStorage = (index, taskValue, endTime, completed) => {
  localStorage.setItem(`${index}_${taskValue}`, JSON.stringify({ endTime: endTime, completed: completed }));
  displayTasks();
};

//Function To Add New Task
document.querySelector("#push").addEventListener("click", () => {
  //Enable the edit button
  disableButtons(false);
  if (newTaskInput.value.length == 0 || timeInput.value.length == 0) {
    alert("Please Enter A Task and Time");
  } else {
    //Store locally and display from local storage
    const now = new Date();
    const parts = timeInput.value.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    const endTime = new Date(now.getTime() + (hours * 3600 + minutes * 60 + seconds) * 1000).toISOString();

    if (updateNote == "") {
      //new task
      updateStorage(count, newTaskInput.value, endTime, false);
    } else {
      //update task
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

      if (timeRemaining <= 0) {
        clearInterval(countdown);
        timerSpan.textContent = '00:00:00';
        alert('Time is up for ' + timerSpan.parentElement.querySelector("#taskname").innerText + '!');
        return;
      }

      const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      timerSpan.textContent = 
        (hoursLeft < 10 ? '0' : '') + hoursLeft + ':' +
        (minutesLeft < 10 ? '0' : '') + minutesLeft + ':' +
        (secondsLeft < 10 ? '0' : '') + secondsLeft;
    }, 1000);
  }
};
