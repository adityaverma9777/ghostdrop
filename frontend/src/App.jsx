import { useEffect, useState, useRef } from 'react'
import io from 'socket.io-client'
import SimplePeer from 'simple-peer'
import './App.css'

// If we are in production, use the environment variable. If localhost, use port 5000.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL);

function App() {
  const [roomId, setRoomId] = useState("")
  const [status, setStatus] = useState("Disconnected")
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isTransferring, setIsTransferring] = useState(false)
  
  const myPeer = useRef()
  
  // Receiver Variables (Refs are better here to avoid re-renders slowing down transfer)
  const receivedChunks = useRef([])
  const receivedSize = useRef(0)
  const fileMeta = useRef(null)

  useEffect(() => {
    socket.on("signal-received", (data) => {
      if (!myPeer.current) {
        const peer = new SimplePeer({ initiator: false, trickle: false })

        peer.on("signal", signal => {
          socket.emit("return-signal", { signal, callerID: data.callerID })
        })

        peer.on("connect", () => setStatus("CONNECTED P2P!"))
        
        // HANDLING INCOMING DATA (Logic Updated)
        peer.on("data", handleIncomingData)

        peer.signal(data.signal)
        myPeer.current = peer
      }
    })

    socket.on("signal-accepted", (data) => {
        myPeer.current.signal(data.signal)
    })

    socket.on("user-connected", (userId) => {
        const peer = new SimplePeer({ initiator: true, trickle: false })

        peer.on("signal", signal => {
            socket.emit("send-signal", { userToSignal: userId, callerID: socket.id, signal })
        })

        peer.on("connect", () => setStatus("CONNECTED P2P!"))
        peer.on("data", handleIncomingData)

        myPeer.current = peer
    })

    return () => {
        socket.off("user-connected");
        socket.off("signal-received");
        socket.off("signal-accepted");
    }
  }, [])

  // --- CORE FILE TRANSFER LOGIC ---

  const handleIncomingData = (data) => {
    // 1. Check if it's the Metadata (Header)
    // We assume metadata is sent as a JSON string first
    try {
        const str = new TextDecoder().decode(data)
        const json = JSON.parse(str)
        if(json.type === 'header') {
            console.log("Receiving file:", json.name)
            fileMeta.current = json
            receivedChunks.current = []
            receivedSize.current = 0
            setIsTransferring(true)
            setProgress(0)
            return // Stop processing, this was just the header
        }
    } catch (e) {
        // Not JSON, so it must be a file chunk
    }

    // 2. Handle Binary Chunks
    if(fileMeta.current) {
        receivedChunks.current.push(data)
        receivedSize.current += data.byteLength
        
        // Calculate Progress for Receiver
        const percentage = Math.floor((receivedSize.current / fileMeta.current.size) * 100)
        setProgress(percentage)

        // 3. Check if file is complete
        if(receivedSize.current === fileMeta.current.size) {
            downloadFile(receivedChunks.current, fileMeta.current.name)
            resetTransfer()
        }
    }
  }

  const sendFile = async () => {
    if(!file || !myPeer.current) return;
    
    setIsTransferring(true)
    setProgress(0)

    // 1. Send Header
    const header = JSON.stringify({ type: 'header', name: file.name, size: file.size })
    myPeer.current.send(header)

    // 2. Read and Send Chunks
    const chunkSize = 16 * 1024 // 16KB chunks (safe for WebRTC)
    let offset = 0;

    const reader = new FileReader();
    
    reader.onload = (e) => {
        myPeer.current.send(e.target.result) // Send the chunk
        offset += e.target.result.byteLength

        // Update Sender Progress
        const percentage = Math.floor((offset / file.size) * 100)
        setProgress(percentage)

        if(offset < file.size) {
            readNextChunk()
        } else {
            console.log("File Sent Successfully")
            setIsTransferring(false)
        }
    };

    const readNextChunk = () => {
        const slice = file.slice(offset, offset + chunkSize)
        reader.readAsArrayBuffer(slice)
    }

    readNextChunk() // Start the loop
  }

  const downloadFile = (chunks, fileName) => {
    const blob = new Blob(chunks)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
  }

  const resetTransfer = () => {
    setIsTransferring(false)
    fileMeta.current = null
    receivedChunks.current = []
    receivedSize.current = 0
  }

  // --- UI ---

  const joinRoom = () => {
    if(roomId) {
        socket.emit("join-room", roomId)
        setStatus(`Joined: ${roomId}`)
    }
  }

  return (
    <div className="container">
      <h1>👻 GhostDrop</h1>
      <div className="status-badge">Status: {status}</div>

      <div className="room-controls">
        <input 
            type="text" 
            placeholder="Room Name" 
            onChange={(e) => setRoomId(e.target.value)} 
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>

      <div className="drop-zone">
        <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
        />
        <button onClick={sendFile} disabled={!file || status !== "CONNECTED P2P!"}>
            Send File 🚀
        </button>
      </div>

      {isTransferring && (
        <div className="progress-container">
            <p>Transferring... {progress}%</p>
            <div style={{ 
                width: '100%', 
                height: '10px', 
                background: '#ddd', 
                borderRadius: '5px',
                overflow: 'hidden' 
            }}>
                <div style={{ 
                    width: `${progress}%`, 
                    height: '100%', 
                    background: '#4caf50',
                    transition: 'width 0.2s' 
                }}></div>
            </div>
        </div>
      )}
    </div>
  )
}

export default App