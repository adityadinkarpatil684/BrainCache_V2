// const { GoogleGenAI } = require('@google/genai');
// const NoteModel = require('../models/noteModel');

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// // Helper: fetch webpage text content from a URL
// async function fetchWebpageText(url) {
//   try {
//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 10000);
//     const res = await fetch(url, {
//       signal: controller.signal,
//       headers: { 'User-Agent': 'BrainCache/1.0' }
//     });
//     clearTimeout(timeout);
//     if (!res.ok) return null;
//     const html = await res.text();
//     // Strip HTML tags and get plain text
//     const text = html
//       .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
//       .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
//       .replace(/<[^>]+>/g, ' ')
//       .replace(/\s+/g, ' ')
//       .trim();
//     // Limit to ~5000 chars to stay within token limits
//     return text.substring(0, 5000);
//   } catch (err) {
//     console.error('Failed to fetch webpage:', err.message);
//     return null;
//   }
// }

// // Helper: fetch image as base64 from URL for Gemini Vision
// async function fetchImageAsBase64(url) {
//   try {
//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 15000);
//     const res = await fetch(url, { signal: controller.signal });
//     clearTimeout(timeout);
//     if (!res.ok) return null;
//     const buffer = await res.arrayBuffer();
//     const base64 = Buffer.from(buffer).toString('base64');
//     const contentType = res.headers.get('content-type') || 'image/jpeg';
//     return { base64, mimeType: contentType };
//   } catch (err) {
//     console.error('Failed to fetch image:', err.message);
//     return null;
//   }
// }

// const summarizeNote = async (req, res) => {
//   try {
//     const noteId = req.params.noteId;
//     const note = await NoteModel.getById(noteId, req.user.id);

//     if (!note) {
//       return res.status(404).json({ message: 'Note not found' });
//     }

//     let summary = '';

//     switch (note.type) {
//       case 'text': {
//         const prompt = `You are a helpful assistant. Summarize the following note concisely in 3-5 sentences. Focus on the key points and main ideas.\n\nTitle: ${note.title}\n\nContent: ${note.content || 'No content provided.'}`;
//         const response = await ai.models.generateContent({
//           model: 'gemini-2.0-flash',
//           contents: prompt,
//         });
//         summary = response.text;
//         break;
//       }

//       case 'image': {
//         if (note.media_url) {
//           const imageData = await fetchImageAsBase64(note.media_url);
//           if (imageData) {
//             const prompt = `You are a helpful assistant. This image is saved as a note titled "${note.title}". ${note.content ? `The user also added this description: "${note.content}". ` : ''}Please provide a concise summary describing what this image contains and its key details in 3-5 sentences.`;
//             const imagePart = {
//               inlineData: {
//                 data: imageData.base64,
//                 mimeType: imageData.mimeType
//               }
//             };
//             const response = await ai.models.generateContent({
//               model: 'gemini-2.0-flash',
//               contents: [prompt, imagePart],
//             });
//             summary = response.text;
//           } else {
//             // Fallback: summarize based on title and content only
//             const prompt = `You are a helpful assistant. Summarize this image note based on the available information in 2-3 sentences.\n\nTitle: ${note.title}\nDescription: ${note.content || 'No description provided.'}`;
//             const response = await ai.models.generateContent({
//               model: 'gemini-2.0-flash',
//               contents: prompt,
//             });
//             summary = response.text;
//           }
//         } else {
//           const prompt = `You are a helpful assistant. Summarize this note in 2-3 sentences.\n\nTitle: ${note.title}\nContent: ${note.content || 'No content.'}`;
//           const response = await ai.models.generateContent({
//             model: 'gemini-2.0-flash',
//             contents: prompt,
//           });
//           summary = response.text;
//         }
//         break;
//       }

//       case 'link': {
//         let webContent = '';
//         if (note.link_url) {
//           webContent = await fetchWebpageText(note.link_url);
//         }
//         const prompt = webContent
//           ? `You are a helpful assistant. Summarize the following webpage content that was saved as a note. Provide a concise summary in 3-5 sentences covering the main topic and key points.\n\nNote Title: ${note.title}\nURL: ${note.link_url}\n${note.content ? `User's Notes: ${note.content}\n` : ''}\nWebpage Content:\n${webContent}`
//           : `You are a helpful assistant. Summarize this link note based on the available information in 2-3 sentences.\n\nTitle: ${note.title}\nURL: ${note.link_url || 'No URL'}\nNotes: ${note.content || 'No additional notes.'}`;
//         const response = await ai.models.generateContent({
//           model: 'gemini-2.0-flash',
//           contents: prompt,
//         });
//         summary = response.text;
//         break;
//       }

//       case 'file': {
//         const prompt = `You are a helpful assistant. Summarize this file note based on the available information in 2-3 sentences.\n\nTitle: ${note.title}\nContent/Description: ${note.content || 'No description provided.'}\nFile URL: ${note.media_url || 'No file URL'}`;
//         const response = await ai.models.generateContent({
//           model: 'gemini-2.0-flash',
//           contents: prompt,
//         });
//         summary = response.text;
//         break;
//       }

