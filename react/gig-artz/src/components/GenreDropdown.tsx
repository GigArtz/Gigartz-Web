import React, { useState } from "react";

const genres = [
    { name: "General", id: 0 },
    {
        name: "Musician",
        id: 1,
        disabled: true,
        items: [
            { name: "Vocalist", id: 100 },
            { name: "Instrumentalist", id: 101 },
            { name: "Group", id: 102 },
        ],
    },
    {
        name: "Digital creator",
        id: 2,
        disabled: true,
        items: [
            { name: "Blogger", id: 200 },
            { name: "Influencer", id: 201 },
            { name: "Producer", id: 202 },
        ],
    },
    {
        name: "Health",
        id: 3,
        disabled: true,
        items: [
            { name: "Fitness", id: 300 },
            { name: "Beauty", id: 301 },
        ],
    },
    {
        name: "Establishment",
        id: 4,
        disabled: true,
        items: [
            { name: "Restaurant", id: 400 },
            { name: "Club", id: 401 },
        ],
    },
];

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
