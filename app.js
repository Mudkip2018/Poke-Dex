// PokéAPI Configuration
const API_BASE = 'https://pokeapi.co/api/v2';
const INITIAL_LOAD = 24; // Fast initial load
const LOAD_MORE_COUNT = 50;
const MAX_POKEMON = 1025; // Up to Gen 9 (Paldea)

// Generation ranges
const GENERATION_RANGES = {
    1: { start: 1, end: 151, name: 'Kanto' },
    2: { start: 152, end: 251, name: 'Johto' },
    3: { start: 252, end: 386, name: 'Hoenn' },
    4: { start: 387, end: 493, name: 'Sinnoh' },
    5: { start: 494, end: 649, name: 'Unova' },
    6: { start: 650, end: 721, name: 'Kalos' },
    7: { start: 722, end: 809, name: 'Alola' },
    8: { start: 810, end: 905, name: 'Galar' },
    9: { start: 906, end: 1025, name: 'Paldea' }
};

// Legendary and Mythical Pokemon IDs (hard-coded for fast filtering)
const LEGENDARY_MYTHICAL_IDS = [
    144, 145, 146, 150, 151, // Gen 1: Articuno, Zapdos, Moltres, Mewtwo, Mew
    243, 244, 245, 249, 250, 251, // Gen 2: Raikou, Entei, Suicune, Lugia, Ho-Oh, Celebi
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // Gen 3: Regis, Lati@s, Kyogre, Groudon, Rayquaza, Jirachi, Deoxys
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, // Gen 4: Lake trio, Dialga, Palkia, Giratina, etc.
    494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, // Gen 5: Victini, Swords of Justice, Tao trio, Keldeo, Meloetta, Genesect
    716, 717, 718, 719, 720, 721, // Gen 6: Xerneas, Yveltal, Zygarde, Diancie, Hoopa, Volcanion
    772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807, 808, 809, // Gen 7: Type: Null, Silvally, Tapus, Cosmog line, Necrozma, Magearna, Marshadow, Zeraora, Meltan, Melmetal
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, // Gen 8: Zacian, Zamazenta, Eternatus, Kubfu, Urshifu, Zarude, Regieleki, Regidrago, Glastrier, Spectrier, Calyrex
    905, 1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010, 1014, 1015, 1016, 1017, 1020, 1021, 1022, 1023, 1024, 1025 // Gen 9: Enamorus, Wo-Chien, Chien-Pao, Ting-Lu, Chi-Yu, Koraidon, Miraidon, Walking Wake, Iron Leaves, Okidogi, Munkidori, Fezandipiti, Ogerpon, Terapagos, Pecharunt
];

// State
let currentOffset = 0;
let allPokemon = [];
let filteredPokemon = [];
let currentFilter = 'all';
let currentGeneration = 'all';
let showLegendaryOnly = false;
let currentLanguage = localStorage.getItem('pokedex-lang') || 'en';
let isLoading = false;
let generationCache = {}; // Cache loaded generations
let moveCache = {}; // Cache move data to avoid repeated API calls

