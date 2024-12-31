# PDF Chatbot

A web application that allows users to upload PDF documents and interact with their content through a chat interface. The application uses LangChain and Groq for document processing and question answering.

## Features

- PDF document upload and processing
- Interactive chat interface for querying PDF content
- Responsive web design
- Vector store for efficient document retrieval

## Tech Stack

- FastAPI
- React
- LangChain
- Groq
- ChromaDB
- PyPDF Loader
- Tailwind CSS

## Prerequisites

- Python 3.8+
- Node.js 
- Groq API key

## Installation

1. Clone the repository:
    ```
    git clone https://github.com/rohitkori/PDF-Chatbot.git
    ```

2. Copy .env.example to .env and update the variable values
    ```
    cp .env.example .env
    ```

3. Create virtual environment for fastAPI
    ```
    python -m venv venv
    ```

4. Enter virtual environment
    ```
    source ./venv/bin/activate
    ```

5. Install the dependecies
    ```
    pip install -r requirements.txt
    ```

6. Start the FastAPI server using
    ```
    uvicorn main:app --port 8000
    ```
7. For Frontend:
    
    - Enter the frontend directory
        ``` 
        cd frontend
        ```
    
    - Install the dependencies
        ```
        npm install
        ```

    - Start the react app using   
        ```
        npm run dev
        ```
