import { useState } from "react";
import BookSearchModal from "./BookSearchModal";

interface Book {
    title: string;
    author: string;
    cover: string;
}

interface Props {
    books: Book[];
    onAddBook: (book: Book) => void;
    onRemoveBook: (index: number) => void;
}

const BookInput = ({ books, onAddBook, onRemoveBook }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex justify-center">
            <div
                className={`grid gap-6 ${
                    books.length === 0
                        ? "grid-cols-1"
                        : "grid-cols-2 md:grid-cols-3"
                }`}
            >
                {books.map((book, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center overflow-visible"
                    >
                        <div className="relative w-36 h-56 shadow-lg rounded-md hcb overflow-hidden">
                            <img
                                src={book.cover}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                            <button
                                className="absolute top-0 right-0 -translate-x-1/4 translate-y-1/4 shadow-md aspect-square bg-red-500 text-white rounded-full p-1 text-xs w-6 h-6 shadow-lg"
                                onClick={() => onRemoveBook(index)}
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm font-semibold text-center mt-2 w-36">
                            {book.title}
                        </p>
                    </div>
                ))}

                {/* Empty Input (Centered if No Books) */}
                {books.length < 6 && (
                    <div className="flex flex-col items-center">
                        <div
                            className="border-2 border-dashed border-gray-400 w-36 h-56 flex items-center justify-center cursor-pointer rounded-md shadow-lg"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <span className="text-3xl text-gray-500">+</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Add a book</p>
                    </div>
                )}

                {/* Book Search Modal */}
                {isModalOpen && (
                    <BookSearchModal
                        onAddBook={onAddBook}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default BookInput;
