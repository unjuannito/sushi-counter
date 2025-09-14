import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useWebSocket = () => {
    const [message, setMessage] = useState(null);

    useEffect(() => {
        // Conectarse al servidor WebSocket
        const socket = io(serverUrl);

        // Escuchar el evento 'update' y actualizar el estado
        socket.on('update', (data) => {
            setMessage(data);
        });

        // Limpiar la conexión cuando el componente se desmonte
        return () => {
            socket.disconnect();
        };
    }, [serverUrl]);

    return message;
};

export default useWebSocket;
