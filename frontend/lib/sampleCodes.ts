import type { SampleCode } from "./types";

export const sampleCodes: SampleCode[] = [
  // ─── C ───────────────────────────────────────────────────────────
  {
    id: "c-basics",
    title: "1. Basics (Variables, If, Loop)",
    lang: "c",
    topic: "CSE101",
    description: "Start from zero: Variable initialization, arithmetic, if-else, and for-loops.",
    code: `#include <stdio.h>

int main() {
    // 1. Initialize variables
    int a = 10;
    int b = 20;
    
    // 2. Perform operations
    int sum = a + b;
    int diff = b - a;
    
    // 3. Conditional logic
    if (sum > 25) {
        printf("Sum %d is greater than 25\\n", sum);
    } else {
        printf("Sum is small\\n");
    }
    
    // 4. Simple loop
    for(int i = 1; i <= 3; i++) {
        printf("Loop count: %d\\n", i);
    }
    
    return 0;
}`,
  },
  {
    id: "c-switch-case",
    title: "2. Control: Switch-Case",
    lang: "c",
    topic: "CSE101",
    description: "Unit 2: Control structures using a switch-case statement.",
    code: `#include <stdio.h>

int main() {
    int day = 3;
    switch(day) {
        case 1: printf("Monday\\n"); break;
        case 2: printf("Tuesday\\n"); break;
        case 3: printf("Wednesday\\n"); break;
        default: printf("Other day\\n");
    }
    return 0;
}`,
  },
  {
    id: "c-pass-by-reference",
    title: "3. Functions: Pass by Ref",
    lang: "c",
    topic: "CSE101",
    description: "Unit 3: Function scope and pass by reference using pointers to swap values.",
    code: `#include <stdio.h>

void swap(int *x, int *y) {
    int temp = *x;
    *x = *y;
    *y = temp;
}

int main() {
    int a = 10, b = 20;
    swap(&a, &b);
    printf("After swap: a=%d, b=%d\\n", a, b);
    return 0;
}`,
  },
  {
    id: "c-2d-array",
    title: "4. Arrays: 2D Matrix Traversal",
    lang: "c",
    topic: "CSE101",
    description: "Unit 4: Creating a 2D array and traversing it to find the sum.",
    code: `#include <stdio.h>

int main() {
    int matrix[2][2] = {{1, 2}, {3, 4}};
    int sum = 0;
    
    for(int i = 0; i < 2; i++) {
        for(int j = 0; j < 2; j++) {
            sum += matrix[i][j];
        }
    }
    printf("Sum of matrix = %d\\n", sum);
    return 0;
}`,
  },
  {
    id: "c-dynamic-memory",
    title: "5. Pointers: Dynamic Memory",
    lang: "c",
    topic: "CSE101",
    description: "Unit 5: Using malloc to dynamically allocate memory and free it.",
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int*) malloc(3 * sizeof(int));
    if (arr == NULL) return 1;
    
    arr[0] = 10;
    arr[1] = 20;
    arr[2] = 30;
    
    printf("Values: %d, %d, %d\\n", arr[0], arr[1], arr[2]);
    free(arr);
    return 0;
}`,
  },
  {
    id: "c-bubble-sort",
    title: "Bubble Sort",
    lang: "c",
    topic: "Sorting",
    description: "Classic bubble sort with step-by-step swap animation",
    code: `#include <stdio.h>

void bubbleSort(int arr[], int n) {
    int i, j, temp;
    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = 7;
    bubbleSort(arr, n);
    printf("Sorted array: ");
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    return 0;
}`,
  },
  {
    id: "c-fibonacci",
    title: "Fibonacci (Recursion)",
    lang: "c",
    topic: "Recursion",
    description: "Fibonacci using recursion — shows call stack visualization",
    code: `#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1)
        return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int n = 6;
    printf("Fibonacci of %d = %d\\n", n, fibonacci(n));
    return 0;
}`,
  },
  {
    id: "c-linear-search",
    title: "Linear Search",
    lang: "c",
    topic: "Searching",
    description: "Linear search through an array with element highlighting",
    code: `#include <stdio.h>