//       default: {
//         const prompt = `You are a helpful assistant. Summarize this note in 2-3 sentences.\n\nTitle: ${note.title}\nContent: ${note.content || 'No content.'}`;
//         const response = await ai.models.generateContent({
//           model: 'gemini-2.0-flash',
//           contents: prompt,
//         });
//         summary = response.text;
//       }
//     }

//     res.json({ summary });
//   } catch (err) {
//     console.error('AI Summarization error:', err);
//     res.status(500).json({ message: 'Failed to generate AI summary. Please check your Gemini API key.' });
//   }
// };

// module.exports = { summarizeNote };








const { GoogleGenAI } = require('@google/genai');
const NoteModel = require('../models/noteModel');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODEL_NAME =
  process.env.GEMINI_MODEL_NAME || 'models/gemini-3-flash-preview';

// Helper: fetch webpage text content from a URL
async function fetchWebpageText(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BrainCache/1.0' }
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    // Strip HTML tags and get plain text
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // Limit to ~5000 chars to stay within token limits
    return text.substring(0, 5000);
  } catch (err) {
    console.error('Failed to fetch webpage:', err.message);
    return null;
  }
}

// Helper: fetch image as base64 from URL for Gemini Vision
async function fetchImageAsBase64(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return { base64, mimeType: contentType };
  } catch (err) {
    console.error('Failed to fetch image:', err.message);
    return null;
  }
}

const summarizeNote = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const note = await NoteModel.getById(noteId, req.user.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    let summary = '';

    switch (note.type) {
      case 'text': {
        const prompt = `You are a helpful assistant. Summarize the following note concisely in 3-5 sentences. Focus on the key points and main ideas.\n\nTitle: ${note.title}\n\nContent: ${note.content || 'No content provided.'}`;
        const response = await ai.models.generateContent({
          model:MODEL_NAME,
          contents: prompt,
        });
        summary = response.text;
        break;
      }

      case 'image': {
        if (note.media_url) {
          const imageData = await fetchImageAsBase64(note.media_url);
          if (imageData) {
            const prompt = `You are a helpful assistant. This image is saved as a note titled "${note.title}". ${note.content ? `The user also added this description: "${note.content}". ` : ''}Please provide a concise summary describing what this image contains and its key details in 3-5 sentences.`;
            const imagePart = {
              inlineData: {
                data: imageData.base64,
                mimeType: imageData.mimeType
              }
            };
            const response = await ai.models.generateContent({
              model:MODEL_NAME,
              contents: [prompt, imagePart],
            });
            summary = response.text;
          } else {
            // Fallback: summarize based on title and content only
            const prompt = `You are a helpful assistant. Summarize this image note based on the available information in 2-3 sentences.\n\nTitle: ${note.title}\nDescription: ${note.content || 'No description provided.'}`;
            const response = await ai.models.generateContent({
              model:MODEL_NAME,
              contents: prompt,
            });
            summary = response.text;
          }
        } else {
          const prompt = `You are a helpful assistant. Summarize this note in 2-3 sentences.\n\nTitle: ${note.title}\nContent: ${note.content || 'No content.'}`;
          const response = await ai.models.generateContent({
            model:MODEL_NAME,
            contents: prompt,
          });
          summary = response.text;
        }
        break;
      }

      case 'link': {
        let webContent = '';
        if (note.link_url) {
          webContent = await fetchWebpageText(note.link_url);
        }
        const prompt = webContent
          ? `You are a helpful assistant. Summarize the following webpage content that was saved as a note. Provide a concise summary in 3-5 sentences covering the main topic and key points.\n\nNote Title: ${note.title}\nURL: ${note.link_url}\n${note.content ? `User's Notes: ${note.content}\n` : ''}\nWebpage Content:\n${webContent}`
          : `You are a helpful assistant. Summarize this link note based on the available information in 2-3 sentences.\n\nTitle: ${note.title}\nURL: ${note.link_url || 'No URL'}\nNotes: ${note.content || 'No additional notes.'}`;
        const response = await ai.models.generateContent({
          model:MODEL_NAME,
          contents: prompt,
        });
        summary = response.text;
        break;
      }

      case 'file': {
        const prompt = `You are a helpful assistant. Summarize this file note based on the available information in 2-3 sentences.\n\nTitle: ${note.title}\nContent/Description: ${note.content || 'No description provided.'}\nFile URL: ${note.media_url || 'No file URL'}`;
        const response = await ai.models.generateContent({
          model:MODEL_NAME,
          contents: prompt,
        });
        summary = response.text;
        break;
      }

      default: {
        const prompt = `You are a helpful assistant. Summarize this note in 2-3 sentences.\n\nTitle: ${note.title}\nContent: ${note.content || 'No content.'}`;
        const response = await ai.models.generateContent({
          model:MODEL_NAME,
          contents: prompt,
        });
        summary = response.text;
      }
    }

    res.json({ summary });
  } catch (err) {
    console.error('AI Summarization error:', err);
    res.status(500).json({ message: 'Failed to generate AI summary. Please check your Gemini API key.' });
  }
};

module.exports = { summarizeNote };


