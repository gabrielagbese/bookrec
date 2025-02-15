import axios from "axios";

export async function getBookDetails(title) {
    const res = await axios.get(
        `https://openlibrary.org/search.json?q=${title}&limit=1`
    );
    return res.data.docs[0];
}
