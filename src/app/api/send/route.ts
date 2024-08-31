import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";
import * as React from "react";
import * as json2csv from "json-2-csv"
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // const {to, name, from, subject, file} = req.json()
    // parse the file JSON data to csv format
    // send the file with the body
    const { fileJSONContent, to, from, name, subject } = await req.json();

    if (!fileJSONContent || !to || !from || !name || !subject) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const jsonData = JSON.parse(fileJSONContent);

    // Convert JSON to CSV using json-2-csv
    let csvData: string;
    try {
      csvData = await json2csv.json2csvAsync(jsonData);
    } catch (error) {
      return NextResponse.json(
        { message: "Error converting JSON to CSV" },
        { status: 500 }
      );
    }

    // Save CSV file
    const csvPath = path.join(process.cwd(), "uploads", "file.csv");
    fs.writeFileSync(csvPath, csvData);
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["contact.triviumstudios@gmail.com"],
      subject: "Hello world",
      react: EmailTemplate({ firstName: "Dawit" }) as React.ReactElement,
      attachments: [
        {
          filename: "",
          content: "",
          // encoding: "base64",
        },
      ],
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
