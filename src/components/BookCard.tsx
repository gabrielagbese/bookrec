export default function BookCard({ book }) {
    return (
        <div className="border p-4">
            <img
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                alt={book.title}
            />
            <h3>{book.title}</h3>
            <p>{book.author_name?.join(", ")}</p>
        </div>
    );
}
