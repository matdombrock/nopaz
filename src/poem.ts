const poem = [
  "Out of the Rolling Ocean the Crowd",
  "When I Heard the Learn’d Astronomer",
  "I Sing the Body Electric",
  "I Dream’d in a Dream",
  "The Ship Starting",
  "On the Beach at Night Alone",
  "Sometimes with One I Love",
  "A Noiseless Patient Spider",
  "Beginning My Studies",
  "I Saw in Louisiana A Live-Oak Growing",
  "In Paths Untrodden",
  "As I Walk These Broad Majestic Days",
  "Crossing Brooklyn Ferry",
  "To the Garden the World",
  "A Song to Myself"
];

export default function getPoemLine(): string {
  const lineNumber = Math.floor(Math.random() * poem.length) + 1;
  if (lineNumber < 1 || lineNumber > poem.length) {
    throw new Error("Line number out of range");
  }
  return poem[lineNumber - 1] || "The quick brown fox jumps over the lazy dog.";
}
