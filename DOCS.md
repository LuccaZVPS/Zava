# Installation

To start using the Zava library, you can install it via npm or yarn.

### npm

```bash
npm install zava
```

### yarn

```bash
yarn add zava
```

# Creating Routes

Zava makes it easy to define routes for your application. Here's a basic example:

```javascript
import zava from "zava";

const app = zava();

app.get("/hello", (req, res) => {
  res.send(200, "Hello World!");
});

app.post("/hello", (req, res) => {
  res.send(200, "Hello World!");
});

app.run(3000);
```

# Creating Routes with Router

You can organize your routes using a `Router` in Zava. Here's an example:

```javascript
import zava, { Router } from "zava";
import { createUser, findUser } from "./user";

const app = zava();
const userRoutes = Router();

userRoutes.get("/", (req, res) => {
  const user = findUser(req.body);
  res.send(200, { user });
});

userRoutes.post("/", (req, res) => {
  const user = createUser(req.body);
  res.send(200, { user });
});

app.apply("/user", userRoutes);

app.run(3000);
```

# Creating Routes with Parameters

In Zava, you can define routes with both mandatory and optional parameters. Here's an example:

```javascript
// Mandatory parameter ':id'
app.get("/posts/:id", (req, res) => {
  res.send(200, "non-optional parameter");
});

// Optional parameter ':id?'
app.get("/categories/:id?", (req, res) => {
  res.send(200, "optional param");
});
```

# Handling Query Parameters

```javascript
// Handling query parameter 'page'
app.get("/posts", (req, res) => {
  const { page } = req.query;
  res.send(200, "optional param");
});
```

# Serving Static Files

Zava allows you to serve static files easily using the `Static` middleware. Here's an example:

```javascript
import zava, { Static } from "zava";
const app = zava();
// Serve static files from the 'public' directory
app.apply("/files", Static("public"));
```

# Returning Files to the Client

You can easily send files to clients using the `res.sendFile` method in Zava. Here's an example:

```javascript
// Define the path to the file
const filePath = "/path/to/your/file.txt";
app.get("/", (req, res) => {
  res.sendFile(filePath);
});
```

# Handling Uncaught Errors

Zava allows you to define a function that will be called whenever an unhandled error occurs within a controller. This is useful for global error handling. Here's an example:

```javascript
import zava, { Response, Request } from "zava";

const app = zava();

// Define an error handler function
const errorHandlerFn = (req: Response, res: Request, e: Error) => {
  console.log(e);
  res.send(500, "Internal Server Error");
};

// Add the exception filter to the application
app.addExceptionFilter(errorHandlerFn);

app.run(3000);
```
