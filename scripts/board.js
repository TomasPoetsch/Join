let currentDraggedElement;
let filteredTasks = [];
let editTask;

// Render functions

async function renderTasks() {
    await init();
    await renderColumns();
}

async function renderColumns() {
    const boardContent = document.getElementById('boardContent')
    clearInnerHtml('boardContent');
    for (let index = 0; index < taskList.length; index++) {
        const element = taskList[index];
        boardContent.innerHTML += boardColumnTemplate(element, index);
        renderTaskContainer(element.tasks, index);
    }
}

function renderTaskContainer(tasks, columnIndex) {
    const boardColumnTasks = document.getElementById(`boardColumnTasks${columnIndex}`)
    if (tasks.length > 0) {
        for (let index = 0; index < tasks.length; index++) {
            const element = tasks[index];
            boardColumnTasks.innerHTML += boardTaskTemplate(element, columnIndex);
            renderTaskAssignedTo(element.assignedTo, element.id);
        }
    } else {
        boardColumnTasks.innerHTML += boardTaskTemplateEmpty();
    }
}

function renderTaskAssignedTo(assignedContacts, id){
    const boardTaskInvolved = document.getElementById(`boardTaskInvolved${id}`)
    for (let index = 0; index < assignedContacts.length; index++) {
        const element = assignedContacts[index];
        boardTaskInvolved.innerHTML += boardTaskInitalsTemplate(findContact(element));
    }
}

function finishedTasks(subtasks) {
    const finishedCount = subtasks.filter(subtask => subtask.finished === true).length;
    return finishedCount;
}

function progressBarWidth(subtasks) {
    const width = (subtasks.filter(subtask => subtask.finished === true).length / subtasks.length) * 100 + '%';
    return width;
}

// Drag&Drop

function startDragging(id) {
    currentDraggedElement = id;
};

function allowDrop(event) {
    event.preventDefault();
};

function dropHandler(event, targetColumnIndex) {
    event.preventDefault();
    moveTaskToColumn(currentDraggedElement, targetColumnIndex);
};

async function moveTaskToColumn(taskId, targetColumnIndex) {
    let sourceColumnIndex = null;
    let taskToMove = null;
    taskList.forEach((column, colIndex) => {
        if (column.tasks) {
            const taskIndex = column.tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                sourceColumnIndex = colIndex;
                taskToMove = column.tasks.splice(taskIndex, 1)[0];
            }
        }
    });
    if (taskList[targetColumnIndex].tasks) {
        taskList[targetColumnIndex].tasks.push(taskToMove);
    } else {
        taskList[targetColumnIndex].tasks = [taskToMove];
    }
    await updateTaskList();
    renderTasks();
}

// Overlay
function openTaskOverlay(taskId, columnIndex){
    const body = document.querySelector('body')
    const taskMatchesId = (element) => element.id === taskId;
    const taskIndex = taskList[columnIndex].tasks.findIndex(taskMatchesId)
    const task = taskList[columnIndex].tasks[taskIndex]
    body.innerHTML += boardOverlayTemplate(task, columnIndex);
    renderOverlayAssignedTo(task);
    renderOverlaySubtasks(task, columnIndex, taskIndex);
}

async function closeTaskOverlay(){
    const taskOverviewOverlay = document.getElementById('taskOverviewOverlay')
    taskOverviewOverlay.remove()
    await updateTaskList();
    renderTasks();
}

function renderOverlayAssignedTo(task){
    const taskOverviewAssignedContainer = document.getElementById('taskOverviewAssignedContainer')
    for (let index = 0; index < task.assignedTo.length; index++) {
        const element = task.assignedTo[index];
        taskOverviewAssignedContainer.innerHTML += overviewAssignedTemplate(findContact(element));
    }
};

function findContact(id){
    const contactIndex = contactList.findIndex((element) => element.id === id);
    return contactList[contactIndex] 
}

function renderOverlaySubtasks(task, columnIndex, taskIndex){
    const taskOverviewSubtasks = document.getElementById('taskOverviewSubtasks')
    for (let index = 0; index < task.subtasks.length; index++) {
        const element = task.subtasks[index];
        taskOverviewSubtasks.innerHTML += overviewSubtaskTemplate(element, columnIndex, taskIndex, index);
    }
};

function toggleSubtaskCheckbox(columnIndex, taskIndex, subtaskIndex){
    const task = taskList[columnIndex].tasks[taskIndex]
    task.subtasks[subtaskIndex].finished = !task.subtasks[subtaskIndex].finished;
}