// Translation Dictionaries
const translations = {
    en: {
        'page-title': 'PokéDex - The Ultimate Pokémon Encyclopedia',
        'app-title': 'PokéDex',
        'search-placeholder': 'Search Pokémon by name or number...',
        'loading': 'Loading Pokémon...',
        'load-more': 'Load More Pokémon',
        'filter-by-gen': 'Filter by Generation',
        'filter-by-type': 'Filter by Type',
        'gen-all': 'All Generations',
        'gen-1': 'Gen I (Kanto)',
        'gen-2': 'Gen II (Johto)',
        'gen-3': 'Gen III (Hoenn)',
        'gen-4': 'Gen IV (Sinnoh)',
        'gen-5': 'Gen V (Unova)',
        'gen-6': 'Gen VI (Kalos)',
        'gen-7': 'Gen VII (Alola)',
        'gen-8': 'Gen VIII (Galar)',
        'gen-9': 'Gen IX (Paldea)',
        'filter-legendary': '⭐ Legendary/Mythical Only',
        'type-all': 'All Types',
        'type-normal': 'Normal',
        'type-fire': 'Fire',
        'type-water': 'Water',
        'type-electric': 'Electric',
        'type-grass': 'Grass',
        'type-ice': 'Ice',
        'type-fighting': 'Fighting',
        'type-poison': 'Poison',
        'type-ground': 'Ground',
        'type-flying': 'Flying',
        'type-psychic': 'Psychic',
        'type-bug': 'Bug',
        'type-rock': 'Rock',
        'type-ghost': 'Ghost',
        'type-dragon': 'Dragon',
        'type-dark': 'Dark',
        'type-steel': 'Steel',
        'type-fairy': 'Fairy',
        'stats-title': 'Stats',
        'about-title': 'About',
        'no-description': 'No description available',
        'sprites-title': 'Sprites',
        'moves-title': 'Moves & Learnset',
        'pokedex-title': 'Pokédex Entries',
        'stat-hp': 'HP',
        'stat-attack': 'Attack',
        'stat-defense': 'Defense',
        'stat-special-attack': 'Sp. Atk',
        'stat-special-defense': 'Sp. Def',
        'stat-speed': 'Speed',
        'move-name': 'Move Name',
        'move-level': 'Level',
        'move-method': 'Learn Method',
        'showing-moves': 'Showing {0} of {1} moves',
        'no-pokemon-found': 'No Pokémon found with name or ID: "{0}"',
        'loading-details': 'Loading Pokémon details...',
        'sprite-front': 'Front',
        'sprite-back': 'Back',
        'sprite-shiny-front': 'Shiny Front',
        'sprite-shiny-back': 'Shiny Back'
    },
    zh: {
        'page-title': '宝可梦图鉴 - 终极宝可梦百科全书',
        'app-title': '宝可梦图鉴',
        'search-placeholder': '搜索宝可梦名称或编号...',
        'loading': '正在加载宝可梦...',
        'load-more': '加载更多宝可梦',
        'filter-by-gen': '按世代筛选',
        'filter-by-type': '按属性筛选',
        'gen-all': '全部世代',
        'gen-1': '第一世代 (关都)',
        'gen-2': '第二世代 (城都)',
        'gen-3': '第三世代 (丰缘)',
        'gen-4': '第四世代 (神奥)',
        'gen-5': '第五世代 (合众)',
        'gen-6': '第六世代 (卡洛斯)',
        'gen-7': '第七世代 (阿罗拉)',
        'gen-8': '第八世代 (伽勒尔)',
        'gen-9': '第九世代 (帕底亚)',
        'filter-legendary': '⭐ 仅传说/幻之宝可梦',
        'type-all': '所有属性',
        'type-normal': '一般',
        'type-fire': '火',
        'type-water': '水',
        'type-electric': '电',
        'type-grass': '草',
        'type-ice': '冰',
        'type-fighting': '格斗',
        'type-poison': '毒',
        'type-ground': '地面',
        'type-flying': '飞行',
        'type-psychic': '超能力',
        'type-bug': '虫',
        'type-rock': '岩石',
        'type-ghost': '幽灵',
        'type-dragon': '龙',
        'type-dark': '恶',
        'type-steel': '钢',
        'type-fairy': '妖精',
        'stats-title': '种族值',
        'about-title': '关于',
        'no-description': '暂无描述',
        'sprites-title': '形象',
        'moves-title': '招式表',
        'pokedex-title': '图鉴说明',
        'stat-hp': '体力',
        'stat-attack': '攻击',
        'stat-defense': '防御',
        'stat-special-attack': '特攻',
        'stat-special-defense': '特防',
        'stat-speed': '速度',
        'move-name': '招式名称',
        'move-level': '等级',
        'move-method': '学习方式',
        'showing-moves': '显示 {1} 个招式中的 {0} 个',
        'no-pokemon-found': '未找到名称或编号为"{0}"的宝可梦',
        'loading-details': '正在加载宝可梦详情...',
        'sprite-front': '正面',
        'sprite-back': '背面',
        'sprite-shiny-front': '异色正面',
        'sprite-shiny-back': '异色背面'
    }
};

