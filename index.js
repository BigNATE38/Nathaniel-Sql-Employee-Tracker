const inquirer = require("inquirer");
const db = require("./db");
require("console.table");

const exit = () => {
    console.log("Goodbye");
    process.exit(0);
};

const menuMain = async () => {
    const answer = await inquirer.prompt([
        {
            type: "list",
            name: "menu",
            message: "What would you like to do?",
            choices: [
                { name: "View all departments", value: checkDepartments },
                { name: "View all roles", value: checkRoles },
                { name: "View all employees", value: checkEmployees },
                { name: "Add department", value: plusDepartment },
                { name: "Add role", value: plusRole },
                { name: "Add employee", value: plusEmployee },
                { name: "Update employee role", value: updateEmployee },
                { name: "Update employee manager", value: updateEmployeeManager },
                { name: "View employees by manager", value: viewManager },
                { name: "View employees by department", value: viewDepartment },
                { name: "Delete department", value: deleteADepartment },
                { name: "Delete Role", value: deleteRole },
                { name: "Delete employee", value: deleteAEmployee },
                { name: "View total utilized budget by department", value: budgetDepartment},
                { name: "Exit", value: exit },
            ],
        },
    ]);

    answer.menu();

};

function checkDepartments() {
    db.locateDepartments().then(([rows]) => {
        console.table(rows);
        return menuMain();
    });
}

function checkEmployees() {
    db.locateEmployees().then(([rows]) => {
        console.table(rows);
        return menuMain();
    });
}

function checkRoles() {
    db.locateRoles().then(([rows]) => {
        console.table(rows);
        return menuMain();
    });
}

function confirmInput(value) {
    if (value) {
        return true;
    } else {
        console.log("\n Please enter a value");
        return false;
    }
}

const plusDepartment = async () => {
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the department name?",
            validate: confirmInput,
        },
    ]);

    const nameDepartment = answer.name;
    db.addDepartment(nameDepartment).then(() => {
        db.locateDepartments().then(([rows]) => {
            console.table(rows);
            return menuMain();
        });
    });
};

const plusRole = async () => {
    const [rows] = await db.locateDepartments();
    console.table(rows);
    const chooseDepartment = rows.map(({ name, id }) => ({ name, value: id }));
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the role title?",
            validate: confirmInput,
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary for this role?",
            validate: confirmInput,
        },
        {
            type: "list",
            name: "department",
            message: "Which department does this role belong to?",
            choices: chooseDepartment,
        }
    ]);

    db.addRole(answer.name, answer.salary, answer.department).then(() => {
        db.locateRoles().then(([rows]) => {
            console.table(rows);
            return menuMain();
        });
    });
};

function EmployeeChoicesMap({ id, name }) {
    return { name, value: id };
}

const plusEmployee = async () => {
    const[rowsA] = await db.locateRoles();
    console.table(rowsA);
    const roleChoose = rowsA.map(({ id, title }) => ({
        name: title,
        value: id,
    }));
    console.log(roleChoose);

    const [rowsB] = await db.locateEmployees();
    const employeeChoose = rowsB.map(EmployeeChoicesMap);
    console.log(employeeChoose);

    const managerChoose = [...employeeChoose, { name: "Null" }];
    console.log(managerChoose);
    const answer = await inquirer.prompt([
        {
            type: "input",
            name: "first_name",
            message: "What is the employee's first name?",
            validate: confirmInput,
        },
        {
            type: "input",
            name: "last_name",
            message: "What is the employee's last name?",
            validate: confirmInput,
        },
        {
            type: "list",
            name: "role_id",
            message: "What is this empployee's role?",
            choices: roleChoose,
        },
        {
            type: "confirm",
            name: "managerYesNo",
            message: "Does this employee have a manager?",
            default: true,
        },
        {
            type: "list",
            name: "manager_id",
            when: function (answers) {
                return answers.managerYesNo === true;
            },
            message: "Who is this employee's manager?",
            choices: managerChoose,
        },
    ]);
    delete answer.managerYesNo;
    console.log(answer);
    db.addEmployee(answer).then(() => {
        db.locateEmployees().then(([rows]) => {
            console.table(rows);
            return menuMain();
        });
    });
};

