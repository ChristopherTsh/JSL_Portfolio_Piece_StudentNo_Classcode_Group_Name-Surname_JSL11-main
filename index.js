// TASK: import helper functions from utils
import {
  getTasks,
  createNewTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FUNCTIONS
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  //DOM elements
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"),
  columnDivs: document.querySelectorAll(".column-div"),
  headerBoardName: document.getElementById("header-board-name"),
  editTaskModal: document.getElementsByClassName("edit-task-modal-window")[0],
  threeDotsIcon: document.getElementById("three-dots-icon"),
  logo: document.getElementById("logo"),
  sideBar: document.getElementById("side-bar-div"),
};

let activeBoard = "";

//function to fetch and display boards and tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}
//Function to display boards
function displayBoards(boards) {
  //display board in the DOM
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}
//function to filter and display tasks by board
function filterAndDisplayTasksByBoard(boardName) {
  // Filter tasks by board and display them in the DOM
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}
// Function to refresh tasks UI
function refreshTasksUI() {
  // Refresh tasks UI
  filterAndDisplayTasksByBoard(activeBoard);
}
// Function to style active board
function styleActiveBoard(boardName) {
  // Style active board in the DOM
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}
// Function to add task to UI
function addTaskToUI(task) {
  // Add task to UI in the corresponding column
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}
// Function to set up event listeners
function setupEventListeners() {
  // Function to set up event listeners
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  elements.themeSwitch.addEventListener("change", toggleTheme);

  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });
  elements.threeDotsIcon.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block";
  });
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}
// Function to toggle modal display
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none"; // Toggle modal display
}
// Function to handle task addition
function addTask(event) {
  event.preventDefault(); // Handle task addition

  //Assign user input to the task object
  const task = {
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    status: document.getElementById("select-status").value,
    board: activeBoard,
  };

  if (
    task.title.trim() === "" ||
    task.description.trim() === "" ||
    task.status.trim() === ""
  ) {
    alert("Please fill in all fields");

    return;
  }

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}
// Function to toggle sidebar display
function toggleSidebar(show) {
  // Toggle sidebar display
  const showSideBarBtn = document.getElementById("show-side-bar-btn");
  elements.sideBar.classList.toggle("show", show);
  localStorage.setItem("showSideBar", show);

  elements.sideBar.style.display = show ? "block" : "none";
  showSideBarBtn.style.display = show ? "none" : "block";

  const hideSideBarBtn = document.getElementById("hide-side-bar-btn");

  hideSideBarBtn.addEventListener("click", () => {
    const sidebar = document.getElementById("side-bar-div");
    sidebar.style.display = show ? "none" : "block";
    showSideBarBtn.style.display = show ? "block" : "none";
  });
}
// Function to toggle theme
function toggleTheme(show) {
  // Toggle theme
  const isLightTheme =
    show === "enabled" ||
    show === true ||
    elements.themeSwitch.checked === true;
  document.body.classList.toggle("light-theme", isLightTheme);
  localStorage.setItem("light-theme", isLightTheme ? "enabled" : "disabled");
  elements.themeSwitch.checked = isLightTheme;
  elements.logo.src = elements.logo.src
    .replace(window.location.origin, ".")
    .replace(isLightTheme ? "dark" : "light", isLightTheme ? "light" : "dark");
}
// Function to open edit task modal
function openEditTaskModal(task) {
  // Open edit task modal
  const editTaskTitleInput = document.getElementById("edit-task-title-input"),
    editTaskDescInput = document.getElementById("edit-task-desc-input"),
    editSelectStatus = document.getElementById("edit-select-status");

  editTaskTitleInput.value = task.title;
  editTaskDescInput.value = task.description;
  const selectStatus = editSelectStatus.querySelector(
    `option[value="${task.status}"]`
  );
  selectStatus.selected = true;

  console.log(elements.editTaskModal);  
  toggleModal(true, elements.editTaskModal); // Show the edit task modal

  const saveTaskBtn = document.getElementById("save-task-changes-btn"),
    deleteTaskBtn = document.getElementById("delete-task-btn");

  saveTaskBtn.addEventListener("click", () => {
    saveTaskChanges(task.id);
  });

  deleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });
}
// Function to save task changes
function saveTaskChanges(taskId) {
  // Function to save task changes
  const editSelectStatus = document.getElementById("edit-select-status").value;
  const editTaskTitleInput = document.getElementById(
    "edit-task-title-input"
  ).value;
  const editTaskDescInput = document.getElementById(
    "edit-task-desc-input"
  ).value;

  const task = {
    id: taskId,
    status: editSelectStatus,
    input: editTaskDescInput,
    title: editTaskTitleInput,
    board: activeBoard,
  };
  // Update task using a helper function
  putTask(taskId, task);
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}
// Function to handle window resize
function handleResize() {
  // Handle window resize
  const screenWidth = document.documentElement.clientWidth;
  if (screenWidth <= parseFloat(896.8) && screenWidth) {
    document.getElementById("three-dots-icon").style.display = "inline";
    document.getElementById("add-new-task-btn").style.display = "none";
  } else if (screenWidth > parseFloat(896.81) && screenWidth) {
    document.getElementById("three-dots-icon").style.display = "none";
    document.getElementById("add-new-task-btn").style.display = "block";
  }
}
// Event listener for window resize
window.addEventListener("resize", handleResize);

/*************************************************************************************************************************************************/
// DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
  handleResize();
});
// Initialization function
function init() {
  // Initialize data
  // Set up event listeners
  // Fetch and display boards and tasks
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  elements.showSideBarBtn.style.display = showSidebar ? "block" : "none";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  toggleTheme(isLightTheme);
  elements.themeSwitch.checked = isLightTheme;
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
  elements.logo.src = elements.logo.src
    .replace(window.location.origin, ".")
    .replace(isLightTheme ? "dark" : "light", isLightTheme ? "light" : "dark");
}
