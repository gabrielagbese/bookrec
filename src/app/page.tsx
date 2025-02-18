"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import BookInput from "@/components/BookInput";

interface Book {
    title: string;
    author: string;
    cover: string;
    why: string;
    isbn: number | null;
    first_publish_year?: number; // Optional (not all books may have this)
    subjects?: string[]; // Optional (some books may not have subjects)
    synopsis?: string; // Optional (depends on availability)
}

export default function Home() {
    const [books, setBooks] = useState<Book[]>([]);
    const [recommendations, setRecommendations] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);
    const [showMain, setShowMain] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null); // State for modal

    useEffect(() => {
        if (selectedBook) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = ""; // Cleanup on unmount
        };
    }, [selectedBook]);

    const addBook = (book: Book) => {
        setBooks([...books, book]);
    };

    const removeBook = (index: number) => {
        setBooks(books.filter((_, i) => i !== index));
    };

    const getRecommendations = async () => {
        if (books.length === 0) return alert("Please add books first.");
        setLoading(true);

        try {
            const response = await axios.post("/api/recommend", { books });
            const recommendedBooks = response.data;
            console.log("API response:", response.data);

            const fetchedBooks = await Promise.all(
                recommendedBooks.map(async (recBook: any) => {
                    const query = `${recBook.title} ${recBook.author}`;
                    const res = await axios.get(
                        `https://openlibrary.org/search.json?q=${encodeURIComponent(
                            query
                        )}&limit=1`
                    );

                    console.log("OpenLibrary search response:", res.data);

                    const book = res.data.docs?.[0] || {};

                    let synopsis = "No synopsis available.";
                    let themes: string[] = ["N/A"];
                    let isbn: string | null = null;

                    if (book.key) {
                        try {
                            // Get work details
                            const workRes = await axios.get(
                                `https://openlibrary.org${book.key}.json`
                            );
                            console.log(
                                "OpenLibrary work response:",
                                workRes.data
                            );

                            // Get editions for ISBN
                            const editionsRes = await axios.get(
                                `https://openlibrary.org${book.key}/editions.json?limit=1&languages=eng`
                            );
                            console.log(
                                "OpenLibrary editions response:",
                                editionsRes.data
                            );

                            // Try to get ISBN-13 first, fall back to ISBN-10
                            const firstEdition = editionsRes.data.entries[0];
                            if (firstEdition) {
                                isbn =
                                    firstEdition.isbn_13?.[0] ||
                                    firstEdition.isbn_10?.[0] ||
                                    null;
                                console.log(
                                    `Found ISBN for ${book.title}:`,
                                    isbn
                                );
                            }

                            synopsis = workRes.data.description
                                ? typeof workRes.data.description === "string"
                                    ? workRes.data.description
                                    : workRes.data.description.value
                                : "No synopsis available.";

                            themes = workRes.data.subjects ||
                                workRes.data.subject_places ||
                                workRes.data.subject_people ||
                                workRes.data.subject_times || ["N/A"];
                        } catch (error) {
                            console.warn("Error fetching work details:", error);
                        }
                    }

                    return {
                        title: book.title || recBook.title,
                        author: book.author_name
                            ? book.author_name[0]
                            : recBook.author || "Unknown",
                        cover: book.cover_i
                            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                            : "/placeholder.jpg",
                        why: recBook.why,
                        first_publish_year:
                            book.first_publish_year || "Unknown",
                        themes: themes.slice(0, 5),
                        synopsis: synopsis,
                        isbn: isbn,
                    };
                })
            );

            setRecommendations(fetchedBooks);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!showMain) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center p-6">
                <h1 className="text-4xl font-bold mb-4">BookRec</h1>
                <p className="max-w-md mb-6">
                    Discover books similar to your favorites. Input books, get
                    recommendations.
                </p>
                <p className="text-sm mb-4">Developed by Gabriel Agbese</p>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    onClick={() => setShowMain(true)}
                >
                    Enter
                </button>
            </div>
        );
    }

    return (
        <main className="p-6 md:p-12 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Book Recommendation App
            </h1>

            {/* Keep Book Input Vertical */}
            <div className="flex flex-col items-center space-y-4">
                <BookInput
                    books={books}
                    onAddBook={addBook}
                    onRemoveBook={removeBook}
                />

                <button
                    className="bg-green-500 text-white px-4 py-2 mt-4"
                    onClick={getRecommendations}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Get Recommendations"}
                </button>
            </div>

            {recommendations.length > 0 && (
                <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-4">
                        Recommended Books:
                    </h2>
                    <div className="space-y-16">
                        <div className="flex flex-col gap-16">
                            {/* Mobile View */}
                            <div className="md:hidden flex flex-col gap-16">
                                {recommendations.map((book, index) => (
                                    <div
                                        key={index}
                                        className="relative"
                                        onClick={() => setSelectedBook(book)}
                                    >
                                        <div className="flex items-center gap-4 mx-12">
                                            <div className="w-28 h-44 rounded-md shadow-md z-10 hardcover-book">
                                                <img
                                                    src={book.cover}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <p className="text-lg font-bold">
                                                    {book.title}
                                                </p>
                                                <p className="text-gray-600 text-xs">
                                                    {book.author}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Mobile Shelf */}
                                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-full -mt-4 shadow-md shelf-shadow">
                                            <div
                                                className="w-full h-3 bg-yellow-700/30"
                                                style={{
                                                    clipPath:
                                                        "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
                                                }}
                                            ></div>
                                            <div className="w-full h-4 bg-yellow-600/30 shadow-lg"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:flex md:flex-col gap-16">
                                {Array.from(
                                    {
                                        length: Math.ceil(
                                            recommendations.length / 2
                                        ),
                                    },
                                    (_, i) => {
                                        const pairBooks = recommendations.slice(
                                            i * 2,
                                            i * 2 + 2
                                        );
                                        return (
                                            <div key={i} className="relative">
                                                <div className="flex justify-evenly lg:mx-20">
                                                    {pairBooks.map(
                                                        (book, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-4 lg:w-1/2 sm:w-[100vw]"
                                                                onClick={() =>
                                                                    setSelectedBook(
                                                                        book
                                                                    )
                                                                }
                                                            >
                                                                <div className="w-32 h-48 rounded-md shadow-md aspect-2/3 hardcover-book z-10">
                                                                    <img
                                                                        src={
                                                                            book.cover
                                                                        }
                                                                        alt={
                                                                            book.title
                                                                        }
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col flex-1">
                                                                    <p className="font-bold">
                                                                        {
                                                                            book.title
                                                                        }
                                                                    </p>
                                                                    <p className="text-gray-600">
                                                                        {
                                                                            book.author
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                                {/* Desktop Shelf */}
                                                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-11/12 ">
                                                    <div
                                                        className="w-full h-4 bg-yellow-700/30"
                                                        style={{
                                                            clipPath:
                                                                "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
                                                        }}
                                                    ></div>
                                                    <div className="w-full h-3 bg-yellow-600/30 shadow-lg"></div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for selected book */}
            {selectedBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20 ">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg h-[90vh] overflow-auto">
                        {/* Close Button */}
                        <button
                            className="absolute top-10 right-6 text-white font-bold bg-black hover:text-gray-800"
                            onClick={() => setSelectedBook(null)}
                        >
                            Close ✖
                        </button>

                        {/* Book Cover & Details */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Book Cover */}
                            <img
                                src={selectedBook.cover}
                                alt={selectedBook.title}
                                className="w-32 h-48 object-cover rounded shadow-md"
                            />

                            {/* Book Info */}
                            <div className="text-left">
                                <h2 className="text-xl font-bold">
                                    {selectedBook.title}
                                </h2>
                                <p className="text-gray-600 mb-2">
                                    {selectedBook.author}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Published:</strong>{" "}
                                    {selectedBook.first_publish_year ||
                                        "Unknown"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Genres:</strong>{" "}
                                    {selectedBook.subjects?.join(", ") || "N/A"}
                                </p>
                                {/* View on GoodReads Button */}
                                {selectedBook.isbn && (
                                    <a
                                        href={`https://www.goodreads.com/book/isbn/${selectedBook.isbn}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        View on GoodReads
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Reason for Recommendation */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">
                                Why Recommended:
                            </h3>
                            <p className="text-gray-700">{selectedBook.why}</p>
                        </div>

                        {/* Book Synopsis */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">Synopsis:</h3>
                            <p className="text-gray-700">
                                {selectedBook.synopsis ||
                                    "No synopsis available."}
                            </p>
                        </div>

                        {/* Close Button */}
                    </div>
                </div>
            )}
        </main>
    );
}
