import { useState, useEffect } from "react";
import axios from "axios";

interface Book {
    title: string;
    author: string;
    cover: string;
}

interface Props {
    onAddBook: (book: Book) => void;
    onClose: () => void;
}

const BookSearchModal = ({ onAddBook, onClose }: Props) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBooks = async () => {
            if (query.length < 2) {
                setResults([]); // Clear results if query is too short
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(
                    `https://openlibrary.org/search.json?q=${encodeURIComponent(
                        query
                    )}&limit=5`
                );
                const books = response.data.docs.map((book: any) => ({
                    title: book.title,
                    author: book.author_name ? book.author_name[0] : "Unknown",
                    cover: book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : "/placeholder.jpg",
                }));
                setResults(books);
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            if (query.trim()) fetchBooks();
        }, 500); // Debounce delay

        return () => clearTimeout(debounceTimer);
    }, [query]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20">
            <div className="bg-white p-10 rounded-lg shadow-lg w-96 relative">
                {/* Close button */}
                <button
                    className="absolute top-2 right-2 text-xl"
                    onClick={onClose}
                >
                    ✖
                </button>

                {/* Input Field */}
                <input
                    type="text"
                    placeholder="Search for a book..."
                    className="border p-2 w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />

                {/* Loading Indicator */}
                {loading && (
                    <p className="text-gray-500 text-sm mt-2">Searching...</p>
                )}

                {/* Results List */}
                <ul className="mt-3 max-h-60 overflow-y-auto border-t border-gray-200">
                    {results.map((book, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-2 p-2 border-b cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                                onAddBook(book);
                                onClose(); // Close modal after selection
                            }}
                        >
                            <img
                                src={book.cover}
                                alt={book.title}
                                className="w-10 h-14 object-cover"
                            />
                            <div>
                                <p className="font-bold">{book.title}</p>
                                <p className="text-sm">{book.author}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default BookSearchModal;
