import { Server } from 'socket.io';

import Connection from './database/db.js';
import dotenv from "dotenv";
import { getDocument, updateDocument } from './controller/document-controller.js'

dotenv.config();

const PORT = process.env.PORT || 9000;

Connection();

const io = new Server(PORT, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

io.on('connection', socket => {
    console.log("socket connected");
    socket.on('get-document', async documentId => {
        const document = await getDocument(documentId);
        console.log(documentId);
        socket.join(documentId);
        socket.emit('load-document', document.data);

        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        })

        socket.on('save-document', async data => {
            await updateDocument(documentId, data);
        })
    })
});