const updateEmployee = async () => {
    const [rowsA] = await db.locateRoles();
    console.table(rowsA);
    const roleChoose = rowsA.map(({ id, title }) => ({
        name: title,
        value: id,
    }));
    console.log(roleChoose);

    const [rowsB] = await db.locateEmployees();
    const employeeChoose = rowsB.map(EmployeeChoicesMap);
    console.log(employeeChoose);
    const answer = await inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Which employee's role would you like to update?",
            choices: employeeChoose,
        },
        {
            type: "list",
            name: "role",
            message: "What is this employee's new role?",
            choices: roleChoose,
        },
    ]);
    console.log(answer);
    db.employeeRoleUpdate(answer.role, answer.employee).then(() => {
        db.locateEmployees().then(([rows]) => {
            console.table(rows);
            return menuMain();
        });
    });
};

const updateEmployeeManager = async () => {
    const [rowsB] = await db.locateEmployees();
    const employeeChoose = rowsB.map(EmployeeChoicesMap);
    console.log(employeeChoose);
    const { employee } = await inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Which employee's manager do you want to update?",
            choices: employeeChoose,
        },
    ])
    const [rowsManager] = await db.findEveryManager(employee);
    console.table(rowsManager);
    const managerChoose = rowsManager.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    managerChoose.push({ name: "No manager selected", value: null });

    const { manager } = await inquirer.prompt([
        {
            type: "list",
            name: "manager",
            message: "Who is this employee's new manager?",
            choices: managerChoose,
        },
    ]);
    db.employeeManagerUpdate(manager, employee).then(() => {
        db.locateEmployees().then(([rows]) => {
            console.table(rows);
            return menuMain();

        });
    });
};

const viewManager = async () => {
    const [employeesAll] = await db.locateEmployees();
    const managerChoose = employeesAll.map(EmployeeChoicesMap);
    const { manager } = await inquirer.prompt([
        {
            type: "list",
            name: "manager",
            message: "Which manager's employees do you want to see?",
            choices: managerChoose,
        },
    ]);
    const [employeesManager] = await db.findSpecificManager(manager);
    console.table(employeesManager);
    return menuMain();
};

const viewDepartment = async () => {
    const [everyDepartment] = await db.locateDepartments();
    console.table(everyDepartment);
    const chooseDepartment = everyDepartment.map(({ id, name }) => ({
        name: name,
        value: id,
    }));
    const { department } = await inquirer.prompt([
        {
            type: "list",
            name: "department",
            message: "Which department's employees do you want to see?",
            choices: chooseDepartment,
        },
    ]);
    const [employeeDepartment] = await db.findSpecificDepartment(department);
    console.table(employeeDepartment);
    return menuMain();
};

const deleteADepartment = async () => {
    const [departmentsAll] = await db.locateDepartments();
    console.table(departmentsAll);
    const chooseDepartment = departmentsAll.map(({ id, name }) => ({
        name: name,
        value: id,
    }));
    console.table(chooseDepartment);
    const { department } = await inquirer.prompt([
        {
            type: "list",
            name: "department",
            message: "Which department do you want to delete?",
            choices: chooseDepartment,
        },
    ]);

    db.deleteDepartment(department).then(() => {
        db.locateDepartments().then(([rows]) => {
            console.table(rows);
            return menuMain();
        });
    });
};

const deleteRole = async () => {
    const [rowsA] = await db.locateRoles();
    console.table(rowsA);
    const roleChoose = rowsA.map(({ id, title }) => ({
        name: title,
        value: id,
    }));
    console.log(roleChoose);
    const response = await inquirer.prompt([
        {
            type: "list",
            name: "role",
            message: "Which role would you like to delete?",
            choices: roleChoose,
        },
    ])
    .then((response) => {
        db.deleteRole(response.role);
        db.locateRoles().then(([rows]) => {
            console.table(rows);
            return menuMain();
        });
    });
};

const deleteAEmployee = async () => {
    const [rowsA] = await db.locateEmployees();
    console.table(rowsA);
    const employeeChoose = rowsA.map(({ id, name }) => ({ name, 
        value: id,
    }));
    console.table(employeeChoose);
    const response = await inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "Which employee do you want to delete?",
            choices: employeeChoose,
        },
    ])
    .then((response) => {
        db.deleteEmployee(response.role);
        db.locateEmployees().then(([rows]) => {
            console.table(rows);
            return menuMain();
        });
    });
};

const budgetDepartment = async () => {
    const [theDepartmentBudget] = await db.locateDepartmentBudget();
    console.table(theDepartmentBudget)
    return menuMain();
}

menuMain();

