import nlp from "compromise";
import { stopWordDatasets, trendStopwordDatasets } from "../trainingDatasets";

function extractNouns(text: string): string[] {
  // Parse the text with compromise
  const doc = nlp(text);

  // Extract all nouns (both single words and multi-word phrases)
  const nouns = doc.nouns().out("array");

  // List of words to remove
  const isPronoun: any = stopWordDatasets;

  // Filter out non-nouns and remove unwanted words from multi-word phrases
  const validNouns = nouns
    .map((noun: string) => {
      // Remove words from `isPronoun` in the noun string
      const cleanedNoun = noun
        .split(" ") // Split multi-word phrases
        .filter((word) => !isPronoun.includes(word.toLowerCase())) // Remove unwanted words
        .join(" ") // Rejoin remaining words
        .trim(); // Remove extra spaces

      console.log("Cleaned noun:", cleanedNoun);
      return cleanedNoun;
    })
    .filter((noun: any) => noun.length > 1); // Ignore empty results

  return validNouns;
}

function getMostUniqueNouns(text: any) {
  const nouns = extractNouns(text);

  // Object to store the frequency of each noun
  const nounFrequency: any = {};

  // Count occurrences of each noun
  nouns.forEach((noun) => {
    const words = noun.split(" "); // Split multi-word phrases
    words.forEach((word) => {
      nounFrequency[word] = (nounFrequency[word] || 0) + 1;
    });
  });

  // Sort nouns by frequency (ascending for uniqueness)
  const sortedNouns = Object.keys(nounFrequency).sort(
    (a, b) => nounFrequency[a] - nounFrequency[b]
  );

  // Return the two least frequent (most unique) nouns
  return sortedNouns.slice(0, 3);
}

// Example usage
const text =
  "Obituary for my father. Richard Warner Carlson died at 84 on March 24, 2025 at home in Boca Grande, Florida after six weeks of illness. He refused all painkillers to the end and left this world with dignity and clarity, holding the hands of his children with his dogs at his";

const uniqueNouns = getMostUniqueNouns(text);
console.log("Most Unique Nouns:", uniqueNouns);


function getTopTrendingWords(phrases: string[], limit: number = 10): string[] {
  const wordFrequency: { [key: string]: number } = {};

    const stopwords = trendStopwordDatasets;

  phrases.forEach((phrase) => {
    // Split into words
    const words = phrase
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .split(/\s+/); // Split by whitespace

    words.forEach((word) => {
      if (word && !stopwords.has(word) && isNaN(Number(word))) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
  });

  return Object.keys(wordFrequency)
    .sort((a, b) => wordFrequency[b] - wordFrequency[a]) // Highest frequency first
    .slice(0, limit);
}

export { getMostUniqueNouns, getTopTrendingWords };
