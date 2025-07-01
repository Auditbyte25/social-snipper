// import axios from "axios";

// // Twitter API setup
// // const BEARER_TOKEN =
// //   "AAAAAAAAAAAAAAAAAAAAANGizwEAAAAAPY7RSUme9P1MKvA%2B3anholZMw%2BA%3DDR4Sc4pSzffypitU42pQbTSbYphZo43YFe6YExDy03jmenn5jt";

// const BEARER_TOKEN =
//   "AAAAAAAAAAAAAAAAAAAAACXCzwEAAAAAAOAQLHlQSSM2rXdhRYhqa94JHLs%3Dbgx1c6wuIJdkpcxqGo7xAx9EiYKhBjDWe1gQdQdZplEulgPXIn";

// const SEARCH_URL = "https://api.twitter.com/2/tweets/search/recent";

// const QUERY =
//   '("new token launch" OR "new crypto gem" OR "#Crypto" OR "#memecoins" OR "#Memes" OR "solana meme coin") has:links -is:retweet lang:en';

// // Regex pattern for meme tokens
// const TOKEN_REGEX = /\$[A-Z0-9]{2,10}|\b[A-Z0-9]{2,10}\b/;

// // Types
// interface User {
//   id: string;
//   verified: boolean;
//   public_metrics: {
//     followers_count: number;
//   };
// }

// interface Tweet {
//   id: string;
//   text: string;
//   author_id: string;
//   public_metrics: {
//     like_count: number;
//     retweet_count: number;
//     reply_count: number;
//   };
// }

// // Fetch tweets
// async function fetchMemeTokenTweets(): Promise<void> {
//   try {
//     const response = await axios.get(
//       `${SEARCH_URL}?query=${encodeURIComponent(
//         QUERY
//       )}&tweet.fields=public_metrics,author_id,created_at&expansions=author_id&user.fields=verified,public_metrics`,
//       {
//         headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
//       }
//     );

//     const users: User[] = response.data.includes.users;
//     const highProfileUsers = users.filter(
//       (user) => user.verified || user.public_metrics.followers_count >= 100000
//     );

//     const tweets: Tweet[] = response.data.data.filter((tweet: Tweet) =>
//       highProfileUsers.some((user) => user.id === tweet.author_id)
//     );

//     tweets.forEach((tweet) => {
//       const tokenMatches = tweet.text.match(TOKEN_REGEX);
//       if (tokenMatches) {
//         const tokenName = tokenMatches[0];
//         const engagementScore = calculateEngagementScore(
//           tweet,
//           highProfileUsers
//         );
//         console.log(
//           `Token: ${tokenName} | Score: ${engagementScore.toFixed(2)}`
//         );
//       }
//     });
//   } catch (error: any) {
//     console.error(
//       "Error fetching tweets:",
//       error.response?.data || error.message
//     );
//   }
// }

// // Engagement Score Calculation
// function calculateEngagementScore(tweet: Tweet, users: User[]): number {
//   const user = users.find((user) => user.id === tweet.author_id);
//   if (!user) return 0;

//   const followers = user.public_metrics.followers_count;
//   const { like_count, retweet_count, reply_count } = tweet.public_metrics;

//   const score =
//     ((like_count * 1 + retweet_count * 2 + reply_count * 3) / followers) * 100;
//   return score;
// }

// // Run the function
// fetchMemeTokenTweets();










function getTopTrendingWords(phrases: string[], limit: number = 10): string[] {
  const wordFrequency: { [key: string]: number } = {};

  const stopwords = new Set([
    "the",
    "in",
    "a",
    "of",
    "and",
    "to",
    "is",
    "on",
    "for",
    "it",
    "this",
    "his",
    "her",
    "with",
    "you",
    "your",
    "that",
    "at",
    "from",
    "by",
    "be",
    "as",
    "was",
    "were",
    "an",
    "or",
    "we",
    "our",
    "their",
    "they",
    "them",
    "us",
    "not",
    "but",
    "so",
    "if",
    "then",
    "are",
    "i",
    "he",
    "she",
    "its",
    "me",
    "my",
    "mine",
    "just",
    "do",
    "does",
    "did",
    "will",
    "would",
    "can",
    "could",
    "should",
  ]);

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


// Sample Input
const wordsList = [
  "15",
  "Paul",
  "(36)",
  "counts",
  "Tesla",
  "dealership",
  "in",
  "Las",
  "Vegas.",
  "pro-Palestine",
  "communist.",
  "Kim",
  "a",
  "Karen",
  "Washington",
  "55-year-old",
  "millionaire",
  "Kamelia",
  "Enzler,",
  "Daily",
  "Mail.",
  "footage",
  "@choeshow,",
  "her",
  "car",
  "Tesla.",
  "DocuSign",
  "engineer",
  "Jeff",
  "Enzler.",
  "fitness",
  "company",
  "IPEAK",
  "Fitness,",
  "public",
  "records.",
  "lives",
  "$1.5M",
  "home",
  "Seattle.",
  "charges",
  "of",
  "Malicious",
  "Mischief",
  "Third",
  "Degree.",
  "couple",
  "The",
  "the",
  "Enzler",
  "26",
  "this",
  "word",
  "Greg",
  "“Governor",
  "Hot",
  "Wheels”",
  "your",
  "lack",
  "character.",
  "A",
  "tree",
  "years",
  "old",
  "—",
  "waist",
  "His",
  "loving",
  "wife",
  "his",
  "side",
  "&",
  "lovely",
  "adopted",
  "daughter.",
  "democrat",
  "party,",
  "nothing",
  "democrats.",
  "Jasmine",
  "Crockett",
  "Abbott",
  "It’s",
  "arm",
  "DNC",
  "2",
  "@elonmusk",
  "@Grummz",
  "@Ubisoft",
  "Is",
  "guy",
  "playing",
  "Path",
  "Exile",
  "account",
  "you?",
  "29",
  "#cPenNetwork",
  "community,",
  "✅",
];

// Get Top 10 Trending Words
console.log(getTopTrendingWords(wordsList, 10));

export {getTopTrendingWords}