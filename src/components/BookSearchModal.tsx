import { useState } from "react";
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

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const response = await axios.get(
                `https://openlibrary.org/search.json?q=${query}&limit=5`
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

    // ✅ Function to handle book selection and close modal
    const handleSelectBook = (book: Book) => {
        onAddBook(book);
        onClose(); // Close modal after selecting book
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                {/* ✅ Close button */}
                <button
                    className="absolute top-2 right-2 text-xl"
                    onClick={onClose}
                >
                    ✖
                </button>

                <input
                    type="text"
                    placeholder="Search for a book..."
                    className="border p-2 w-full"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 mt-2"
                    onClick={handleSearch}
                >
                    Search
                </button>

                {loading && <p>Loading...</p>}
                <ul>
                    {results.map((book, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-2 p-2 border-b cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSelectBook(book)} // ✅ Close modal when book is selected
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
