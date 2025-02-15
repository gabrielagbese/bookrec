import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json(
                { error: "Missing query" },
                { status: 400 }
            );
        }

        const response = await axios.get(
            `https://openlibrary.org/search.json?q=${query}&limit=10`
        );
        return NextResponse.json(response.data);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch books" },
            { status: 500 }
        );
    }
}
