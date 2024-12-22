from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from langchain_groq import ChatGroq
from langchain_core.embeddings import DeterministicFakeEmbedding
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_chroma import Chroma
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists('uploads'):
    os.mkdir('uploads')

if not os.path.exists('vectorstore_db'):
    os.mkdir('vectorstore_db')

embeddings = DeterministicFakeEmbedding(size=4096)

vector_store = Chroma(
    persist_directory='vectorstore_db',
    embedding_function=embeddings
)

llm = ChatGroq(model="llama3-8b-8192")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

def upload_pdf_to_vectorstore_db(file_path: str):

    loader = PyPDFLoader(file_path)
    docs = loader.load_and_split(text_splitter)
    for doc in docs:
        doc.metadata = {"source_file_path": file_path.split("/")[-1]}

    vector_store.add_documents(docs)
    print(f"Successfully uploaded {len(docs)} documents from {file_path}")

def query_pdf_by_filename(filename: str, query: str):
    matching_docs = vector_store.as_retriever(
        search_kwargs={
            "filter": {"source_file_path": filename}
        }
    )

    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know. Use three sentences maximum and keep the "
        "answer concise."
        "\n\n"
        "{context}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(matching_docs, question_answer_chain)
    
    response = rag_chain.invoke({"input": query})
    return response["answer"]


@app.post("/upload_pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as f:
        f.write(await file.read())

    upload_pdf_to_vectorstore_db(file_location)

    return {"message": "PDF uploaded and processed successfully", "filename": file.filename}


class QueryRequest(BaseModel):
    filename: str
    query: str


@app.post("/query_pdf/")
async def query_pdf(request: QueryRequest):
    results = query_pdf_by_filename(request.filename, request.query)
    return results
