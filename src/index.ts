import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
import * as dotenv from "dotenv";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { intro, outro } from "@clack/prompts";
import { text } from "@clack/prompts";
import { confirm } from "@clack/prompts";
import { Document } from "langchain/document";
import * as fs from "fs";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { docxMammothLoader } from "./docxMammothLoader";
const { docxAnyTextLoader } = require("./docxAnyTextLoader.js");

dotenv.config();
async function prompts(output: any) {
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.9,
  });

  const vectorStore = await MemoryVectorStore.fromDocuments(
    output,
    new OpenAIEmbeddings()
  );

  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });

  const meaning = await text({
    message: "How can I help?",
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  const response = await chain.call({
    query: meaning,
  });

  outro(response.text);

  const shouldContinue = await confirm({
    message: "Do you have any more questions?",
  });

  if (shouldContinue) {
    prompts(output);
  } else {
    outro("Git er done!");
  }
}

function readFileAsync(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data: string) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });
}

const splitter = new CharacterTextSplitter({
  separator: "****",
  chunkSize: 10000,
  chunkOverlap: 0,
});

intro(`Hello, I am your digital assistant.`);
(async () => {
  try {
    const loader = new DirectoryLoader("src/data", {
      ".docx": (path) => new DocxLoader(path),
      ".pdf": (path) =>
        new PDFLoader(path, {
          pdfjs: () => import("pdfjs-dist/legacy/build/pdf.js"),
        }),
    });
    const docs = await loader.load();
    prompts(docs);
    console.log({ docs });
  } catch (err) {
    console.error("error", err);
  }
})();