// Overlay editor

async function startOverlayEditor(taskId, columnIndex){
    const taskOverviewOverlayContainer = document.getElementById('taskOverviewOverlayContainer')
    taskOverviewOverlayContainer.remove()
    renderOverlayEditor(taskId, columnIndex);
    createTaskCopy(taskId, columnIndex);
}

function createTaskCopy(taskId, columnIndex){
    const taskMatchesId = (element) => element.id === taskId;
    const taskIndex = taskList[columnIndex].tasks.findIndex(taskMatchesId)
    editTask = JSON.parse(JSON.stringify(taskList[columnIndex].tasks[taskIndex]));
    console.log(editTask)
}

function renderOverlayEditor(id, columnIndex){
    const overlay = document.getElementById('taskOverviewOverlay')
    const taskMatchesId = (element) => element.id === id;
    const taskIndex = taskList[columnIndex].tasks.findIndex(taskMatchesId)
    const task = taskList[columnIndex].tasks[taskIndex]
    overlay.innerHTML += boardOverlayEditorTemplate(task, columnIndex);
    renderOverlayEditorAssigned(task.assignedTo);
    rendertaskOverviewSubtasksList(task.subtasks);
};

function renderOverlayEditorAssigned(assignedList){
    const taskOverlayEditorAssignedSelection = document.getElementById('taskOverlayEditorAssignedSelection')
    for (let index = 0; index < contactList.length; index++) {
        const element = contactList[index];
        taskOverlayEditorAssignedSelection.innerHTML += assignedListOptionTemplate(element)
    }
    rendertaskOverlayEditorAssignedContacts(assignedList);
}

function rendertaskOverlayEditorAssignedContacts(assignedList){
    const taskOverlayEditorAssignedContacts = document.getElementById('taskOverlayEditorAssignedContacts')
    for (let index = 0; index < assignedList.length; index++) {
        const element = assignedList[index];
        taskOverlayEditorAssignedContacts.innerHTML += assignedListTemplate(findContact(element));
    }
}

function rendertaskOverviewSubtasksList(subtasks){
    const taskOverlaySubtasksList = document.getElementById('taskOverlaySubtasksList')
    clearInnerHtml('taskOverlaySubtasksList')
    for (let index = 0; index < subtasks.length; index++) {
        const element = subtasks[index];
        taskOverlaySubtasksList.innerHTML += editorSubtaskListTemplate(element);
    }
}

function closeAssignedSelection(){
    const taskOverlayEditorAssignedSelection = document.getElementById('taskOverlayEditorAssignedSelection');
    taskOverlayEditorAssignedSelection.classList.add('d-none')
}

function openAssignedSelection(){
    const taskOverlayEditorAssignedSelection = document.getElementById('taskOverlayEditorAssignedSelection');
    taskOverlayEditorAssignedSelection.classList.remove('d-none')
}

// Overlay Editor edit functions

function addSubtask(taskId, columnIndex){
    const newSubtask = {
        id: 5,
        description: document.getElementById('addSubtaskInput').value,
        finished: false,
    }
    editTask.subtasks.push(newSubtask)
    document.getElementById('addSubtaskInput').value = '';
    rendertaskOverviewSubtasksList(editTask.subtasks);
}

// Board Task filter functions

function filterTasks(){
    const query = document.getElementById('boardSearchInput').value
    const filteredTasks = searchTasks(query);
    console.log(filteredTasks)
    renderfilteredTasks(filteredTasks);
}

function searchTasks(query){
    const lowerQuery = query.toLowerCase();
    return taskList
      .map(category => {
        const filteredTasks = category.tasks.filter(task =>
          task.title.toLowerCase().includes(lowerQuery)
        );
        return {
          ...category,
          tasks: filteredTasks
        };
      });

//     for (let index = 0; index < taskList.length; index++) {
//         const element = taskList[index];
//         let filteredColumn = {
//             name: element.name,
//             tasks: null,
//         }
//         filteredColumn.tasks = element.tasks.filter((task) => task.title.includes(document.getElementById('boardSearchInput').value))
//         filteredTasks.push(filteredColumn)
//         console.log(filteredColumn)
//     }
}

function renderfilteredTasks(filteredTasks){
    const boardContent = document.getElementById('boardContent')
    boardContent.innerHTML = '';
    for (let index = 0; index < filteredTasks.length; index++) {
        const element = filteredTasks[index];
        boardContent.innerHTML += boardColumnTemplate(element, index);
        renderTaskContainer(element.tasks, index);
    }
};




