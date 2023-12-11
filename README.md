# ToDo Project [CRUD]

This project is a basic implementation of CRUD operations using [NextJS]. It allows users to perform Create, Read, Update, and Delete operations on [ToDo].

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Examples](#examples)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/maiconloure/crud
cd crud
npm install
```

## Usage
Start the server: `npm run dev`. Visit [http://localhost:3000](http://localhost:3000).


## API Endpoints

- **Create:** `POST /api/todos`
- **Read:** `GET /api/todos/:id` and `GET /api/todos`
- **Update:** `PUT /api/todos/:id`
- **Delete:** `DELETE /api/todos/:id`

## Examples

### Create

```bash
curl -X POST http://localhost:3000/api/todos -d '{"content": "value"}' -H 'Content-Type: application/json'
```

### Read

```bash
curl http://localhost:3000/api/todos
```

### Update

```bash
curl -X PUT http://localhost:3000/api/todos/:id
```

### Delete

```bash
curl -X DELETE http://localhost:3000/api/todos/:id

```
