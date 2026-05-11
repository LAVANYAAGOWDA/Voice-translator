export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text) return '';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation failed');
    const data = await response.json();
    return data[0].map((item: any) => item[0]).join('');
  } catch (error) {
    console.error('Error translating:', error);
    throw new Error('Failed to translate text. Please try again.');
  }
}
