let currentPage = 1;  // Initialize with the first page
let currentEditingTaskId = null;
let modalMode = "add";  // Default mode

function displayTasks(response) {
    const tasks = response.results;
    const tasksListDiv = document.getElementById('tasksList');
    tasksListDiv.innerHTML = '';  // Clear current tasks
    
    tasks.forEach(task => {
        const statusClass = getStatusClass(task.status);
        let taskDiv = document.createElement('li');
        taskDiv.className = 'list-group-item';

        taskDiv.innerHTML = `
    <div class="row align-items-center">
        <!-- Task Title -->
        <div class="col-md-6">
            <span class="task-title" onclick="showTaskDetails(${task.id})" style="cursor: pointer;">${task.title}</span>
        </div>
        
        <!-- Task Status -->
        <div class="col-md-3 text-center">
            <span class="badge badge-pill ${statusClass}" data-task-status="${task.status}">${task.status_display}</span>
        </div>
        
        <!-- Edit/Delete Buttons -->
        <div class="col-md-3 text-right">
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})">
                    <i class="fas fa-pencil-alt"></i> Edit
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    </div>
`;

        

        tasksListDiv.appendChild(taskDiv);
    });
    document.querySelectorAll('.status-display-span').forEach(span => {
        const status = span.getAttribute('data-task-status');
        const statusClass = getStatusClass(status);
        span.classList.add(statusClass);
    });
    
}


function fetchTasks() {
    fetch(`/api/v1/tasks/?page=${currentPage}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayTasks(data);
        
        // Update the current page display
        document.getElementById('currentPageDisplay').innerText = `Page ${currentPage}`;
        
        // Update the state of pagination buttons based on API response
        document.getElementById('prevPage').disabled = !data.previous;
        document.getElementById('nextPage').disabled = !data.next;

    })
    .catch(error => console.error('There was a problem with the fetch operation:', error.message));
}


async function filterTasks(value) {
    let url = '/api/v1/tasks/';
    if (value !== 'all') {
        url += `?status=${value}`;
    }

    let response = await fetch(url);
    let tasks = await response.json();

    displayTasks(tasks);  // A function we'll create next to display fetched tasks
}


async function searchTasks(query) {
    const url = `/api/v1/tasks/?title=${query}`;

    let response = await fetch(url);
    let tasks = await response.json();

    displayTasks(tasks);
}




async function fetchPage(pageNumber) {
    const url = `/api/v1/tasks/?page=${pageNumber}`;

    let response = await fetch(url);
    
    if (response.ok) {
        let tasks = await response.json();
        displayTasks(tasks);
    } else if (response.status === 404) {
        console.error('Page not found.');
        alert('You have reached the last available page.');  // Notify the user
        currentPage -= 1;  // Revert to the previous page number
    } else {
        console.error(`HTTP error! Status: ${response.status}`);
        alert('An error occurred. Please try again.');  // General error message
    }
}

function changePage(direction) {
    // Ensure you're not going below page 1
    if (currentPage + direction >= 1) {
        currentPage += direction;
        fetchTasks();
    } else {
        currentPage = 1; // Reset to 1 if it goes below
    }
}



// Delete a task using its ID
function deleteTask(taskId) {
    fetch(`/api/v1/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Refresh the tasks after a successful delete
        fetchTasks();
    })
    .catch(error => console.error('There was a problem with the fetch operation:', error.message));
}


document.addEventListener('DOMContentLoaded', function() {
    fetchTasks();  // This function fetches tasks and populates the tasksList div
});

document.getElementById('addTaskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log(modalMode);
    if (modalMode === "edit") {
        console.log("updateee")
        updateTask(currentEditingTaskId);
    } else if (modalMode === "add") {
        console.log("Createeee")
        createTask();
    }
});



function loadDateTime(params) {
    console.log(params)
    if (params){
        var now = new Date(params);
    }else {
        var now = new Date();

    }

    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  
    now.setMilliseconds(null)
    now.setSeconds(null)
  
    document.getElementById('taskDueDate').value = now.toISOString().slice(0, -1);
}

