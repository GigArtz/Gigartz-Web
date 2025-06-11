import React, { useState } from "react";

import { genres } from "../constants/Categories"; // Assuming genres is an array of genre objects

const GenreDropdown: React.FC = () => {
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

    const handleSelect = (id: number, parentId?: number) => {
        setSelectedGenres((prev) => {
            const newSelectedGenres = prev.includes(id)
                ? prev.filter((genreId) => genreId !== id)
                : [...prev, id];

            if (parentId !== undefined) {
                if (!newSelectedGenres.includes(parentId)) {
                    newSelectedGenres.push(parentId);
                }
            }

            return newSelectedGenres;
        });
    };

    return (
        <div className="space-y-4">
            {genres.map((genre) => (
                <div key={genre.id}>
                    <label className="block text-white">
                        <input
                            type="checkbox"
                            checked={selectedGenres.includes(genre.id)}
                            onChange={() => handleSelect(genre.id)}
                            className="mr-2"
                            disabled={genre.disabled}
                        />
                        {genre.name}
                    </label>
                    {genre.items && genre.items.length > 0 && (
                        <div className="ml-4 space-y-2">
                            {genre.items.map((item) => (
                                <label key={item.id} className="block text-white">
                                    <input
                                        type="checkbox"
                                        checked={selectedGenres.includes(item.id)}
                                        onChange={() => handleSelect(item.id, genre.id)}
                                        className="mr-2"
                                    />
                                    {item.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default GenreDropdown;