// DOM Elements
const pokemonGrid = document.getElementById('pokemonGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchClearBtn = document.getElementById('searchClearBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const pokemonModal = document.getElementById('pokemonModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const filterBtns = document.querySelectorAll('.filter-btn');
const genBtns = document.querySelectorAll('.gen-btn');
const legendaryFilterBtn = document.getElementById('legendaryFilter');
const langToggle = document.getElementById('langToggle');
const langText = document.getElementById('langText');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();
    setupEventListeners();
    loadInitialPokemon();
    setupInfiniteScroll();
});

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Show/hide clear button based on input
    searchInput.addEventListener('input', () => {
        searchClearBtn.style.display = searchInput.value ? 'flex' : 'none';
    });

    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchClearBtn.style.display = 'none';
        handleSearch(); // Reset to show all
    });

    loadMoreBtn.addEventListener('click', loadMorePokemon);

    modalClose.addEventListener('click', closeModal);
    pokemonModal.querySelector('.modal-overlay').addEventListener('click', closeModal);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.type;
            applyFilters();
        });
    });

    genBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            genBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGeneration = btn.dataset.gen;
            applyFilters();
        });
    });

    legendaryFilterBtn.addEventListener('click', () => {
        showLegendaryOnly = !showLegendaryOnly;
        legendaryFilterBtn.classList.toggle('active');
        applyFilters();
    });

    langToggle.addEventListener('click', toggleLanguage);
}

// Infinite Scroll
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (isLoading || currentOffset >= MAX_POKEMON) return;

        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 500) {
            loadMorePokemon();
        }
    });
}

// Language Functions
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
    localStorage.setItem('pokedex-lang', currentLanguage);
    updateLanguage();

    // If switching to Chinese and Pokemon don't have species data, load it
    if (currentLanguage === 'zh') {
        const needsSpeciesData = allPokemon.filter(p => !p.species_data);
        if (needsSpeciesData.length > 0) {
            loadSpeciesDataForPokemon(needsSpeciesData);
        }
    }
}

// Load species data for specific Pokemon
async function loadSpeciesDataForPokemon(pokemonList) {
    const speciesPromises = pokemonList.map(pokemon =>
        fetchPokemonSpecies(pokemon.id).then(species => {
            if (species) {
                pokemon.species_data = species;
            }
            return pokemon;
        })
    );
    await Promise.all(speciesPromises);
    // Re-render to show Chinese names
    displayPokemon(filteredPokemon);
}

function updateLanguage() {
    const lang = translations[currentLanguage];

    // Update page title
    document.getElementById('page-title').textContent = lang['page-title'];

    // Update language toggle button text
    langText.textContent = currentLanguage === 'en' ? '中文' : 'English';

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (lang[key]) {
            element.textContent = lang[key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (lang[key]) {
            element.placeholder = lang[key];
        }
    });

    // Re-render Pokemon grid with updated language
    if (filteredPokemon.length > 0) {
        displayPokemon(filteredPokemon);
    }
}

function t(key, ...args) {
    let text = translations[currentLanguage][key] || key;
    args.forEach((arg, index) => {
        text = text.replace(`{${index}}`, arg);
    });
    return text;
}

