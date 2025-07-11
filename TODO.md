
- [ ]  create a local fullstack setup with:
    - [ ] fastify be todo app
    - [ ] the react fe todo app
    - [ ] dynamodb using docker
    - [ ] have a simple ddb explorer
    - [ ] seed database with example data

- [ ] run all tests from base dir
    - [ ] run project tests from project dir

- [ ] setup cdk
    - [ ] backend
    - [ ] frontend

CREATED FASTIFY BE TODO APP
FASTIFY TODO APP ROUTES
| Method | Route            | Description                              |
| ------ | ---------------- | ---------------------------------------- |
| GET    | `/api/todos`     | Get all todos                            |
| GET    | `/api/todos/:id` | Get a single todo by ID                  |
| POST   | `/api/todos`     | Create a new todo                        |
| PUT    | `/api/todos/:id` | Update an entire todo                    |
| PATCH  | `/api/todos/:id` | Partially update a todo (e.g. mark done) |
| DELETE | `/api/todos/:id` | Delete a todo                            |


| Method | Route              | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | `/api/auth/login`  | Login user                 |
| POST   | `/api/auth/signup` | Register new user          |
| GET    | `/api/me`          | Get current logged-in user |

using to view local ddb table
https://github.com/aaronshaf/dynamodb-admin