int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target)
            return i;
    }
    return -1;
}

int main() {
    int arr[] = {10, 25, 8, 42, 17, 33};
    int n = 6, target = 42;
    int result = linearSearch(arr, n, target);
    if (result != -1)
        printf("Found at index %d\\n", result);
    else
        printf("Not found\\n");
    return 0;
}`,
  },

  // ─── C++ ─────────────────────────────────────────────────────────
  {
    id: "cpp-basics",
    title: "1. OOP Basics (Class & Object)",
    lang: "cpp",
    topic: "CSE202",
    description: "Start from zero: Creating a basic Class, Object, and calling a method.",
    code: `#include <iostream>
using namespace std;

// 1. Define a Class
class Student {
public:
    string name;
    int marks;

    // Method inside class
    void display() {
        cout << "Student: " << name << ", Marks: " << marks << endl;
        if (marks >= 40) {
            cout << "Result: Pass" << endl;
        } else {
            cout << "Result: Fail" << endl;
        }
    }
};

int main() {
    // 2. Create an Object
    Student s1;
    s1.name = "Arjun";
    s1.marks = 85;

    // 3. Call method
    s1.display();

    return 0;
}`,
  },
  {
    id: "cpp-stack",
    title: "Stack (Class)",
    lang: "cpp",
    topic: "Stack",
    description: "Stack implementation using a class with push/pop operations",
    code: `#include <iostream>
using namespace std;

class Stack {
    int arr[100];
    int top;
public:
    Stack() { top = -1; }

    void push(int val) {
        if (top >= 99) {
            cout << "Stack overflow!" << endl;
            return;
        }
        arr[++top] = val;
        cout << "Pushed: " << val << endl;
    }

    int pop() {
        if (top < 0) {
            cout << "Stack underflow!" << endl;
            return -1;
        }
        return arr[top--];
    }

    bool isEmpty() { return top < 0; }
};

int main() {
    Stack s;
    s.push(10);
    s.push(20);
    s.push(30);
    cout << "Popped: " << s.pop() << endl;
    cout << "Popped: " << s.pop() << endl;
    return 0;
}`,
  },
  {
    id: "cpp-linked-list",
    title: "Linked List Insert",
    lang: "cpp",
    topic: "Linked List",
    description: "Singly linked list with insert at front, end, and display",
    code: `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
    Node* head;
public:
    LinkedList() : head(nullptr) {}

    void insertFront(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }

    void insertEnd(int val) {
        Node* newNode = new Node(val);
        if (!head) { head = newNode; return; }
        Node* temp = head;
        while (temp->next) temp = temp->next;
        temp->next = newNode;
    }

    void display() {
        Node* temp = head;
        while (temp) {
            cout << temp->data << " -> ";
            temp = temp->next;
        }
        cout << "NULL" << endl;
    }
};

int main() {
    LinkedList ll;
    ll.insertEnd(10);
    ll.insertEnd(20);
    ll.insertFront(5);
    ll.insertEnd(30);
    ll.display();
    return 0;
}`,
  },

  // ─── Python ──────────────────────────────────────────────────────
  {
    id: "py-basics",
    title: "1. Basics (Variables, Lists, Loops)",
    lang: "python",
    topic: "INT108",
    description: "Start from zero: Variables, lists, if-else, and iterations in Python.",
    code: `# 1. Initialize variables
name = "Priya"
age = 19
is_student = True

# 2. Conditional logic
if age >= 18:
    status = "Adult"
else:
    status = "Minor"

# 3. Lists and Loops
subjects = ["Math", "Physics", "Computer Science"]
total_subjects = len(subjects)

print(f"{name} is an {status} taking {total_subjects} subjects:")

for sub in subjects:
    print("- " + sub)
`,
  },
  {
    id: "py-nested-loops",
    title: "2. Control: Nested Loops",
    lang: "python",
    topic: "INT108",
    description: "Unit 2: Using nested for-loops to print a number pattern.",
    code: `# Unit 2: Nested Loops
