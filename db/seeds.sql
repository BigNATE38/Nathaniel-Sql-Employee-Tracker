USE company;

INSERT INTO department(id, name)
VALUES
(1, "Sales"),
(2, "Engineering"),
(3, "Finance"),
(4, "Legal");


INSERT INTO roles(id, title, salary, department_id)
VALUES 
(1, "Sales Lead", 200000, 1),
(2, "Salesperson", 90000, 1),
(3, "Lead Engineer", 150000, 2),
(4, "Software Engineer", 100000, 2),
(5, "Accountant", 130000, 3),
(6, "Legal Team Lead", 250000, 4),
(7, "Lawyer", 180000, 4);

INSERT INTO employee(id, first_name, last_name, role_id, manager_id)
VALUES
(1, "Jon", "Snow", 1, 1),
(2, "Robb", "Stark", 2, 2),
(3, "Tywin", "Lannister", 3, 3), 
(4, "Tyrion", "Lannister", 4, 1),
(5, "Jaime", "Lannister", 5, 2),
(6, "Stannis", "Baratheon", 6, 3),
(7, "Jorah", "Mormont", 7, 2),
(8, "Sam", "Tarley", 3, 3);