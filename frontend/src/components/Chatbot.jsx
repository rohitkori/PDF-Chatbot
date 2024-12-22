import { useState } from 'react';
import { useImmer } from 'use-immer';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import axios from 'axios';
import { API_URL } from '@/config';

function Chatbot() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useImmer([]);
  const [newMessage, setNewMessage] = useState('');

  const isLoading = messages.length && messages[messages.length - 1].loading;

  async function submitNewMessage() {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages(draft => [...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', sources: [], loading: true }
    ]);
    setNewMessage('');

    try {
      const response = await axios.post(`${API_URL}/query_pdf/`, {
        "filename": localStorage.getItem("fileName"),
        "query": newMessage
      })

      if (response.status == 200) {
        console.log("response from LLM: ")
        console.log(response.data);
        setMessages(draft => {
              draft[draft.length - 1].content += response.data;
            });
        }
        setMessages(draft => {
          draft[draft.length - 1].loading = false;
        });
      }
     catch (err) {
      console.log(err);
      setMessages(draft => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
    }
  }

  return (
    <div className='relative grow flex flex-col gap-6 pt-6'>
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
      />
      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
    </div>
  );
}

export default Chatbot;