rows = 3
for i in range(1, rows + 1):
    pattern = ""
    for j in range(1, i + 1):
        pattern += str(j) + " "
    print(pattern)`,
  },
  {
    id: "py-collections",
    title: "4. Dictionaries & Strings",
    lang: "python",
    topic: "INT108",
    description: "Unit 4: String slicing and Dictionary manipulation.",
    code: `# Unit 4: Dictionaries and Strings
student = {"name": "Arjun", "grade": "A"}
course = "Python Programming"

# String slicing
short_name = course[0:6]

# Dictionary manipulation
student["course"] = short_name
student["grade"] = "A+"

print(student)`,
  },
  {
    id: "py-oop",
    title: "5. Classes & Objects",
    lang: "python",
    topic: "INT108",
    description: "Unit 5: Object-Oriented Programming with a Class and Method.",
    code: `# Unit 5: Classes and Objects
class Car:
    def __init__(self, brand, speed):
        self.brand = brand
        self.speed = speed
        
    def accelerate(self):
        self.speed += 10
        return self.speed

my_car = Car("Tata", 50)
new_speed = my_car.accelerate()
print(f"{my_car.brand} is now going {new_speed} km/h")`,
  },
  {
    id: "py-exceptions",
    title: "6. Exceptions",
    lang: "python",
    topic: "INT108",
    description: "Unit 6: Handling ZeroDivisionError using a try-except block.",
    code: `# Unit 6: Exceptions
a = 10
b = 0

try:
    result = a / b
except ZeroDivisionError:
    print("Error: Cannot divide by zero!")
    result = 0

print("Final result:", result)`,
  },
  {
    id: "py-binary-search",
    title: "Binary Search",
    lang: "python",
    topic: "Searching",
    description: "Binary search on a sorted array — watch it halve the range each step",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

arr = [2, 5, 8, 12, 16, 23, 38, 45, 67, 90]
target = 23
result = binary_search(arr, target)

if result != -1:
    print(f"Found {target} at index {result}")
else:
    print(f"{target} not found")`,
  },
  {
    id: "py-factorial",
    title: "Factorial (Recursion)",
    lang: "python",
    topic: "Recursion",
    description: "Factorial using recursion — visualizes the call stack depth",
    code: `def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

result = factorial(6)
print(f"6! = {result}")`,
  },
  {
    id: "py-selection-sort",
    title: "Selection Sort",
    lang: "python",
    topic: "Sorting",
    description: "Selection sort with minimum element tracking and swaps",
    code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

arr = [64, 25, 12, 22, 11]
print("Original:", arr)
sorted_arr = selection_sort(arr)
print("Sorted:", sorted_arr)`,
  },

  // ─── SQL ─────────────────────────────────────────────────────────
  {
    id: "sql-basics",
    title: "1. Basics (Create & Insert)",
    lang: "sql",
    topic: "INT306",
    description: "Start from zero: Creating a simple table and inserting your first row.",
    code: `-- 1. Create a table from scratch
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50),
    age INT
);

-- 2. Insert records
INSERT INTO users (user_id, username, age) VALUES (1, 'Rahul', 21);
INSERT INTO users (user_id, username, age) VALUES (2, 'Sneha', 19);

-- 3. Simple retrieval
SELECT * FROM users WHERE age >= 20;`,
  },
  {
    id: "sql-aggregate",
    title: "3. Operations: Aggregation",
    lang: "sql",
    topic: "INT306",
    description: "Unit 3: Using GROUP BY and Aggregate functions like SUM and COUNT.",
    code: `CREATE TABLE employees (id INT, dept VARCHAR(10), salary INT);
INSERT INTO employees VALUES (1, 'IT', 50000);
INSERT INTO employees VALUES (2, 'IT', 60000);
INSERT INTO employees VALUES (3, 'HR', 45000);

SELECT dept, SUM(salary) as total_salary, COUNT(*) as emp_count
FROM employees
GROUP BY dept;`,
  },
  {
    id: "sql-subquery",
    title: "4. Operations: Subqueries",
    lang: "sql",
    topic: "INT306",
    description: "Unit 3/4: Using a nested subquery for data retrieval.",
    code: `CREATE TABLE products (id INT, price INT);
