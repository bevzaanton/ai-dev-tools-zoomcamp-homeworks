# Walkthrough - Online Coding Interview App

![App Screenshot](https://github.com/user-attachments/assets/4281a094-fd46-434b-8a65-345d4f50ede0)

## Features

- **Real-time Collaboration**: Multiple users can edit code simultaneously with instant synchronization
- **User Presence**: Each connected user gets a random name and color, visible in the participants list
- **Code Execution**: Run JavaScript and Python code directly in the browser using WASM (WebAssembly)
- **Syntax Highlighting**: Powered by Monaco Editor (VS Code's editor) with full syntax highlighting support for JavaScript and Python
- **Dark Theme**: Professional dark theme for comfortable coding

## Prerequisites
- Node.js installed

## How to Run

### Quick Start (Both Frontend and Backend)
Run both the frontend and backend concurrently with a single command:

```bash
# Install all dependencies first (only needed once)
npm run install:all

# Start both frontend and backend
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend app on `http://localhost:5173`

### Alternative: Run Separately

#### 1. Start Backend
Navigate to `backend` directory and run:
```bash
cd backend
npm start
```
Server runs on `http://localhost:3000`.

#### 2. Start Frontend
Navigate to `frontend` directory and run:
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:5173`.

## Verification Steps

### User Presence
1. Open `http://localhost:5173` in your browser.
2. Check the sidebar - you should see your randomly generated username with a colored badge.
3. Open the same URL in another browser tab or window.
4. Verify that both users appear in the participants list with different names and colors.
5. The current user is marked with "(You)".

![Participants List](/Users/user_1/.gemini/antigravity/brain/e07da4ec-42cd-4a40-b86b-da0f4e0d721f/participant_list_view_1764596005456.png)

### Real-time Collaboration
1. Open `http://localhost:5173` in two different browser windows or tabs.
2. Type code in one window.
3. Verify that the code updates in real-time in the other window.

### Code Execution

The application supports executing both JavaScript and Python code directly in the browser using WebAssembly (WASM). All code execution happens client-side for security.

#### JavaScript Execution
1. Select "JavaScript" from the language dropdown.
2. Type some JavaScript code, e.g.:
   ```javascript
   console.log("Hello from the browser!");
   const sum = (a, b) => a + b;
   console.log(sum(5, 3));
   // Output:
   // Hello from the browser!
   // 8
   ```
3. Click "Run".
4. Verify the output appears in the Output Panel.

#### Python Execution
1. Select "Python" from the language dropdown.
2. Type some Python code, e.g.:
   ```python
   print("Hello from Python!")

   def fibonacci(n):
       if n <= 1:
           return n
       return fibonacci(n-1) + fibonacci(n-2)

   print(f"Fibonacci(10) = {fibonacci(10)}")

   # Output:
   # Hello from Python!
   # Fibonacci(10) = 55
   ```
3. Click "Run".
4. The first time you run Python code, Pyodide (Python WASM runtime) will be loaded automatically. This may take a few seconds.
5. Verify the output appears in the Output Panel.

**Note**: Python execution uses Pyodide, which provides a full Python 3.11 environment compiled to WebAssembly. The runtime is cached after the first load for better performance.

### Syntax Highlighting
The application uses **Monaco Editor** (the same editor that powers Visual Studio Code) which provides professional-grade syntax highlighting out of the box:

1. **JavaScript Syntax Highlighting:**
   - Select "JavaScript" from the language dropdown
   - Type JavaScript code with various syntax elements:
     ```javascript
     // Comments are highlighted
     const greeting = "Hello World"; // Strings
     function calculate(a, b) {      // Keywords
       return a + b;                 // Operators
     }
     ```
   - Observe syntax highlighting for keywords, strings, comments, operators, and functions

2. **Python Syntax Highlighting:**
   - Select "Python" from the language dropdown
   - Type Python code:
     ```python
     # Comments are highlighted
     def greet(name):              # Keywords and functions
         message = f"Hello {name}" # Strings with f-string syntax
         return message
     ```
   - Observe syntax highlighting for Python-specific syntax including keywords, strings, and indentation

3. **Additional Editor Features:**
   - Dark theme for comfortable coding
   - Line numbers
   - Automatic bracket matching
   - Code folding support
   - IntelliSense-style autocomplete

## Running Tests

### Run All Tests
From the project root, run both backend and frontend tests:
```bash
npm test
```

Or run them separately:
```bash
npm run test:backend   # Backend only
npm run test:frontend  # Frontend only
npm run test:all      # Both in parallel
```

### Backend Tests
Navigate to the `backend` directory and run:
```bash
cd backend
npm test
```

The backend test suite includes **9 tests**:
- **User Connection and Presence** (4 tests)
  - User info on connection
  - Users update with current user
  - Broadcasting updates when new user connects
  - Broadcasting updates when user disconnects

- **Code Synchronization** (3 tests)
  - Broadcasting code changes to other clients
  - Not sending updates to the sender
  - Handling multiple code changes in sequence

- **Multiple Clients** (2 tests)
  - Handling 3 simultaneous connections
  - Broadcasting code to all other clients

Technologies: Jest, Socket.io client for integration testing

### Frontend Tests
Navigate to the `frontend` directory and run:
```bash
cd frontend
npm test              # Run tests once
npm run test:watch    # Run in watch mode
npm run test:ui       # Run with UI
npm run test:coverage # Run with coverage report
```

The frontend test suite includes **12 tests**:
- **OutputPanel Component** (5 tests)
  - Rendering output heading
  - Displaying ready message
  - Displaying output lines
  - Handling empty output
  - Rendering multiple lines correctly

- **Sidebar Component** (7 tests)
  - Rendering participants heading
  - Displaying user count
  - Setting up socket listeners
  - Cleaning up listeners on unmount
  - Updating users list
  - Displaying current user with "(You)" label
  - Displaying user badges with initials

Technologies: Vitest, React Testing Library, jsdom
