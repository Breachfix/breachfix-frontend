import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

const BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther",
  "Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations",
  "Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah",
  "Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon",
  "Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
];

interface BooksSidebarProps {
  mobile?: boolean;
  onSelectBook?: (book: string) => void;
  currentBook?: string;
  selectedBookNumber?: number;
  onBookChange?: (bookNumber: number) => void;
}

export const BooksSidebar: React.FC<BooksSidebarProps> = ({ 
  mobile, 
  onSelectBook, 
  selectedBookNumber,
  onBookChange 
}) => {
  const [q, setQ] = useState("");

  const books = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? BOOKS.filter(b => b.toLowerCase().includes(needle))
      : BOOKS;
  }, [q]);

  const handleBookClick = (bookName: string, index: number) => {
    if (onBookChange) {
      onBookChange(index + 1); // Book numbers start from 1
    }
    if (onSelectBook) {
      onSelectBook(bookName);
    }
  };

  const List = (
    <ul className="mt-3 space-y-1">
      {books.map((bookName, index) => {
        const bookNumber = index + 1;
        const active = selectedBookNumber === bookNumber;
        
        return (
          <li key={bookName}>
            <motion.button
              type="button"
              onClick={() => handleBookClick(bookName, index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={[
                "w-full text-left rounded-md px-2 py-1.5 transition-all duration-200 text-xs",
                active
                  ? "bg-breachfix-gold text-breachfix-navy font-semibold shadow-sm"
                  : "text-breachfix-white hover:bg-breachfix-emerald hover:bg-opacity-20 hover:text-breachfix-emerald"
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {bookName}
            </motion.button>
          </li>
        );
      })}
    </ul>
  );

  if (mobile) {
    return (
      <details className="rounded-xl border border-breachfix-gold/20 bg-breachfix-navy/50 backdrop-blur-sm">
        <summary className="cursor-pointer px-4 py-3 font-semibold text-breachfix-white flex items-center justify-between">
          <span>Books</span>
          <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-4 pb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter books…"
            className="mt-2 w-full rounded-md border border-breachfix-gold/30 bg-breachfix-navy/50 text-breachfix-white px-3 py-2 placeholder-breachfix-gray focus:border-breachfix-gold focus:ring-2 focus:ring-breachfix-gold/20"
          />
          {List}
        </div>
      </details>
    );
  }

  return (
    <div className="w-40">
      <h2 className="text-body-sm font-bold text-breachfix-white mb-3">Books</h2>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter books…"
        className="mb-3 w-full rounded-md border border-breachfix-gold/30 bg-breachfix-navy/50 text-breachfix-white px-3 py-2 text-caption placeholder-breachfix-gray focus:border-breachfix-gold focus:ring-2 focus:ring-breachfix-gold/20"
        aria-label="Filter books"
      />
      {List}
    </div>
  );
};
