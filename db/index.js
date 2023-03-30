const connection = require("./connection");

class db {
    constructor(connection) {
        this.connection = connection;
    }
    locateDepartments() {
        return this.connection.promise().query("SELECT * FROM department");
    }
    locateRoles() {
        return this.connection
        .promise()
        .query("SELECT roles.id, roles.title, roles.salary, department.name AS department FROM roles LEFT JOIN department ON roles.department_id = department.id");
    }
    locateEmployees() {
        return this.connection.promise()
        .query(`SELECT 
        employee.id, CONCAT(employee.first_name, ' ' , employee.last_name) AS name, roles.title, department.name AS department, roles.salary, CONCAT(manager.first_name, ' ' , manager.last_name) AS manager
        FROM
        employee LEFT JOIN roles ON employee.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id`);
    }
    addDepartment(nameDepartment) {
        return this.connection
        .promise()
        .query("INSERT INTO department (name) VALUES (?)", [nameDepartment]);
    }
    addRole(titleRole, salaryRole, departmentRoleId) {
        return this.connection
        .promise()
        .query(
            "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)",
            [titleRole, salaryRole, departmentRoleId]
        );
    }
    addEmployee(answer) {
        return this.connection
        .promise()
        .query("INSERT INTO employee SET ?", answer);
    }
    employeeRoleUpdate(roleId, employeeId) {
        return this.connection
        .promise()
        .query("UPDATE employee SET role_id = ? WHERE id = ?", [
            roleId,
            employeeId,
        ]);
    }
    employeeManagerUpdate(managerId, employeeId) {
        return this.connection
        .promise()
        .query("UPDATE employee SET employee.manager_id = ? WHERE id = ?", [managerId, employeeId]);
    }
    findEveryManager(employeeId) {
        return this.connection.promise().query("SELECT * FROM employee WHERE id != ?", [employeeId]);
    }
    findSpecificManager(managerId) {
        return this.connection.promise().query(`SELECT employee.id, employee.manager_id, CONCAT(employee.first_name, ' ' , employee.last_name) AS name FROM employee LEFT JOIN roles on employee.role_id = roles.id WHERE manager_id = ?`, [managerId]);
    }
    findSpecificDepartment(departmentId) {
        console.log("depId: ", departmentId)
        return this.connection.promise().query(`SELECT CONCAT(employee.first_name, ' ' , employee.last_name) AS name, department.name AS department
        FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id
        WHERE department.id = ?`, [departmentId]);
    }
    deleteDepartment(departmentId) {
        return this.connection.promise().query("DELETE FROM department WHERE id = ?", [departmentId]);
    }
    deleteRole(roleId) {
        console.log("roleId: ", roleId)
        return this.connection.promise().query("DELETE FROM roles WHERE id = ?", [roleId]);
    }
    deleteEmployee(employeeId) {
        return this.connection.promise().query("DELETE FROM employee WHERE id = ?", [employeeId]);
    }
    locateDepartmentBudget() {
        return this.connection.promise().query("SELECT department.name AS department, department.id, SUM(salary) AS total_salary FROM employee LEFT JOIN roles on employee.role_id = roles.id LEFT JOIN department on roles.department_id = department.id GROUP BY department.id");
    }
}

module.exports = new db(connection);