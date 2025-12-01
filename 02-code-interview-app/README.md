# Walkthrough - Online Coding Interview App

![App Screenshot](/Users/user_1/.gemini/antigravity/brain/e07da4ec-42cd-4a40-b86b-da0f4e0d721f/fixed_page_view_1764591429365.png)

## Features

- **Real-time Collaboration**: Multiple users can edit code simultaneously with instant synchronization
- **User Presence**: Each connected user gets a random name and color, visible in the participants list
- **Code Execution**: Run JavaScript code directly in the browser
- **Syntax Highlighting**: Support for JavaScript and Python

## Prerequisites
- Node.js installed
- Two terminal windows (or use the provided commands)

## How to Run

### 1. Start Backend
Navigate to `backend` directory and run:
```bash
cd backend
node index.js
```
Server runs on `http://localhost:3000`.

### 2. Start Frontend
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
1. Select "JavaScript" from the language dropdown.
2. Type some JavaScript code, e.g.:
   ```javascript
   console.log("Hello from the browser!");
   const sum = (a, b) => a + b;
   console.log(sum(5, 3));
   ```
3. Click "Run".
4. Verify the output appears in the Output Panel.

### Language Support
- Select Python from the language dropdown.
- Click "Run".
- Verify it shows a message that execution is not supported in this demo.
