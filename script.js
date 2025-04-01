const BASE_URL = firebaseConfig.databaseURL + "/join/";

let user = [];
let contactList = [];
let taskList;

async function init() {
    await connect()
}

async function connect() {
    let response = await fetch(BASE_URL + ".json");
    let json = await response.json();

    user = json.user;
    contactList = json.contactList;
    taskList = await JSON.parse(json.tasks);
}


async function updateTaskList() {
    await fetch(BASE_URL + '.json', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tasks: JSON.stringify(taskList),
          })
    });
}

    console.log(response)