window.addEventListener('load', () => {
    loadDateTime();
  });


async function fetchTaskDetails(taskId) {
    let response = await fetch(`/api/v1/tasks/${taskId}/`);  // Adjust the URL if needed.
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await response.json();
    return data;
}
async function editTask(taskId) {
    currentEditingTaskId = taskId;
    modalMode = "edit"; 
    let task = await fetchTaskDetails(taskId);
    console.log(task);

    // Populate the modal fields with task data
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskStatus').value = task.status;
    loadDateTime(task.due_date);
    
    // Change modal title to "Edit Task"
    document.getElementById('addTaskModalLabel').textContent = "Edit Task";
    document.getElementById('submit_btn').textContent = "Update Task";

    // Modify the modal's form submission to handle update instead of creation
    let form = document.getElementById('addTaskForm');


    // Show the modal
    $('#addTaskModal').modal('show');
}

function updateTask(taskId) {
    // Gather updated data from the modal's input fields
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value;

    const taskData = {
        title: title,
        description: description,
        status: status,
        due_date: dueDate
    };
    console.log("wamoghebaaa");

    // Make a PUT request to update the task
    fetch(`/api/v1/tasks/${taskId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            // Task was updated successfully. Refresh the task list.
            fetchTasks();
        } else {
            console.error('Unexpected response:', data);
            alert('An error occurred while updating the task. Please try again.');
        }
    });

    // Reset global variable and close the modal
    currentEditingTaskId = null;
    // Close the modal
    $('#addTaskModal').modal('hide');
    document.getElementById('taskTitle').value='';
    document.getElementById('taskDescription').value='';
    loadDateTime();
    $('#addTaskModal').on('hide.bs.modal', function () {
        modalMode = "add";
        currentEditingTaskId = null;
        document.getElementById('addTaskModalLabel').textContent = "Add New Task";
        document.getElementById('submit_btn').textContent = "Add Task";
        document.getElementById('addTaskForm').reset();
    });
    $('#addTaskModal').modal('hide');


}


function createTask() {
    // Gather data from the modal's input fields
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value;

    // Construct the payload
    const taskData = {
        title: title,
        description: description,
        status: status,
        due_date: dueDate
    };

    // Make an API call to add the task
    fetch('/api/v1/tasks/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(taskData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            // Task was created successfully. Refresh the task list.
            fetchTasks();
        } else {
            console.error('Unexpected response:', data);
            alert('An unexpected error occurred. Please try again.');
        }
        document.getElementById('addTaskForm').reset();
        loadDateTime();
        $('#addTaskModal').modal('hide');
    });
    
}

function getStatusClass(status) {
    console.log("Status received:", status);

    switch (status) {
        case 'pending':
            return 'status-pending';
        case 'in_progress':
            return 'status-in-progress';
        case 'completed':
            return 'status-completed';
        default:
            return '';
    }
}

async function getTaskById(taskId) {
    let response = await fetch(`/api/v1/tasks/${taskId}/`);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let task = await response.json();
    // console.log(task);
    return task;
}


async function showTaskDetails(taskId) {
    // Fetch the task details
    const task = await getTaskById(taskId);
    console.log(task);
    // Populate the modal with the task details
    document.getElementById('detailTitle').textContent = task.title;
    document.getElementById('detailDescription').textContent = task.description;
    document.getElementById('detailStatus').textContent = task.status_display;
    document.getElementById('detailDueDate').textContent = task.due_date;

    // Show the modal
    $('#taskDetailsModal').modal('show');
}

async function sortTasks() {
    const sortOption = document.getElementById('sortOptions').value;

    let url = `/api/v1/tasks/?ordering=${sortOption}`;
    let response = await fetch(url);
    let tasks = await response.json();

    displayTasks(tasks); // Display the fetched tasks based on the order.
}