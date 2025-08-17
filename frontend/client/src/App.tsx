import './App.css';
import Header from './components/Header/Header';
import Chat from './components/Chat/Chat';
import { useEffect, useState } from 'react';
import { getInitialMessages } from './utils/api';
import { AnyMessage } from './utils/interfaces';
import NotFound from './components/NotFound/NotFound';
import Loader from './components/Loader/Loader';

function App() {
  const [initMessages, setInitMessages] = useState<AnyMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const questId = window.location.pathname.split('/chat/')[1];
  useEffect(() => {
    getInitialMessages(questId)
      .then((data) => {
        const { messages, session_id } = data;
        setInitMessages([...messages]);
        localStorage.setItem('session_id', session_id);
      })
      .finally(() => setTimeout(() => setIsLoading(false), 300))
      .catch(() => setError(true));
  }, []);
  return (
    <>
      <Header />
      {isLoading ? (
        <Loader />
      ) : error ? (
        <NotFound />
      ) : (
        <Chat
          questId={questId}
          initMessages={initMessages}
        />
      )}
    </>
  );
}

export default App;
