import * as mammoth from "mammoth";

interface Result {
  value: string;
}

interface Input {
  path: string;
}

export async function docxMammothLoader(input: Input): Promise<Result> {
  try {
    let result = await mammoth.extractRawText(input);
    return { value: result.value };
  } catch (e) {
    console.error(e);
    throw new Error(
      "Failed to load mammoth. Please install it with eg. `npm install mammoth`."
    );
  }
}
