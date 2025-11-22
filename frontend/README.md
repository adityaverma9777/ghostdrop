👻 GhostDrop

Secure, Serverless, Peer-to-Peer File Sharing.
GhostDrop allows you to transfer files of any size between devices without storing them on a server. Data streams directly from Peer A to Peer B using WebRTC.

🚀 Live Demo: https://ghostdrop-eosin.vercel.app/

✨ Features

Peer-to-Peer (P2P): Files go directly from device to device. No server storage means no file size limits.

Real-Time: Instant transfer using WebRTC streams.

Cross-Device: Send files from Mobile to PC, or PC to PC on different networks.

Secure: Data is encrypted in transit and never touches a database.

No Login Required: Just create a room and start sharing.

⚡ How to Use

Open GhostDrop on two devices (e.g., your laptop and your phone).

Join a Room:

Enter a unique Room Name (e.g., RocketLaunch).

Important: Room names are Case Sensitive. rocket and Rocket are different rooms!

Wait for Connection:

Once both devices join, the status will change to "CONNECTED P2P!".

Send File:

Select a file on one device and click "Send".

Watch the progress bar on both screens.

The download will start automatically on the receiving device.

🛠️ Run Locally (For Developers)

Want to run this on your own machine? Follow these steps.

Prerequisites

Node.js installed.

Git installed.

Installation

Clone the repository

git clone [https://github.com/adityaverma9777/ghostdrop.git](https://github.com/adityaverma9777/ghostdrop.git)
cd ghostdrop


Install Dependencies (One-Command)
We have a monorepo setup. Run this command in the root folder to install libraries for both Backend and Frontend automatically:

npm run setup


Running the App

You need to run the Backend and Frontend in two separate terminals.

Terminal 1 (Backend):

cd backend
npm run dev
# Server will start on http://localhost:5000


Terminal 2 (Frontend):

cd frontend
npm run dev
# Client will start on http://localhost:5173


🏗️ Tech Stack

Frontend: React + Vite

Styling: CSS3 (Responsive)

Backend: Node.js + Express

Real-Time Signaling: Socket.io

P2P Protocol: WebRTC (via simple-peer)

🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

Made with ❤️ by Aditya Verma