import { useState } from "react";
import { API_URL } from "./config";
import Chatbot from './components/Chatbot';

function App() {
  const [fileName, setFileName] = useState("")

  return ( 
    <>
      <div className='flex flex-col w-full max-w-3xl mx-auto px-4'>
      <header className='sticky top-0 shrink-0 z-20 bg-white'>
        <div className='flex flex-col h-full w-full gap-1 pt-4 pb-2'>
          <div className="flex justify-between items-center">
            <h1 className='font-urbanist text-[1.65rem] font-semibold'>PDF Chatbot</h1>
            <div className="flex items-center gap-2">
              {fileName ? (
                <div className="px-4 py-2 rounded-lg transition-colors">
                  {fileName}
                </div>
              ) : null}
              <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">
                Upload PDF
              </label>
              <input 
                id="file-upload"
                type="file" 
                accept=".pdf"
                className="hidden"
                onChange={ async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // console.log('File selected:', file);
                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                      const response = await fetch(`${API_URL}/upload_pdf/`, {
                        method: 'POST',
                        body: formData,
                      });
                      
                      if (!response.ok) {
                        throw new Error('Upload failed');
                      }

                      const result = await response.json();
                      console.log('Upload successful:', result);
                      setFileName(result.filename);
                      localStorage.setItem('fileName', result.filename);
                      
                    } catch (error) {
                      console.error('Error uploading file:', error);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>
      <Chatbot />
    </div>
    </>
  );
}

export default App;