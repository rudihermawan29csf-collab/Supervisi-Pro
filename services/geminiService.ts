
import { GoogleGenAI } from "@google/genai";
import { TeacherRecord } from "../types";

export const generateSupervisionFeedback = async (record: TeacherRecord): Promise<string> => {
  // Fix: Strictly following SDK initialization guidelines to use process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Sebagai asisten supervisor sekolah, berikan saran poin-poin observasi atau feedback yang relevan untuk guru berikut:
    Nama: ${record.namaGuru}
    Mata Pelajaran: ${record.mataPelajaran}
    Kelas: ${record.kelas || 'Belum ditentukan'}
    Jam ke: ${record.jamKe || 'Belum ditentukan'}
    
    Tujuan: Supervisi akademik untuk meningkatkan kualitas pembelajaran.
    Format jawaban: Berikan 3 poin penting saran observasi dalam bahasa Indonesia yang ringkas dan profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Correctly accessing the text property directly as per the latest SDK requirements.
    return response.text || 'Tidak ada feedback yang dihasilkan.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Gagal menghasilkan feedback otomatis.';
  }
};
