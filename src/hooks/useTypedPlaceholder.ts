import { useState, useEffect } from 'react';

const SUGGESTIONS = [
  "Youngins",
  "The Vampire Diaries",
  "The Bluff",
  "One Piece",
  "Fatal Seduction",
  "Bel-Air",
  "Sistas",
  "The Family Business",
  "Inside Out 2",
  "Moana 2"
];

/**
 * useTypedPlaceholder
 * Simulates a typing effect for search bar placeholders to suggest content.
 */
export const useTypedPlaceholder = () => {
  const [placeholder, setPlaceholder] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = SUGGESTIONS[suggestionIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < currentFullText.length) {
          setPlaceholder(currentFullText.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setPlaceholder(currentFullText.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        } else {
          setIsDeleting(false);
          setSuggestionIndex(prev => (prev + 1) % SUGGESTIONS.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, suggestionIndex]);

  return placeholder ? `Search "${placeholder}"` : "Search movies/ TV Shows";
};
