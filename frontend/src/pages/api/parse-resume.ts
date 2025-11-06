import { NextApiRequest, NextApiResponse } from 'next';
import { formidable } from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse';

// Disable the default body parser for this route, as we are handling a file stream
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    const resumeFile = files.resume?.[0];

    if (!resumeFile) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }
    
    // Read the file from its temporary path
    const fileData = fs.readFileSync(resumeFile.filepath);
    
    // Parse the PDF buffer
    const pdfData = await pdf(fileData);

    // Send back the extracted text
    return res.status(200).json({ text: pdfData.text });

  } catch (error) {
    console.error('Error parsing PDF:', error);
    return res.status(500).json({ error: 'Failed to parse resume PDF.' });
  }
}