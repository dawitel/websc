// app/api/upload/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "uploads");

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  const filePath = path.join(uploadDir, file.name);

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // Save the file
  const fileStream = fs.createWriteStream(filePath);

  // Convert the file's ReadableStream to a Node.js stream
  const reader = file.stream().getReader();
  const writer = fileStream;

  // Pipe the ReadableStream to the Node.js writable stream
  await new Promise<void>((resolve, reject) => {
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          writer.end();
          resolve();
          break;
        }
        writer.write(value);
      }
    };

    pump().catch(reject);
  });

  // // Process CSV file
  // const csvData = fs.readFileSync(filePath);
  // const records = parse(csvData, {
  //   columns: true,
  //   skip_empty_lines: true,
  // });

  // console.log("CSV Data:", records);

  return NextResponse.json({
    message: "File uploaded and processed successfully",
  });
}
