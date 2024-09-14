# 🎶 Synapse - A Free Music & Audio streaming platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue.svg" alt="React">
  <!-- <img src="https://img.shields.io/badge/Electron-22.0.0-orange.svg" alt="Electron"> -->
  <img src="https://img.shields.io/badge/Node.js-v18.16.0-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/Vercel-Hosted-lightgrey.svg" alt="Vercel">
</p>

<p align="center">
  A full-stack React application that allows users to stream music, podcasts, and the audio of YouTube videos using the YouTube v3 API. Stream your favorite content seamlessly!
</p>
<p align="center">
  check it out: <a href="https://synapse-music.vercel.app/">synapse-music</a>
</p>


## 📹 Tutorial

Learn how to use and set up the project by watching this YouTube tutorial:

<div align="center">
<iframe width="560" height="315" src="https://www.youtube.com/embed/SlYSvyaMhcQ?si=lOshuX240F4TOFmF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

---

## 🚀 Features

- Stream music and podcasts
- Extract audio from YouTube videos
- Seamless integration with YouTube's v3 API
- Full-stack setup (Frontend: React, Backend: Node.js)
- Hosted on Vercel for fast deployment

---

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Hosting**: Vercel

---

## 🖥️ Getting Started

### Prerequisites

Before you start, make sure you have the following installed:

- Node.js v18.16.0 or later
- npm or yarn
- YouTube Data API v3 (set up and get your API key from [Google Cloud Console](https://console.cloud.google.com/))
- A Vercel account for hosting (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shivendrra/synapse.git
   cd synapse
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your YouTube API key:

   ```
   REACT_APP_YOUTUBE_API_KEY=your_youtube_v3_api_key
   ```

4. Run the app:

   ```bash
   npm start
   ```

   The React app will be served locally at `http://localhost:3000`.

---

## 🛠️ Backend Setup

1. Navigate to the backend folder:

   ```bash
   cd website/backend
   ```

2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Start the backend server:

   ```bash
   npm run dev
   ```

   The backend server will be running on `http://localhost:5000`.

---

## 🌐 Deploy to Vercel

Deploying the app to Vercel is simple:

1. [Sign in to Vercel](https://vercel.com/login) and link your GitHub repository.
2. Import the project.
3. Vercel will automatically build and deploy your app.

---

## 🎥 Video API Integration

The app uses YouTube v3 API to stream audio content from videos:

- To interact with the API, you can find the logic inside the `src/services/youtubeService.js` file.
- The API extracts only audio from YouTube videos, making it ideal for music and podcast streaming.

---

## 📂 Project Structure

```
├── backend
│   ├── controllers
│   ├── models
│   ├── middlewares
│   ├── routes
│   ├── base.js
│   └── index.js
├── frontend
│   ├── public
│   ├── src
│   ├── components
│   ├── services
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

---

## 📚 Learn More

For more details, check the official documentation for each framework and library used:

- [React](https://reactjs.org/docs/getting-started.html)
- [Express](https://expressjs.com/)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Vercel](https://vercel.com/)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This README structure provides the basics for:

- **Installation**: Explains how to set up both the frontend and backend.
- **Tech Stack**: Lists the key technologies used.
- **Project Structure**: Shows the overall layout.
- **Embedded YouTube tutorial**: The embed URL can be updated with your actual tutorial's YouTube link.

Feel free to adjust as needed!