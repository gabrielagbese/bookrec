import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    try {
        const { books } = await req.json();

        if (!books || books.length === 0) {
            return NextResponse.json(
                {
                    error: "No books provided. Please select at least one book.",
                },
                { status: 400 }
            );
        }

        const prompt = `I'd like recommendations for 6 books similar to ${books
            .map((book: any) => `"${book.title}" by ${book.author}`)
            .join(" and ")}.
          
        Please focus on books that share similar themes, writing style, character development, or overall tone. If possible, prioritize books with related contexts or narrative structures.
          
        Each recommendation should be returned in a JSON array with the following structure:
        [
          {
            "title": "Recommended Book Title",
            "author": "Author Name",
            "why": "Short explanation (max 200 words) on how it relates to the selected books."
          }
        ] 
        
        Return **only** valid JSON with no extra text.
        Treat each new prompt as a new request dont use the context of older books requested`;

        const result = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt,
        });

        console.log("🔹 Gemini API Raw Response:", result.text); // Log raw response

        if (!result || !result.text) {
            throw new Error("Empty response from AI.");
        }

        // **🛠 Fix: Remove Markdown Code Block Formatting**
        const cleanedText = result.text.replace(/```json|```/g, "").trim();

        console.log("🔹 Cleaned AI Response:", cleanedText); // Log cleaned response

        let recommendations;
        try {
            recommendations = JSON.parse(cleanedText);

            // Ensure it's an array
            if (!Array.isArray(recommendations)) {
                throw new Error(
                    "Unexpected response format. Expected an array."
                );
            }

            console.log("✅ Parsed Recommendations:", recommendations); // Log successfully parsed recommendations
        } catch (parseError) {
            console.error("❌ Error parsing AI response:", parseError);
            console.error("🔹 Raw Cleaned Response Text:", cleanedText); // Log cleaned response

            // **Return the bad response instead of throwing an error**
            return NextResponse.json(
                {
                    error: `Failed to parse AI response: ${parseError.message}`,
                    rawResponse: cleanedText, // Include the bad response in case frontend needs debugging
                },
                { status: 500 }
            );
        }

        return NextResponse.json(recommendations);
    } catch (error: any) {
        console.error("❌ Error fetching recommendations:", error);

        return NextResponse.json(
            {
                error: error.message || "Failed to fetch recommendations",
            },
            { status: 500 }
        );
    }
}
