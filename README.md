# VanillaRouter Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [API Reference](#api-reference)
5. [Advanced Features](#advanced-features)
6. [Examples](#examples)

## Introduction

VanillaRouter is a lightweight, flexible routing solution for vanilla JavaScript projects. Inspired by Laravel's routing system, it provides a robust set of features for managing application routes, including middleware support, parameter handling, and navigation controls.

## Installation

Since VanillaRouter is a vanilla JavaScript class, you can simply include it in your project:

```javascript
import VanillaRouter from './path/to/VanillaRouter.js';
```

## Basic Usage

Here's a simple example to get started:

```javascript
const router = new VanillaRouter();

router
  .add('/', () => {
    console.log('Home page');
  })
  .add('/about', () => {
    console.log('About page');
  })
  .add('/user/:id', (match) => {
    console.log('User page', match.params.id);
  })
  .listen();
```

## API Reference

### Constructor

```javascript
new VanillaRouter(options)
```

- `options.mode`: 'history' (default) or 'hash'
- `options.root`: Root path for the application (default: '/')
- `options.notFoundHandler`: Function to handle 404 errors
- `options.beforeEach`: Global guard called before route changes
- `options.afterEach`: Global hook called after route changes

### Methods

- `add(path, handler, options)`: Add a new route
- `remove(path)`: Remove a route
- `flush()`: Remove all routes
- `middleware(name, handler)`: Define a middleware
- `navigate(path)`: Programmatically navigate to a route
- `resolve(path)`: Resolve a given path
- `listen()`: Start listening for route changes

## Advanced Features

### Route Parameters

You can define route parameters using the `:paramName` syntax:

```javascript
router.add('/user/:id', (match) => {
  console.log('User ID:', match.params.id);
});
```

### Query Parameters

Query parameters are automatically parsed and available in the `match.query` object:

```javascript
// URL: /search?q=javascript
router.add('/search', (match) => {
  console.log('Search query:', match.query.q);
});
```

### Middleware

You can define and use middleware for routes:

```javascript
router.middleware('auth', (next, match) => {
  if (isAuthenticated()) {
    next();
  } else {
    router.navigate('/login');
  }
});

router.add('/dashboard', handler, { middleware: ['auth'] });
```

### Navigation Guards

Use `beforeEach` and `afterEach` hooks for global navigation control:

```javascript
const router = new VanillaRouter({
  beforeEach: (match) => {
    // Return false to cancel navigation
    return true;
  },
  afterEach: (match) => {
    // Do something after navigation
  }
});
```

## Examples

### Basic SPA Setup

```javascript
const router = new VanillaRouter();
const contentDiv = document.getElementById('content');

router
  .add('/', () => {
    contentDiv.innerHTML = '<h1>Home</h1>';
  })
  .add('/about', () => {
    contentDiv.innerHTML = '<h1>About</h1>';
  })
  .add('/contact', () => {
    contentDiv.innerHTML = '<h1>Contact</h1>';
  })
  .listen();
```

### Using Route Parameters and Query

```javascript
router
  .add('/user/:id', (match) => {
    const userId = match.params.id;
    const tab = match.query.tab || 'profile';
    contentDiv.innerHTML = `<h1>User ${userId}</h1><p>Tab: ${tab}</p>`;
  })
  .listen();
```

### Nested Routes

```javascript
router
  .add('/users', () => {
    contentDiv.innerHTML = '<h1>Users</h1><div id="user-content"></div>';
  })
  .add('/users/:id', (match) => {
    const userContent = document.getElementById('user-content');
    userContent.innerHTML = `<h2>User ${match.params.id}</h2>`;
  })
  .listen();
```

### Using Middleware

```javascript
router.middleware('auth', (next, match) => {
  if (isAuthenticated()) {
    next();
  } else {
    router.navigate('/login');
  }
});

router
  .add('/dashboard', () => {
    contentDiv.innerHTML = '<h1>Dashboard</h1>';
  }, { middleware: ['auth'] })
  .add('/login', () => {
    contentDiv.innerHTML = '<h1>Login</h1>';
  })
  .listen();
```

This VanillaRouter provides a flexible and powerful routing solution for vanilla JavaScript projects, incorporating many features inspired by Laravel's routing system. It's designed to be easy to use while offering advanced capabilities for more complex applications.