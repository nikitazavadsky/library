export const trimDescription = (description: string, wordCount: number) => {
  const trimmedDescription = description
    .split(" ")
    .slice(0, wordCount)
    .join(" ");
  return trimmedDescription.length < description.length
    ? `${trimmedDescription}...`
    : trimmedDescription;
};
