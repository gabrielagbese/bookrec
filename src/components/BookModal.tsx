"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Book {
    title: string;
    author: string;
    cover: string;
    why: string;
    isbn: number | null;
    first_publish_year?: number; // Optional (not all books may have this)
    subjects?: string[]; // Optional (some books may not have subjects)
    synopsis?: string; // Optional (depends on availability)
    rating?: number | "No rating"; // Added rating field, can be a number or "No rating"
}

interface BookModalProps {
    book: Book | null;
    onClose: () => void;
}

export default function BookModal({ book, onClose }: BookModalProps) {
    const [activeTab, setActiveTab] = useState("why");

    if (!book) return null;

    return (
        <Dialog open={!!book} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px] h-[95vh] lg:h-[85vh] overflow-auto p-0 flex flex-col">
                <DialogHeader className="sticky top-0 bg-white  z-10 p-2 border-b shadow-sm flex items-center justify-between flex-row w-full">
                    <DialogTitle className="text-4xl font-bold">
                        {book.title}
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 text-red-600 hover:text-red-800 "
                        onClick={onClose}
                    >
                        <X className="h-12 w-12 text-xl" />
                    </Button>
                </DialogHeader>

                <div className="grid gap-4 p-4">
                    <div className="flex sm:flex-row  items-start gap-6">
                        <div className="relative w-32 h-52 lg:w-40 lg:h-64 rounded-md overflow-hidden shadow-md sm:flex-row hcb">
                            <Image
                                src={book.cover || "/placeholder.svg"}
                                alt={book.title}
                                layout="fill"
                                objectFit="cover"
                                priority
                            />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <p className="text-xl lg:text-3xl font-semibold">
                                {book.author}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Published:{" "}
                                <span className="text-xl font-semibold text-foreground">
                                    {book.first_publish_year || "Unknown"}
                                </span>
                            </p>
                            {book.rating && (
                                <p className="text-sm text-muted-foreground">
                                    ⭐ Rating:{" "}
                                    <span className="font-semibold">
                                        {book.rating &&
                                        typeof book.rating === "number"
                                            ? book.rating.toPrecision(2)
                                            : "No rating"}
                                    </span>{" "}
                                    / 5
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {book.subjects?.map((subject, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="lg:text font-sans"
                                    >
                                        {subject}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    {book.isbn && (
                        <Button
                            variant="outline"
                            asChild
                            className="mt-2 w-full  sm:w-auto bg-yellow-400"
                        >
                            <a
                                href={`https://www.goodreads.com/book/isbn/${book.isbn}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on GoodReads
                            </a>
                        </Button>
                    )}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="why">
                                Why Recommended
                            </TabsTrigger>
                            <TabsTrigger value="synopsis">Synopsis</TabsTrigger>
                        </TabsList>
                        <TabsContent value="why" className="mt-4">
                            <p className="text ">{book.why}</p>
                        </TabsContent>
                        <TabsContent value="synopsis" className="mt-4">
                            <p className="text ">
                                {book.synopsis || "No synopsis available."}
                            </p>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
