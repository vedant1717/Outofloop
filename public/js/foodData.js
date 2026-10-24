// Multicategory Game Dataset for Out of the Loop
// Categories: Indian Cuisine, Animals, Indian Places

const GAME_CATEGORIES = {
  INDIAN_CUISINE: {
    id: "INDIAN_CUISINE",
    label: "🍲 Indian Cuisine",
    badge: "INDIAN FOOD",
    items: [
      {
        name: "Biryani",
        description: "Fragrant rice dish layered with marinated meat or vegetables, saffron, ghee, and whole aromatic spices",
        category: "Main Dish / Rice",
        related: {
          name: "Veg Pulao",
          description: "Fragrant rice dish cooked with mild whole spices, green peas, carrots, and ghee in a light seasoned broth"
        }
      },
      {
        name: "Butter Chicken (Murgh Makhani)",
        description: "Tender grilled chicken simmered in a rich, velvety tomato, cream, and butter gravy",
        category: "North Indian Curry",
        related: {
          name: "Chicken Tikka Masala",
          description: "Roasted spiced chicken chunks simmered in a creamy, orange-hued spicy tomato gravy"
        }
      },
      {
        name: "Masala Dosa",
        description: "Crispy fermented rice and lentil crepe stuffed with spiced potato filling, served with sambar and coconut chutney",
        category: "South Indian / Tiffin",
        related: {
          name: "Uttapam",
          description: "Thick fermented rice pancake topped with chopped onions, tomatoes, green chilies, and coriander"
        }
      },
      {
        name: "Pani Puri (Golgappa)",
        description: "Crispy hollow fried flour balls filled with spiced potatoes, chickpeas, and chilled tangy tamarind water",
        category: "Street Food / Chaat",
        related: {
          name: "Sev Puri",
          description: "Flat crispy puris topped with mashed potatoes, onions, chutneys, and a generous layer of fine crispy sev"
        }
      },
      {
        name: "Chole Bhature",
        description: "Spicy chickpea curry paired with deep-fried puffy bread, served with pickled onions and green chilies",
        category: "North Indian Street Food",
        related: {
          name: "Puri Bhaji",
          description: "Deep-fried golden wheat puris served with a mild yellow potato curry seasoned with mustard seeds"
        }
      },
      {
        name: "Paneer Tikka",
        description: "Marinated cottage cheese cubes grilled with onions and bell peppers in a tandoor clay oven",
        category: "Starter / Tandoori",
        related: {
          name: "Tandoori Chicken",
          description: "Bone-in chicken marinated in yogurt and red tandoori spices roasted over charcoal in a clay oven"
        }
      },
      {
        name: "Pav Bhaji",
        description: "Thick mashed vegetable curry cooked on a flat tawa with butter, served with toasted soft bun rolls",
        category: "Street Food / Mumbai",
        related: {
          name: "Misal Pav",
          description: "Fiery sprouted bean curry topped with crunchy farsan mix, chopped onions, and buttered pav buns"
        }
      },
      {
        name: "Gulab Jamun",
        description: "Soft milk-solid dough balls fried until golden brown and soaked in warm rose and cardamom syrup",
        category: "Desserts / Sweets",
        related: {
          name: "Rasgulla",
          description: "Spongy chhena cottage cheese balls cooked in light, sweet cardamom sugar syrup"
        }
      },
      {
        name: "Samosa",
        description: "Crispy fried pastry cone stuffed with spiced potatoes, green peas, and served with mint chutney",
        category: "Snack / Street Food",
        related: {
          name: "Kachori",
          description: "Deep-fried round golden pastry stuffed with spiced lentils or onions, served with sweet tamarind chutney"
        }
      },
      {
        name: "Dal Makhani",
        description: "Slow-cooked black lentils and kidney beans simmered overnight with cream, butter, and mild spices",
        category: "Punjabi Curry",
        related: {
          name: "Dal Tadka",
          description: "Yellow lentils tempered with ghee, cumin seeds, garlic, dried red chilies, and fresh coriander"
        }
      },
      {
        name: "Rajma Chawal",
        description: "Comfort dish of red kidney beans stewed in thick onion-tomato gravy served over steamed basmati rice",
        category: "Comfort Food",
        related: {
          name: "Kadhi Pakora",
          description: "Tangy yogurt and gram flour gravy cooked with fried onion fritters, served over hot steamed rice"
        }
      },
      {
        name: "Idli Sambar",
        description: "Steamed fluffy cakes made from fermented rice-lentil batter served with hot lentil vegetable stew",
        category: "South Indian Breakfast",
        related: {
          name: "Medu Vada",
          description: "Crispy donut-shaped fried lentil fritters spiced with peppercorns, served with sambar and coconut chutney"
        }
      },
      {
        name: "Vada Pav",
        description: "Spiced deep-fried potato patty sandwiched inside a soft bun with garlic dry chutney and green chili",
        category: "Mumbai Street Food",
        related: {
          name: "Dabeli",
          description: "Spiced potato mixture stuffed in a bun topped with sweet chutney, pomegranate seeds, and roasted peanuts"
        }
      },
      {
        name: "Rogan Josh",
        description: "Kashmiri curry made with tender lamb slow-cooked with alkanet root, yogurt, and Kashmiri red chilies",
        category: "Kashmiri Cuisine",
        related: {
          name: "Mutton Korma",
          description: "Rich mutton stew slow-cooked with fried onions, nuts, yogurt, and aromatic whole spices"
        }
      },
      {
        name: "Jalebi",
        description: "Crispy pretzel-shaped spiral funnel cake fried and soaked in warm saffron sugar syrup",
        category: "Sweets / Street Food",
        related: {
          name: "Imarti",
          description: "Flower-shaped crispy fried urad dal batter spirals soaked in thick cardamom sugar syrup"
        }
      },
      {
        name: "Dhokla",
        description: "Steamed spongy savory cake made from fermented gram flour batter tempered with mustard seeds and curry leaves",
        category: "Gujarati Tiffin",
        related: {
          name: "Khandvi",
          description: "Soft rolled layers made from cooked gram flour and buttermilk, tempered with mustard seeds and coconut"
        }
      },
      {
        name: "Palak Paneer",
        description: "Cottage cheese cubes simmered in a smooth, vibrant green spinach gravy seasoned with garlic and spices",
        category: "North Indian Curry",
        related: {
          name: "Paneer Butter Masala",
          description: "Soft paneer cubes cooked in a sweet and mildly spicy tomato, cashew, and cream sauce"
        }
      },
      {
        name: "Momos",
        description: "Himalayan steamed flour dumplings filled with seasoned vegetables or chicken, served with spicy red chutney",
        category: "Popular Street Snack",
        related: {
          name: "Spring Rolls",
          description: "Crispy deep-fried rolled wrappers filled with shredded vegetables, noodles, and soy seasoning"
        }
      },
      {
        name: "Malai Kofta",
        description: "Deep-fried potato and paneer balls served in a rich, creamy cashew and onion gravy",
        category: "Royal Veg Curry",
        related: {
          name: "Shahi Paneer",
          description: "Royal paneer dish cooked in a rich, sweet cashew nut and cream sauce with saffron and cardamom"
        }
      },
      {
        name: "Kulfi Falooda",
        description: "Traditional dense frozen Indian ice cream served with falooda vermicelli, rose syrup, and basil seeds",
        category: "Cold Dessert",
        related: {
          name: "Rabri Jalebi",
          description: "Crispy hot sugar-soaked jalebis served topped with thick, creamy condensed milk"
        }
      }
    ],
    questions: {
      EASY: [
        "Is this dish usually eaten with your hands or with cutlery?",
        "Is this food served hot, warm, room temperature, or chilled?",
        "Is this dish considered a main meal, a side snack, or a sweet dessert?",
        "Does this food feature rice, wheat bread (roti/naan/pav), or fried batter?",
        "Is this dish spicy, sweet, tangy, or mild in flavor?",
        "Would you eat this dish for breakfast, lunch, or a late-night craving?",
        "Is paneer, chicken, or vegetables a primary ingredient in this dish?",
        "Do people usually order this at street stalls or formal wedding buffets?",
        "Does this dish involve gravy or is it dry/fried?",
        "Is this food served in a thali or on a banana leaf?",
        "How often do you eat this food in a typical month?",
        "Is this food something kids love to eat at birthday parties?",
        "Is this food considered heavy and filling, or light and easy to digest?",
        "Is this dish crispy, soft, spongy, or liquidy?",
        "Would you eat this food while traveling on a long train journey?"
      ],
      MEDIUM: [
        "Is coconut, curd, or ghee a prominent ingredient in preparing this dish?",
        "Is this dish closely associated with North India, South India, West India, or East India?",
        "What chutney, sauce, or beverage pairs best with this dish?",
        "How messy is it to eat this food while wearing festive white clothes?",
        "Does preparing this dish require deep frying, steaming, or tandoor roasting?",
        "Is this food commonly eaten during festivals like Diwali, Eid, or Holi?",
        "Would you recommend this food to someone who cannot tolerate spicy chili?",
        "Does this food smell strongly of coriander, cumin, saffron, or garlic?",
        "If you were cooking this at home, how long would it take to prepare?",
        "Is yogurt (dahi) or curd used in preparing or serving this dish?"
      ],
      HARD: [
        "Which specific aromatic spice (e.g. cardamom, mustard seeds, saffron, star anise) defines the aroma of this dish?",
        "Does authentic preparation of this dish involve fermentation or overnight slow-cooking?",
        "Which specific Indian state or city claims the historical origin of this recipe?",
        "Is this dish traditionally cooked in a handi, tawa, tandoor clay oven, or steamer?",
        "If a chef forgot to add salt vs turmeric to this dish, which error would ruin it faster?",
        "What drink (e.g., Masala Chai, Sweet Lassi, Sol Kadhi, Filter Coffee) is the quintessential pairing for this food?",
        "Is this dish more popular during cold winter months or rainy monsoons?"
      ],
      EXPERT: [
        "What exact culinary technique (e.g., Dhungar smoke, Dum cooking, Tempering/Tadka, Fermentation) gives this dish its distinct character?",
        "If you had to recreate this dish from scratch, what single raw base ingredient must be prepared first?",
        "In a high-end luxury Indian restaurant, how would a chef modernise the plating of this traditional item?",
        "What common variation or fusion version of this dish has become popular among street vendors recently?",
        "If an imposter mistook this dish for a similar dish from the same region, what key ingredient difference would expose them?"
      ]
    }
  },

  ANIMALS: {
    id: "ANIMALS",
    label: "🐅 Animals",
    badge: "WILDLIFE & ANIMALS",
    items: [
      {
        name: "Bengal Tiger",
        description: "Apex predator wild feline with orange coat and black vertical stripes, native to Indian forests",
        category: "Big Cat / Carnivore",
        related: {
          name: "Leopard",
          description: "Agile spotted wild big cat known for climbing trees and stealth hunting in Indian jungles"
        }
      },
      {
        name: "Indian Elephant",
        description: "Majestic large land mammal with large ears, trunk, and tusks, venerated in Indian culture",
        category: "Large Mammal / Herbivore",
        related: {
          name: "Indian Rhinoceros",
          description: "Huge thick-skinned land mammal with a single prominent horn on its snout, native to Kaziranga"
        }
      },
      {
        name: "King Cobra",
        description: "Longest venomous snake in the world capable of expanding a wide neck hood when threatened",
        category: "Reptile / Venomous",
        related: {
          name: "Indian Python",
          description: "Large non-venomous constrictor snake with brown patterned scales that squeezes its prey"
        }
      },
      {
        name: "Peacock (Indian Peafowl)",
        description: "National bird of India famous for its iridescent blue neck and spectacular fan-shaped tail feathers",
        category: "Bird / National Animal",
        related: {
          name: "Flamingo",
          description: "Tall wading bird with bright pink feathers, long slender legs, and downward-curved beak"
        }
      },
      {
        name: "Snow Leopard",
        description: "Elusive solitary big cat with thick smoky-gray fur and dark rosettes, inhabiting the Himalayas",
        category: "Himalayan Wildlife",
        related: {
          name: "Himalayan Brown Bear",
          description: "Large omnivorous brown fur bear found in the high altitude meadows of Northern India"
        }
      },
      {
        name: "Sloth Bear",
        description: "Shaggy black fur bear with a cream V-chest mark, specialized in eating termites and honey",
        category: "Forest Mammal",
        related: {
          name: "Black Panther",
          description: "Melanistic big cat with shiny black fur and dark spots visible under sunlight"
        }
      },
      {
        name: "Gharial Crocodile",
        description: "Critically endangered freshwater crocodilian with an elongated thin snout used for catching fish",
        category: "Reptile / Aquatic",
        related: {
          name: "Mugger Crocodile",
          description: "Broad-snouted freshwater crocodile inhabiting Indian rivers, lakes, and marshes"
        }
      },
      {
        name: "Red Panda",
        description: "Small arboreal mammal with reddish-brown fur, ringed bushy tail, and bamboo diet in Northeast India",
        category: "Arboreal Mammal",
        related: {
          name: "Giant Squirrel (Malabar)",
          description: "Large colorful tree squirrel with multi-toned maroon, purple, and beige fur native to Western Ghats"
        }
      },
      {
        name: "Lion-tailed Macaque",
        description: "Old world monkey with silver-white mane surrounding its face and tufted tail, endemic to Western Ghats",
        category: "Primate",
        related: {
          name: "Hanuman Langur",
          description: "Gray fur monkey with black face and long tail, common around Indian temples and forests"
        }
      },
      {
        name: "Gangetic River Dolphin",
        description: "National aquatic animal of India, blind freshwater dolphin living in Ganges-Brahmaputra rivers",
        category: "Aquatic Mammal",
        related: {
          name: "Dugong (Sea Cow)",
          description: "Marine herbivorous mammal that grazes on underwater seagrass meadows along Indian coasts"
        }
      },
      {
        name: "Indian Bison (Gaur)",
        description: "Largest wild bovine species with massive muscular build, dark brown body, and white socked legs",
        category: "Bovine / Herbivore",
        related: {
          name: "Wild Water Buffalo",
          description: "Massive wild bovine with huge sweeping crescent horns inhabiting wet grasslands in Assam"
        }
      },
      {
        name: "Great Indian Bustard",
        description: "Critically endangered tall ground-dwelling bird with long neck and brownish body inhabiting dry plains",
        category: "Bird / Grassland",
        related: {
          name: "Sarus Crane",
          description: "Tallest flying bird in the world with gray body and bright red bare head, found in Indian wetlands"
        }
      },
      {
        name: "Chital (Spotted Deer)",
        description: "Graceful deer with golden-brown coat covered in permanent white spots, common prey for big cats",
        category: "Deer / Herbivore",
        related: {
          name: "Sambar Deer",
          description: "Large dark brown deer with thick rugged antlers, preferring dense forested hill slopes"
        }
      },
      {
        name: "Indian Flying Fox",
        description: "Large fruit-eating megabat with golden brown head fur and huge wingspan seen roosting on tall trees",
        category: "Bat / Mammal",
        related: {
          name: "Barn Owl",
          description: "Nocturnal raptor with heart-shaped white face and silent flight used for hunting rodents"
        }
      },
      {
        name: "Indian Wolf",
        description: "Slender grayish brown predator adapted to arid grasslands and scrub forests, hunting in small packs",
        category: "Canine / Carnivore",
        related: {
          name: "Golden Jackal",
          description: "Scavenging small canine with yellowish-brown coat, active at dusk and night in rural areas"
        }
      }
    ],
    questions: {
      EASY: [
        "Does this animal live on land, in water, or in trees?",
        "Is this animal a carnivore (meat-eater), herbivore (plant-eater), or omnivore?",
        "Is this animal significantly larger than a domestic dog?",
        "Is this animal known for being dangerous or aggressive to humans in the wild?",
        "Could a person safely keep this animal as a domestic pet at home?",
        "Does this animal have fur, feathers, scales, or thick leathery skin?",
        "Is this animal active primarily during the daytime or nighttime?",
        "Does this animal fly in the air, swim in rivers/oceans, or walk on legs?",
        "Have you ever seen this animal in real life at a zoo or national park?",
        "Does this animal have stripes, spots, or a solid plain color coat?",
        "Is this animal featured prominently in Indian mythology, cartoons, or fables?",
        "Does this animal live in herds/packs or is it a solitary creature?",
        "Does this animal make a loud roar, trumpet, hiss, or screech sound?",
        "Would you see this animal roaming freely in an Indian jungle or national park?",
        "Is this animal an official state or national symbol in India?"
      ],
      MEDIUM: [
        "In which specific habitat (e.g. dense jungle, snowy mountains, rivers, desert drylands) does this animal thrive?",
        "Is this animal protected under strict wildlife conservation laws in India?",
        "What is the primary food or prey this animal searches for every day?",
        "Does this animal have horns, antlers, tusks, claws, or sharp fangs?",
        "How fast or agile is this animal when escaping or chasing prey?",
        "Does this animal build nests, live in burrows/caves, or rest under open trees?",
        "Is this animal threatened by habitat loss or poaching?",
        "What color combination best describes the appearance of this animal?",
        "Does this animal migrate across regions depending on the season?",
        "Is this animal revered or worshipped in certain religious traditions in India?"
      ],
      HARD: [
        "In which famous Indian National Park (e.g., Jim Corbett, Kaziranga, Ranthambore, Sundarbans) is this animal a prime star attraction?",
        "What specialized physical adaptation (e.g., camouflaged fur, echolocation, prehensile tail, hooded neck) helps this animal survive?",
        "If you encountered this animal face-to-face in the jungle without a jeep, what would be the safest human reaction?",
        "Does this animal give birth to live young (mammal) or lay eggs?",
        "How does this animal communicate warnings or mark its territory to rivals?",
        "Is this species endemic strictly to India or found across other continents as well?",
        "What natural predator (if any) sits above this animal in the food chain?"
      ],
      EXPERT: [
        "What IUCN Red List conservation status (e.g., Critically Endangered, Vulnerable, Least Concern) applies to this species?",
        "If an imposter mistook this animal for a closely related species in the same family, what distinct physical feature would betray their error?",
        "What key role does this animal play in maintaining the ecological balance of its native forest ecosystem?",
        "What historical conservation initiative (e.g., Project Tiger, Project Elephant) was launched specifically to protect this animal?",
        "If you were photographing this animal in the wild, at what time of day and in what specific terrain feature would you have the highest chance of sighting it?"
      ]
    }
  },

  INDIAN_PLACES: {
    id: "INDIAN_PLACES",
    label: "🏰 Indian Places",
    badge: "TOURISM & LANDMARKS",
    items: [
      {
        name: "Taj Mahal (Agra)",
        description: "Ivory-white marble mausoleum on the south bank of the Yamuna River, one of the Seven Wonders of the World",
        category: "Historical Wonder",
        related: {
          name: "Red Fort (Delhi / Agra)",
          description: "Historic red sandstone fortress complex built by Mughal emperors with grand courtyards and gates"
        }
      },
      {
        name: "Varanasi Ghats (Uttar Pradesh)",
        description: "Sacred stone steps leading down to the Ganges River where daily evening Ganga Aarti spiritual ceremonies take place",
        category: "Spiritual / Cultural",
        related: {
          name: "Haridwar Ghats (Har Ki Pauri)",
          description: "Sacred ghat on the banks of the Ganges where thousands gather for holy river dips and evening lamp rituals"
        }
      },
      {
        name: "Jaipur Pink City (Rajasthan)",
        description: "Historic capital city known for terracotta-pink painted buildings, Hawa Mahal palace, and majestic forts",
        category: "Royal Heritage",
        related: {
          name: "Udaipur City Palace",
          description: "Grand royal palace complex overlooking Lake Pichola with balconies, cupolas, and white marble architecture"
        }
      },
      {
        name: "Goa Beaches",
        description: "World-famous coastal paradise known for golden sandy beaches, palm trees, seafood shacks, and Portuguese heritage",
        category: "Beach / Coastal",
        related: {
          name: "Gokarna Beaches",
          description: "Serene coastal town in Karnataka with pristine crescent-shaped beaches tucked between rocky green hills"
        }
      },
      {
        name: "Ladakh Mountains (Union Territory)",
        description: "High-altitude cold desert landscape featuring Pangong Tso lake, Buddhist monasteries, and dramatic snow-capped passes",
        category: "Mountain / Cold Desert",
        related: {
          name: "Spiti Valley (Himachal Pradesh)",
          description: "Rugged high-altitude cold desert valley dotted with cliffside Tibetan monasteries and remote villages"
        }
      },
      {
        name: "Kerala Backwaters (Alleppey)",
        description: "Tranquil network of interconnected brackish lagoons, rivers, and canals navigated by traditional wooden houseboats",
        category: "Nature / Backwaters",
        related: {
          name: "Munnar Tea Gardens (Kerala)",
          description: "Lush green hill station covered with rolling tea plantations, mist-covered valleys, and cool mountain air"
        }
      },
      {
        name: "Golden Temple (Amritsar)",
        description: "Holiest Gurdwara of Sikhism gilded in real gold foil, surrounded by a sacred pool (Amrit Sarovar)",
        category: "Religious Landmark",
        related: {
          name: "Lotus Temple (Delhi)",
          description: "Bahá'í House of Worship shaped like a giant blooming white marble lotus flower open to all faiths"
        }
      },
      {
        name: "Ajanta & Ellora Caves (Maharashtra)",
        description: "Ancient rock-cut cave monuments featuring intricate Buddhist paintings and the monolithic Kailasa temple carved from rock",
        category: "Archaeological Wonder",
        related: {
          name: "Elephanta Caves (Mumbai)",
          description: "UNESCO world heritage rock-cut cave temples dedicated to Lord Shiva located on an island in Mumbai harbor"
        }
      },
      {
        name: "Sundarbans Mangrove Forest (West Bengal)",
        description: "Largest mangrove forest in the world formed by the delta of Ganges and Brahmaputra, home to Royal Bengal Tigers",
        category: "UNESCO Natural Reserve",
        related: {
          name: "Kaziranga National Park (Assam)",
          description: "UNESCO wetland wildlife sanctuary famous for hosting two-thirds of the world's great one-horned rhinoceroses"
        }
      },
      {
        name: "Hampi Ruins (Karnataka)",
        description: "UNESCO heritage site filled with boulder-strewn landscapes, stone chariot temples, and ruins of the Vijayanagara Empire",
        category: "Ancient Architecture",
        related: {
          name: "Mahabalipuram Shore Temples (Tamil Nadu)",
          description: "7th-century coastal stone temples and monolithic rock reliefs carved along the Bay of Bengal coastline"
        }
      },
      {
        name: "Rann of Kutch (Gujarat)",
        description: "Vast salt marsh in the Thar Desert known for the Rann Utsav festival and glittering white salt desert under moonlight",
        category: "Salt Desert Wonder",
        related: {
          name: "Jaisalmer Thar Desert (Rajasthan)",
          description: "Golden sand dune desert famous for camel safaris, desert camping, and the yellow sandstone Jaisalmer Fort"
        }
      },
      {
        name: "Shimla Hill Station (Himachal Pradesh)",
        description: "Colonial summer capital set amidst pine forests, featuring the iconic Mall Road, Ridge, and toy train railway",
        category: "Hill Station",
        related: {
          name: "Manali (Himachal Pradesh)",
          description: "High-altitude Himalayan resort town popular for Solang Valley adventure sports, snowfall, and Rohtang Pass"
        }
      },
      {
        name: "Mysore Palace (Karnataka)",
        description: "Grand Indo-Saracenic royal residence illuminated by nearly 100,000 bulbs during Dasara festivities",
        category: "Palace / Royal Heritage",
        related: {
          name: "Bengaluru Palace",
          description: "Tudor-style royal palace featuring fortified towers, wooden carvings, and manicured gardens in Bangalore"
        }
      },
      {
        name: "Darjeeling (West Bengal)",
        description: "Famous hill town offering views of Mount Kanchenjunga, aromatic tea gardens, and the heritage Himalayan Railway",
        category: "Hill Town / Tea Country",
        related: {
          name: "Gangtok (Sikkim)",
          description: "Capital city of Sikkim nestled in the Eastern Himalayas, known for Nathula Pass and Tibetan Buddhist culture"
        }
      },
      {
        name: "Meenakshi Amman Temple (Madurai)",
        description: "Historic South Indian Hindu temple complex featuring towering gopuram towers covered in thousands of colorful statues",
        category: "Dravidian Temple",
        related: {
          name: "Brihadeeswarar Temple (Thanjavur)",
          description: "1000-year-old Chola granite temple famous for its massive vimana tower and single-stone granite capstone"
        }
      }
    ],
    questions: {
      EASY: [
        "Is this place located in North India, South India, East India, West India, or Central India?",
        "Is this destination known primarily for historical monuments, natural scenery, or religious pilgrimage?",
        "Is the weather at this place typically hot/coastal, tropical/humid, or cold/snowy mountain air?",
        "Would tourists visit this place for adventure sports/relaxing, or for quiet heritage sightseeing?",
        "Can you reach this place easily by train/highway, or does it require a flight and mountain travel?",
        "Is this place famous for marble/stone architecture, water bodies/beaches, or high mountains?",
        "Have you personally visited this place or seen it featured in Bollywood movies/travel shows?",
        "Would you recommend visiting this place with family, friends, or as a solo backpacker?",
        "Is this place heavily crowded with international tourists throughout the year?",
        "Do visitors go to this place mainly during winter, summer, or monsoon season?",
        "Does visiting this place require walking lots of steps, trekking, or riding in boats/camels?",
        "Is this landmark situated near a river, ocean, mountain range, or desert?",
        "Is there an entry ticket or pass required to explore the main area of this destination?",
        "Would you buy local handicrafts, spices, tea, or souvenirs when visiting this location?",
        "Is this site recognized as a UNESCO World Heritage site or one of the top landmarks in India?"
      ],
      MEDIUM: [
        "Which specific Indian state or region is home to this famous landmark?",
        "What primary building material (e.g., white marble, red sandstone, granite, timber, white salt) defines its structure?",
        "What famous local dish or street food snack is a must-try when visiting this city/region?",
        "Is this place closely associated with a Mughal emperor, Rajput king, ancient dynasty, or spiritual saint?",
        "What specific clothing or footwear rules apply when entering the main complex or grounds?",
        "How long (hours or days) does a typical tourist spend exploring this destination?",
        "Is this destination illuminated with special lights or lamps during night hours or festivals?",
        "Does reaching this place involve crossing a high mountain pass, a boat ride, or riding a cable car?",
        "What natural feature (e.g. a river bank, sea coast, valley, hill top) frames the background of this site?",
        "What major Indian festival (e.g. Diwali, Dasara, Holi, Ganga Aarti, Rann Utsav) brings maximum crowds here?"
      ],
      HARD: [
        "What specific century or historical era (e.g. 7th century Dravidian, 17th century Mughal, British Colonial) marks its construction?",
        "What geographical challenge (e.g. high altitude, tidal water, salt corrosion, extreme heat) do preservationists face here?",
        "If a traveler missed the main landmark and visited a similar site in the neighboring city, what distinct architectural element would be missing?",
        "What specific photography viewpoint or sunrise/sunset spot is world-famous for capturing this site?",
        "Is the local transport around this landmark famous for auto rickshaws, houseboats, toy trains, or camels?",
        "What specific river, lake, or body of water flows directly adjacent to this destination?",
        "What local dialect or regional language is predominantly spoken by the locals living near this site?"
      ],
      EXPERT: [
        "What exact architectural style (e.g., Indo-Saracenic, Dravidian Gopuram, Mughal symmetrical, Rock-cut monolithic) best describes this monument?",
        "If an imposter mistook this place for a similar heritage destination in India, what key geographic or historical difference would expose them?",
        "What rare wildlife species or flora can be spotted in the protected zone surrounding this destination?",
        "How did ancient builders transport raw materials to construct this masterpiece without modern machinery?",
        "What conservation project or restoration effort has recently been undertaken to protect this heritage site from environmental decay?"
      ]
    }
  }
};

// Export for compatibility
const FOOD_DATABASE = GAME_CATEGORIES.INDIAN_CUISINE.items;
const TIERED_QUESTIONS = GAME_CATEGORIES.INDIAN_CUISINE.questions;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GAME_CATEGORIES, FOOD_DATABASE, TIERED_QUESTIONS };
}