INSERT INTO products VALUES (1, 100);
INSERT INTO products VALUES (2, 200);
INSERT INTO products VALUES (3, 300);

SELECT * FROM products 
WHERE price > (SELECT AVG(price) FROM products);`,
  },
  {
    id: "sql-transaction",
    title: "5. TCL: Transactions",
    lang: "sql",
    topic: "INT306",
    description: "Unit 5: Transaction Control Language (TCL) with BEGIN and COMMIT.",
    code: `CREATE TABLE accounts (id INT, balance INT);
INSERT INTO accounts VALUES (1, 1000);
INSERT INTO accounts VALUES (2, 500);

BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 200 WHERE id = 1;
UPDATE accounts SET balance = balance + 200 WHERE id = 2;
COMMIT;

SELECT * FROM accounts;`,
  },
  {
    id: "sql-students-basic",
    title: "Students Table (CRUD)",
    lang: "sql",
    topic: "SQL Basics",
    description: "Create a students table, insert rows, and run SELECT with WHERE",
    code: `CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT,
    branch VARCHAR(20)
);

INSERT INTO students VALUES (1, 'Arjun', 85, 'CSE');
INSERT INTO students VALUES (2, 'Priya', 92, 'LCA');
INSERT INTO students VALUES (3, 'Rahul', 71, 'INT');
INSERT INTO students VALUES (4, 'Sneha', 88, 'CSE');
INSERT INTO students VALUES (5, 'Karan', 65, 'INT');

SELECT * FROM students WHERE marks > 80;`,
  },
  {
    id: "sql-join",
    title: "JOIN Query",
    lang: "sql",
    topic: "SQL JOIN",
    description: "INNER JOIN between students and courses tables",
    code: `CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    course_id INT
);

CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    course_name VARCHAR(50)
);

INSERT INTO students VALUES (1, 'Arjun', 101);
INSERT INTO students VALUES (2, 'Priya', 102);
INSERT INTO students VALUES (3, 'Rahul', 101);

INSERT INTO courses VALUES (101, 'C Programming');
INSERT INTO courses VALUES (102, 'Python');
INSERT INTO courses VALUES (103, 'DBMS');

SELECT s.name, c.course_name
FROM students s
INNER JOIN courses c ON s.course_id = c.course_id;`,
  },
  {
    id: "cpp-queue",
    lang: "cpp",
    title: "Queue Class (Array)",
    topic: "CSE202",
    code: `#include <iostream>
using namespace std;

class Queue {
private:
    int items[5];
    int front, rear;
public:
    Queue() {
        front = -1;
        rear = -1;
    }

    void enqueue(int val) {
        if (rear == 4) {
            cout << "Queue is full\\n";
            return;
        }
        if (front == -1) front = 0;
        rear++;
        items[rear] = val;
    }

    int dequeue() {
        if (front == -1 || front > rear) {
            cout << "Queue is empty\\n";
            return -1;
        }
        int val = items[front];
        front++;
        return val;
    }
};

int main() {
    Queue q;
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    
    q.dequeue();
    q.enqueue(40);
    
    return 0;
}
`,
  },
  {
    id: "python-bst",
    lang: "python",
    title: "Binary Search Tree Insert",
    topic: "INT108",
    code: `class Node:
    def __init__(self, key):
        self.left = None
        self.right = None
        self.val = key

def insert(root, key):
    if root is None:
        return Node(key)
    else:
        if root.val == key:
            return root
        elif root.val < key:
            root.right = insert(root.right, key)
        else:
            root.left = insert(root.left, key)
    return root

# Driver code
root = Node(50)
root = insert(root, 30)
root = insert(root, 20)
root = insert(root, 40)
root = insert(root, 70)
root = insert(root, 60)
root = insert(root, 80)
`,
  },
];

export const getSamplesByLang = (lang: string) =>
  sampleCodes.filter((s) => s.lang === lang);

export const getDefaultSample = (lang: string): SampleCode | undefined =>
  sampleCodes.find((s) => s.lang === lang);