// API Calls
async function fetchPokemonList(limit, offset) {
    try {
        const response = await fetch(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching Pokemon list:', error);
        return [];
    }
}

async function fetchPokemonDetails(nameOrId) {
    try {
        const response = await fetch(`${API_BASE}/pokemon/${nameOrId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
        return null;
    }
}

async function fetchPokemonSpecies(id) {
    try {
        const response = await fetch(`${API_BASE}/pokemon-species/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon species:', error);
        return null;
    }
}

async function fetchMoveDetails(moveUrl) {
    try {
        const response = await fetch(moveUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching move details:', error);
        return null;
    }
}

async function fetchMoveDetails(moveUrl) {
    // Check cache first
    if (moveCache[moveUrl]) {
        return moveCache[moveUrl];
    }

    try {
        const response = await fetch(moveUrl);
        const data = await response.json();
        moveCache[moveUrl] = data; // Cache the result
        return data;
    } catch (error) {
        console.error('Error fetching move details:', error);
        return null;
    }
}

// Load Pokemon
async function loadInitialPokemon() {
    showLoading();
    isLoading = true;
    const pokemonList = await fetchPokemonList(INITIAL_LOAD, 0);

    // Fetch Pokemon details
    const pokemonPromises = pokemonList.map(p => fetchPokemonDetails(p.name));
    allPokemon = await Promise.all(pokemonPromises);

    console.log('Initial load complete. Language:', currentLanguage);
    console.log('Pokemon loaded:', allPokemon.length);

    // If in Chinese mode, load species data immediately for names (parallel for speed)
    if (currentLanguage === 'zh') {
        console.log('Loading species data for Chinese names...');
        try {
            const speciesPromises = allPokemon.map(pokemon =>
                fetchPokemonSpecies(pokemon.id).then(species => {
                    if (species) {
                        pokemon.species_data = species;
                        console.log(`Loaded species data for #${pokemon.id}`);
                    }
                    return pokemon;
                }).catch(err => {
                    console.error(`Failed to load species for #${pokemon.id}:`, err);
                    return pokemon;
                })
            );
            await Promise.all(speciesPromises);
            console.log('All species data loaded - now rendering with Chinese names');
        } catch (error) {
            console.error('Error loading species data:', error);
        }
    }

    currentOffset = INITIAL_LOAD;
    isLoading = false;

    // Apply filters AFTER species data is loaded (moved from before species data loading)
    applyFilters();
    loadMoreBtn.style.display = 'none'; // Hide load more button with infinite scroll
}

// Load species data in background (non-blocking)
async function loadSpeciesDataInBackground(pokemonList) {
    for (const pokemon of pokemonList) {
        if (!pokemon.species_data) {
            const species = await fetchPokemonSpecies(pokemon.id);
            if (species) {
                pokemon.species_data = species;
                // Re-render if this Pokemon is currently visible
                if (filteredPokemon.includes(pokemon)) {
                    displayPokemon(filteredPokemon);
                }
            }
        }
    }
}

async function loadMorePokemon() {
    if (isLoading || currentOffset >= MAX_POKEMON) return;

    isLoading = true;
    const pokemonList = await fetchPokemonList(LOAD_MORE_COUNT, currentOffset);

    // Fast load - only fetch Pokemon details
    const pokemonPromises = pokemonList.map(p => fetchPokemonDetails(p.name));
    const newPokemon = await Promise.all(pokemonPromises);

    // If in Chinese mode, load species data for names
    if (currentLanguage === 'zh') {
        const speciesPromises = newPokemon.map(pokemon =>
            fetchPokemonSpecies(pokemon.id).then(species => {
                if (species) pokemon.species_data = species;
                return pokemon;
            })
        );
        await Promise.all(speciesPromises);
    }

    allPokemon = [...allPokemon, ...newPokemon];
    currentOffset += LOAD_MORE_COUNT;
    isLoading = false;

    applyFilters();
}

// Display Pokemon
function displayPokemon(pokemonArray) {
    pokemonGrid.innerHTML = '';

    pokemonArray.forEach(pokemon => {
        if (!pokemon) return;

        const card = createPokemonCard(pokemon);
        pokemonGrid.appendChild(card);
    });
}

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.onclick = () => showPokemonDetail(pokemon.id);

    const pokemonId = String(pokemon.id).padStart(3, '0');
    const pokemonName = pokemon.name;
    const pokemonImage = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    const types = pokemon.types.map(t => t.type.name);

    // Type badges with translation
    const typeBadges = types.map(type =>
        `<span class="type-badge type-${type}">${t('type-' + type)}</span>`
    ).join('');

    // Get Pokemon name (use Chinese name if available and in Chinese mode)
    let displayName = pokemonName;
    if (currentLanguage === 'zh' && pokemon.species_data) {
        const zhName = pokemon.species_data.names.find(n => n.language.name === 'zh-Hans');
        if (zhName) {
            displayName = zhName.name;
            console.log(`Pokemon #${pokemon.id}: Using Chinese name "${displayName}"`);
        } else {
            console.log(`Pokemon #${pokemon.id}: No Chinese name found, using "${displayName}"`);
        }
    } else if (currentLanguage === 'zh') {
        console.log(`Pokemon #${pokemon.id}: No species_data available`);
    }

    card.innerHTML = `
        <div class="pokemon-card-header">
            <span class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</span>
        </div>
        <h3 class="pokemon-name">${displayName}</h3>
        <div class="pokemon-image-container">
            <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                 alt="${displayName}" 
                 class="pokemon-image"
                 loading="lazy">
        </div>
        <div class="pokemon-types">
            ${typeBadges}
        </div>
    `;

    return card;
}

// Show Pokemon Detail Modal
async function showPokemonDetail(pokemonId) {
    pokemonModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    showLoadingModal();

    const pokemon = allPokemon.find(p => p.id === pokemonId);
    if (!pokemon) return;

    // Lazy load species data if not already fetched
    let species = null;
    if (!pokemon.species_data) {
        species = await fetchPokemonSpecies(pokemon.id);
        if (species) {
            pokemon.species_data = species; // Cache it
        }
    } else {
        species = pokemon.species_data;
    }

    // Get Pokemon name (Chinese if available and in Chinese mode)
    let displayName = pokemon.name;
    if (currentLanguage === 'zh' && species) {
        const zhName = species.names.find(n => n.language.name === 'zh-Hans');
        if (zhName) displayName = zhName.name;
    }

    const types = pokemon.types.map(t => t.type.name);
    const typeBadges = types.map(type =>
        `<span class="type-badge type-${type}">${t('type-' + type)}</span>`
    ).join('');

    // Get flavor text (fun facts) - use appropriate language
    const targetLang = currentLanguage === 'zh' ? 'zh-Hans' : 'en';
    const flavorTextEntries = species?.flavor_text_entries.filter(
        entry => entry.language.name === targetLang
    ) || [];
    const uniqueFlavors = [...new Set(flavorTextEntries.map(e => e.flavor_text.replace(/\f/g, ' ')))];
    const flavorTexts = uniqueFlavors.slice(0, 3).map(text =>
        `<p>${text}</p>`
    ).join('');

    // Stats - translate stat names
    const statNameMap = {
        'hp': 'stat-hp',
        'attack': 'stat-attack',
        'defense': 'stat-defense',
        'special-attack': 'stat-special-attack',
        'special-defense': 'stat-special-defense',
        'speed': 'stat-speed'
    };

    const statsHTML = pokemon.stats.map(stat => {
        const maxStat = 255;
        const percentage = (stat.base_stat / maxStat) * 100;
        const statKey = statNameMap[stat.stat.name] || stat.stat.name;
        return `
            <div class="stat-row">
                <span class="stat-name">${t(statKey)}</span>
                <span class="stat-value">${stat.base_stat}</span>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // Moves (show first 20) - with Chinese translation
    let movesHTML = '';
    if (currentLanguage === 'zh') {
        // Fetch move details for Chinese names (with caching for performance)
        const movePromises = pokemon.moves.slice(0, 20).map(async (move) => {
            const moveDetails = await fetchMoveDetails(move.move.url);
            const zhName = moveDetails?.names?.find(n => n.language.name === 'zh-Hans');
            const moveName = zhName ? zhName.name : move.move.name.replace(/-/g, ' ');
            const moveData = move.version_group_details[0];
            const learnMethod = moveData.move_learn_method.name;

            // Translate learn method to Chinese
            const methodMap = {
                'level-up': '升级',
                'machine': '技能机',
                'egg': '遗传',
                'tutor': '教学',
                'stadium-surfing-pikachu': '冲浪皮卡丘',
                'light-ball-egg': '电球遗传',
                'colosseum-purification': '净化',
                'xd-shadow': '暗影',
                'xd-purification': 'XD净化',
                'form-change': '形态变化'
            };
            const translatedMethod = methodMap[learnMethod] || learnMethod;

            return {
                name: moveName,
                level: moveData.level_learned_at || '-',
                method: translatedMethod
            };
        });

        const moves = await Promise.all(movePromises);
        movesHTML = moves.map(move => `
            <tr>
                <td>${move.name}</td>
                <td>${move.level}</td>
                <td>${move.method}</td>
            </tr>
        `).join('');
    } else {
        movesHTML = pokemon.moves.slice(0, 20).map(move => {
            const moveData = move.version_group_details[0];
            const moveName = move.move.name.replace(/-/g, ' ');
            const capitalizedMove = moveName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const learnMethod = moveData.move_learn_method.name.replace(/-/g, ' ');
            const capitalizedMethod = learnMethod.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            return `
                <tr>
                    <td>${capitalizedMove}</td>
                    <td>${moveData.level_learned_at || '-'}</td>
                    <td>${capitalizedMethod}</td>
                </tr>
            `;
        }).join('');
    }

    // Sprites
    const sprites = [];
    if (pokemon.sprites.front_default) sprites.push({ url: pokemon.sprites.front_default, label: t('sprite-front') });
    if (pokemon.sprites.back_default) sprites.push({ url: pokemon.sprites.back_default, label: t('sprite-back') });
    if (pokemon.sprites.front_shiny) sprites.push({ url: pokemon.sprites.front_shiny, label: t('sprite-shiny-front') });
    if (pokemon.sprites.back_shiny) sprites.push({ url: pokemon.sprites.back_shiny, label: t('sprite-shiny-back') });

    const spritesHTML = sprites.map(sprite => `
        <div class="sprite-item">
            <img src="${sprite.url}" alt="${sprite.label}">
            <div class="sprite-label">${sprite.label}</div>
        </div>
    `).join('');

    modalBody.innerHTML = `
        <div class="detail-hero">
            <div class="detail-id">#${String(pokemon.id).padStart(3, '0')}</div>
            <h2 class="detail-name">${displayName}</h2>
            <div class="detail-image-container">
                <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                     alt="${displayName}" 
                     class="detail-image">
            </div>
            <div class="detail-types">
                ${typeBadges}
            </div>
        </div>
        
        <div class="detail-section">
            <h3 class="detail-section-title">${t('stats-title')}</h3>
            <div class="stats-grid">
                ${statsHTML}
            </div>
        </div>
        
        <div class="detail-section">
            <h3 class="detail-section-title">${t('sprites-title')}</h3>
            <div class="sprites-grid">
                ${spritesHTML}
            </div>
        </div>
        
        <div class="detail-section">
            <h3 class="detail-section-title">${t('about-title')}</h3>
            <div class="flavor-text">
                ${flavorTexts || `<p>${t('no-description')}</p>`}
            </div>
        </div>
        
        <div class="detail-section">
            <h3 class="detail-section-title">${t('moves-title')}</h3>
            <table class="moves-table">
                <thead>
                    <tr>
                        <th>${t('move-name')}</th>
                        <th>${t('move-level')}</th>
                        <th>${t('move-method')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${movesHTML}
                </tbody>
            </table>
            ${pokemon.moves.length > 20 ? `<p style="margin-top: 1rem; color: var(--text-muted); text-align: center;">${t('showing-moves', '20', pokemon.moves.length)}</p>` : ''}
        </div>
        `;
}

function closeModal() {
    pokemonModal.classList.remove('active');
    document.body.style.overflow = '';
}

function showLoadingModal() {
    modalBody.innerHTML = `
        <div class="loading">
            <div class="pokeball-loader"></div>
            <p>Loading...</p>
        </div>
    `;
}

// Search
async function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        // Reset filters
        currentFilter = 'all';
        currentGeneration = 'all';
        filterBtns.forEach(b => b.classList.remove('active'));
        genBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-type="all"]').classList.add('active');
        document.querySelector('[data-gen="all"]').classList.add('active');
        applyFilters();
        return;
    }

    // Fuzzy search in loaded Pokemon by name (English/Chinese) or ID
    const localResults = allPokemon.filter(p => {
        // Check ID
        if (String(p.id) === query || String(p.id).padStart(3, '0') === query) {
            return true;
        }

        // Check English name (fuzzy)
        if (p.name.toLowerCase().includes(query)) {
            return true;
        }

        // Check Chinese name if available
        if (p.species_data && currentLanguage === 'zh') {
            const zhName = p.species_data.names.find(n => n.language.name === 'zh-Hans');
            if (zhName && zhName.name.includes(query)) {
                return true;
            }
        }

        // Fuzzy match - check if query is similar to name
        const similarity = calculateSimilarity(query, p.name.toLowerCase());
        return similarity > 0.6; // 60% similarity threshold
    });

    if (localResults.length > 0) {
        filteredPokemon = localResults;
        displayPokemon(filteredPokemon);
        return;
    }

    // Try to fetch directly from API if not found locally
    showLoading();
    const pokemon = await fetchPokemonDetails(query);
    if (pokemon) {
        // Add species data for Chinese name
        const species = await fetchPokemonSpecies(pokemon.id);
        if (species) {
            pokemon.species_data = species;
        }
        // Add to allPokemon if not already there
        if (!allPokemon.find(p => p.id === pokemon.id)) {
            allPokemon.push(pokemon);
        }
        filteredPokemon = [pokemon];
        displayPokemon(filteredPokemon);
    } else {
        pokemonGrid.innerHTML = `
            < div class="loading" >
                <p>${t('no-pokemon-found', query)}</p>
            </div >
            `;
    }
}

// Simple fuzzy matching using Levenshtein distance
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    // Check if shorter is contained in longer
    if (longer.includes(shorter)) return 0.9;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

// Filter
function applyFilters() {
    let filtered = [...allPokemon];

    // Apply generation filter
    if (currentGeneration !== 'all') {
        const gen = parseInt(currentGeneration);
        const range = GENERATION_RANGES[gen];
        if (range) {
            filtered = filtered.filter(pokemon =>
                pokemon.id >= range.start && pokemon.id <= range.end
            );
        }
    }

    // Apply type filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(pokemon =>
            pokemon.types.some(t => t.type.name === currentFilter)
        );
    }

    // Apply legendary/mythical filter using hardcoded ID list
    if (showLegendaryOnly) {
        filtered = filtered.filter(pokemon => LEGENDARY_MYTHICAL_IDS.includes(pokemon.id));
    }

    filteredPokemon = filtered;
    displayPokemon(filteredPokemon);
}

// Loading State
function showLoading() {
    pokemonGrid.innerHTML = `
        <div class="loading">
            <div class="pokeball-loader"></div>
            <p>Loading Pokémon...</p>
        </div>
    `;
}
