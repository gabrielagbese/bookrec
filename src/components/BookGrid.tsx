"use client";
import { useState } from "react";
import BookInput from "./BookInput";
import BookCard from "./BookCard";

export default function BookGrid() {
    const [books, setBooks] = useState([]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {books.map((book, index) => (
                <BookCard key={index} book={book} />
            ))}
            <BookInput onAddBook={(book) => setBooks([...books, book])} />
        </div>
    );
}
