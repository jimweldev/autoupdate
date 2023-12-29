import React, { useEffect, useState } from 'react';

const App = () => {
  const [message, setMessage] = useState('');
  const [version, setVersion] = useState('');

  useEffect(() => {
    // Receive the message from the main process
    const updateMessageHandler = (event, arg) => {
      setMessage(arg.message);
      setVersion(arg.version);
    };

    window.bridge.updateMessage(updateMessageHandler);

    return () => {
      // Remove the event listener when the component unmounts
      window.bridge.updateMessage(updateMessageHandler);
    };
  }, []);

  return (
    <div>
      <div>App {message}</div>
      <div>Version {version}</div>
    </div>
  );
};

export default App;
