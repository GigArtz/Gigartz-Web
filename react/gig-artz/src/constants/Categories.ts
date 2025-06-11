export const categories = [
    // Music & Sound
    "DJ",
    "Live Performer / Vocalist",
    "Session Musician",
    "Sound Engineer / Tech",
    "Music Producer",
    // Event Support & Operations
    "Event Host / MC",
    "Photographer",
    "Videographer",
    "Security Personnel",
    "Usher / Hospitality Crew",
    "Stage Manager",
    // Creative Services
    "Graphic Designer (e.g. Posters, Promo Materials)",
    "Social Media Manager",
    "Content Creator / Influencer",
    "Copywriter / Press Kit Writer",
    "Motion Graphics / Editor",
    // Food & Beverage
    "Chef / Caterer",
    "Mixologist / Bartender",
    "Barista",
    "Mobile Bar / Food Truck Operator",
    // Style & Beauty
    "Make-Up Artist",
    "Hair Stylist",
    "Wardrobe Stylist",
    "Nail Technician",
    // Performance Artists
    "Dancer / Choreographer",
    "Actor / Skit Performer",
    "Poet / Spoken Word Artist",
    "Comedian",
    // Technical Services
    "Lighting Technician",
    "Sound Setup / PA Technician",
    "AV Technician",
    "Livestream Operator",
    // Business & Logistics
    "Transport Provider (e.g. Crew/Guest Shuttle)",
    "Event Planner / Coordinator",
    "Legal & Contracts Consultant",
    "Finance & Budgeting Support",
];

export const categoriesList = [
  {
    name: "Music & Sound",
    id: 0,
    items: [
      { name: "DJ", id: 1 },
      { name: "Live Performer / Vocalist", id: 2 },
      { name: "Session Musician", id: 3 },
      { name: "Sound Engineer / Tech", id: 4 },
      { name: "Music Producer", id: 5 },
    ],
  },
  {
    name: "Event Support & Operations",
    id: 10,
    items: [
      { name: "Event Host / MC", id: 11 },
      { name: "Photographer", id: 12 },
      { name: "Videographer", id: 13 },
      { name: "Security Personnel", id: 14 },
      { name: "Usher / Hospitality Crew", id: 15 },
      { name: "Stage Manager", id: 16 },
    ],
  },
  {
    name: "Creative Services",
    id: 20,
    items: [
      { name: "Graphic Designer (e.g. Posters, Promo Materials)", id: 21 },
      { name: "Social Media Manager", id: 22 },
      { name: "Content Creator / Influencer", id: 23 },
      { name: "Copywriter / Press Kit Writer", id: 24 },
      { name: "Motion Graphics / Editor", id: 25 },
    ],
  },
  {
    name: "Food & Beverage",
    id: 30,
    items: [
      { name: "Chef / Caterer", id: 31 },
      { name: "Mixologist / Bartender", id: 32 },
      { name: "Barista", id: 33 },
      { name: "Mobile Bar / Food Truck Operator", id: 34 },
    ],
  },
  {
    name: "Style & Beauty",
    id: 40,
    items: [
      { name: "Make-Up Artist", id: 41 },
      { name: "Hair Stylist", id: 42 },
      { name: "Wardrobe Stylist", id: 43 },
      { name: "Nail Technician", id: 44 },
    ],
  },
  {
    name: "Performance Artists",
    id: 50,
    items: [
      { name: "Dancer / Choreographer", id: 51 },
      { name: "Actor / Skit Performer", id: 52 },
      { name: "Poet / Spoken Word Artist", id: 53 },
      { name: "Comedian", id: 54 },
    ],
  },
  {
    name: "Technical Services",
    id: 60,
    items: [
      { name: "Lighting Technician", id: 61 },
      { name: "Sound Setup / PA Technician", id: 62 },
      { name: "AV Technician", id: 63 },
      { name: "Livestream Operator", id: 64 },
    ],
  },
  {
    name: "Business & Logistics",
    id: 70,
    items: [
      { name: "Transport Provider (e.g. Crew/Guest Shuttle)", id: 71 },
      { name: "Event Planner / Coordinator", id: 72 },
      { name: "Legal & Contracts Consultant", id: 73 },
      { name: "Finance & Budgeting Support", id: 74 },
    ],
  },
];


export const genres = [
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