// CODEBREAKOUT - Internationalization (i18n)
// ============================================================================
// Multi-language support system
// ============================================================================

export const LANGUAGES = {
    en: {
        id: 'en',
        name: 'English',
        flag: '🇬🇧',
    },
    it: {
        id: 'it',
        name: 'Italiano',
        flag: '🇮🇹',
    },
};

export const TRANSLATIONS = {
    en: {
        // Menu
        menu: {
            classic: 'CLASSIC',
            campaign: 'CAMPAIGN',
            easyMode: 'EASY MODE',
            bonusMode: 'BONUS MODE',
            highScores: 'HIGH SCORES',
            statistics: 'STATISTICS',
            customize: 'CUSTOMIZE',
            achievements: 'ACHIEVEMENTS',
            back: 'BACK',
            best: 'BEST',
            theme: 'THEME',
            language: 'LANG',
        },
        // Game HUD
        hud: {
            score: 'Score',
            lives: 'Lives',
            level: 'Level',
            multiplier: 'Multiplier',
            paused: 'PAUSED',
            resume: 'RESUME',
            launchHint: 'Press SPACE or tap to launch',
            swipeHint: 'SWIPE TO MOVE',
            launch: 'LAUNCH',
            fire: 'FIRE',
        },
        // Game states
        game: {
            levelComplete: 'LEVEL COMPLETE!',
            gameOver: 'GAME OVER',
            bonusOver: 'BONUS OVER!',
            victory: 'VICTORY!',
            classicComplete: 'CLASSIC COMPLETE!',
            campaignComplete: 'CAMPAIGN COMPLETE!',
            easyModeComplete: 'EASY MODE COMPLETE!',
            bonusComplete: 'BONUS COMPLETE!',
            finalScore: 'FINAL SCORE',
            reached: 'Reached',
            next: 'Next',
            finalLevelComplete: 'Final Level Complete!',
            time: 'Time',
            bricks: 'Bricks',
            maxCombo: 'Max Combo',
            levelScore: 'Level Score',
            continue: 'CONTINUE',
            playAgain: 'PLAY AGAIN',
            retry: 'RETRY',
            saveScore: 'SAVE SCORE',
            enterName: 'Enter name',
            topScores: 'TOP SCORES',
        },
        // Bonus modes
        bonus: {
            title: 'BONUS MODE',
            chooseChallenge: 'Choose your challenge',
            roguelike: 'ROGUELIKE',
            roguelikeDesc: 'Survive 2:30! Bricks regenerate.',
            zenMode: 'ZEN MODE',
            zenModeDesc: 'Relax with shield + 10 balls.',
            bounce: 'BOUNCE',
            bounceDesc: 'Doodle Jump style!',
            bulletHell: 'BULLET HELL',
            bulletHellDesc: 'Dodge the bullets!',
            invasion: 'INVASION',
            invasionDesc: 'Stop the descent!',
            multiballMadness: 'MULTIBALL MADNESS',
            multiballMadnessDesc: 'Reach 50 balls!',
            bossBattle: 'BOSS BATTLE',
            bossBattleDesc: 'Defeat the boss!',
            speedRun: 'SPEED RUN',
            speedRunDesc: '60 seconds!',
        },
        // Pause menu
        pause: {
            music: 'MUSIC',
            sound: 'SOUND',
            haptics: 'HAPTICS',
            on: 'ON',
            off: 'OFF',
        },
        // Quit dialog
        quit: {
            title: 'Quit to Main Menu?',
            message: 'Your progress will be lost.',
            confirm: 'YES, QUIT',
            cancel: 'CANCEL',
        },
        // High scores
        highScores: {
            title: 'HIGH SCORES',
            rank: '#',
            player: 'PLAYER',
            level: 'LEVEL',
            score: 'SCORE',
            empty: 'No scores yet. Be the first!',
        },
        // Statistics
        stats: {
            title: 'MY STATS',
            progress: 'Progress',
            gamesPlayed: 'Games Played',
            totalPlayTime: 'Total Play Time',
            levelsCompleted: 'Levels Completed',
            perfectLevels: 'Perfect Levels',
            records: 'Records',
            bestScore: 'Best Score',
            totalScore: 'Total Score',
            maxCombo: 'Max Combo',
            bonusCompleted: 'Bonus Modes Completed',
            unlocks: 'Unlocks',
            achievements: 'Achievements',
            cosmetics: 'Cosmetics',
            playstyle: 'Your Playstyle',
            newcomer: 'Newcomer',
            playMoreToDiscover: 'Play more to discover your style!',
            communityStats: 'Community Stats',
            totalGames: 'Total Games',
            avgScore: 'Average Score',
            allTimeHigh: 'All-Time High',
            activePlayers: 'Active Players',
            gamesToday: 'Games Today',
            thisWeek: 'This Week',
            weeklyActivity: 'Weekly Activity',
            gamesByMode: 'Games by Mode',
        },
        // Customize
        customize: {
            title: 'CUSTOMIZE',
            paddle: 'PADDLE',
            trail: 'TRAIL',
            background: 'BACKGROUND',
            locked: 'Locked',
            selected: 'Selected',
            select: 'Select',
        },
        // Achievements
        achievementsScreen: {
            title: 'ACHIEVEMENTS',
            unlocked: 'Unlocked',
        },
        // Achievement names and descriptions
        achievements: {
            first_blood: { name: 'First Blood', desc: 'Complete your first level' },
            combo_5: { name: 'Combo Master', desc: 'Reach 5x multiplier' },
            combo_10: { name: 'Unstoppable', desc: 'Reach 10x multiplier' },
            perfect: { name: 'Flawless', desc: 'Complete a level without losing lives' },
            perfect_3: { name: 'Perfectionist', desc: 'Complete 3 perfect levels' },
            perfect_5: { name: 'Precision Master', desc: 'Complete 5 perfect levels' },
            speed_demon: { name: 'Speed Demon', desc: 'Complete a level in under 30 seconds' },
            survivor: { name: 'Survivor', desc: 'Complete Roguelike mode' },
            boss_slayer: { name: 'Boss Slayer', desc: 'Defeat the Boss' },
            multiball_king: { name: 'Chaos Lord', desc: 'Have 20+ balls at once' },
            zen_master: { name: 'Zen Master', desc: 'Complete Zen Mode' },
            score_10k: { name: 'Rising Star', desc: 'Reach 10,000 total score' },
            score_50k: { name: 'High Roller', desc: 'Reach 50,000 total score' },
            score_100k: { name: 'Legend', desc: 'Reach 100,000 total score' },
            score_500k: { name: 'Score Titan', desc: 'Reach 500,000 total score' },
            tough_cookie: { name: 'Tough Cookie', desc: 'Survive 5 malus powerups' },
            iron_will: { name: 'Iron Will', desc: 'Survive 15 malus powerups' },
            bullet_hell_master: { name: 'Bullet Dodger', desc: 'Complete Bullet Hell mode' },
            speed_runner: { name: 'Speed Runner', desc: 'Complete Speed Run mode' },
            bounce_champion: { name: 'Bounce Champion', desc: 'Complete Bounce mode' },
            invasion_defender: { name: 'Invasion Defender', desc: 'Complete Invasion mode' },
            multiball_mania: { name: 'Multiball Mania', desc: 'Complete Multiball Madness mode' },
            games_10: { name: 'Getting Started', desc: 'Play 10 games' },
            games_50: { name: 'Dedicated Player', desc: 'Play 50 games' },
            time_30min: { name: 'Time Flies', desc: 'Play for 30 minutes total' },
            time_2hours: { name: 'Marathon Gamer', desc: 'Play for 2 hours total' },
        },
        // Share
        share: {
            label: 'Share your score:',
            facebook: 'Facebook',
            copyLink: 'Copy Link',
            copied: 'Copied!',
            shareText: 'I scored {score} points and reached {level} in {game} {mode}! Can you beat my score?',
        },
        // Powerups
        powerups: {
            wide: 'WIDE',
            multi: 'MULTI',
            slow: 'SLOW',
            laser: 'LASER',
            shield: 'SHIELD',
            magnet: 'MAGNET',
            fire: 'FIRE',
            mini: 'MINI',
            fast: 'FAST',
            glitch: 'GLITCH',
        },
        // Controls hint
        controls: {
            hint: 'Mouse / Arrow Keys / Touch',
        },
        // Credits
        credits: {
            createdBy: 'Created by',
        },
        // Level descriptions by theme
        levels: {
            code: [
                'The foundation of the web',
                'Styled layers',
                'Dynamic and unpredictable',
                'Elegant simplicity',
                'Web hustle',
                'Survive 2:30!',
                'Combo master',
                'Heavy and robust',
                'Multi-threaded chaos',
                'Type-safe precision',
                'Raw power',
                'Relax and rack up points!',
                'Complex machinery',
                'Concurrent goroutines',
                'Borrow checker',
                'Monadic portals',
                'Keep jumping higher!',
                'Maximum performance',
                'Dodge the bullets!',
                'Stop the descent!',
                'Reach 50 balls!',
                'Defeat the boss!',
                'Clear waves! 60 seconds!',
            ],
            cake: [
                'Sweet beginnings',
                'Crunchy delight',
                'Fluffy and warm',
                'Rich chocolate',
                'Glazed perfection',
                'Survive 2:30!',
                'French elegance',
                'Creamy layers',
                'Chocolate topped',
                'Buttery layers',
                'Coffee infused',
                'Relax and rack up points!',
                'Delicate rise',
                'Caramelized top',
                'Cream filled',
                'Honeyed layers',
                'Keep jumping higher!',
                'Ultimate mastery',
                'Dodge the candies!',
                'Stop the frosting!',
                'Reach 50 sprinkles!',
                'Defeat the chef!',
                'Bake fast! 60 seconds!',
            ],
            astro: [
                'First step into space',
                'The red planet',
                'Scorching atmosphere',
                'Giant storms',
                'Ringed beauty',
                'Survive 2:30!',
                'Ice giant',
                'Deep blue',
                'Dwarf planet',
                'Icy wanderer',
                'Stellar power',
                'Relax and rack up points!',
                'Nearest star',
                'Red supergiant',
                'Brightest star',
                'Spinning neutron star',
                'Keep jumping higher!',
                'Event horizon',
                'Dodge the meteors!',
                'Stop the aliens!',
                'Reach 50 stars!',
                'Defeat the entity!',
                'Light speed! 60 seconds!',
            ],
        },
    },
    it: {
        // Menu
        menu: {
            classic: 'CLASSICA',
            campaign: 'CAMPAGNA',
            easyMode: 'FACILE',
            bonusMode: 'BONUS',
            highScores: 'PUNTEGGI',
            statistics: 'STATISTICHE',
            customize: 'PERSONALIZZA',
            achievements: 'TRAGUARDI',
            back: 'INDIETRO',
            best: 'RECORD',
            theme: 'TEMA',
            language: 'LINGUA',
        },
        // Game HUD
        hud: {
            score: 'Punti',
            lives: 'Vite',
            level: 'Livello',
            multiplier: 'Moltiplicatore',
            paused: 'PAUSA',
            resume: 'RIPRENDI',
            launchHint: 'Premi SPAZIO o tocca per lanciare',
            swipeHint: 'SCORRI PER MUOVERE',
            launch: 'LANCIA',
            fire: 'SPARA',
        },
        // Game states
        game: {
            levelComplete: 'LIVELLO COMPLETATO!',
            gameOver: 'GAME OVER',
            bonusOver: 'BONUS FINITO!',
            victory: 'VITTORIA!',
            classicComplete: 'CLASSICA COMPLETATA!',
            campaignComplete: 'CAMPAGNA COMPLETATA!',
            easyModeComplete: 'FACILE COMPLETATA!',
            bonusComplete: 'BONUS COMPLETATO!',
            finalScore: 'PUNTEGGIO FINALE',
            reached: 'Raggiunto',
            next: 'Prossimo',
            finalLevelComplete: 'Ultimo Livello Completato!',
            time: 'Tempo',
            bricks: 'Mattoni',
            maxCombo: 'Combo Max',
            levelScore: 'Punti Livello',
            continue: 'CONTINUA',
            playAgain: 'GIOCA ANCORA',
            retry: 'RIPROVA',
            saveScore: 'SALVA PUNTEGGIO',
            enterName: 'Inserisci nome',
            topScores: 'MIGLIORI PUNTEGGI',
        },
        // Bonus modes
        bonus: {
            title: 'MODALITÀ BONUS',
            chooseChallenge: 'Scegli la tua sfida',
            roguelike: 'ROGUELIKE',
            roguelikeDesc: 'Sopravvivi 2:30! I mattoni si rigenerano.',
            zenMode: 'RELAX',
            zenModeDesc: 'Rilassati con scudo + 10 palle.',
            bounce: 'RIMBALZO',
            bounceDesc: 'Stile Doodle Jump!',
            bulletHell: 'PIOGGIA DI PROIETTILI',
            bulletHellDesc: 'Schiva i proiettili!',
            invasion: 'INVASIONE',
            invasionDesc: 'Ferma la discesa!',
            multiballMadness: 'FOLLIA MULTIPALLA',
            multiballMadnessDesc: 'Raggiungi 50 palle!',
            bossBattle: 'BOSS FINALE',
            bossBattleDesc: 'Sconfiggi il boss!',
            speedRun: 'CORSA VELOCE',
            speedRunDesc: '60 secondi!',
        },
        // Pause menu
        pause: {
            music: 'MUSICA',
            sound: 'SUONI',
            haptics: 'VIBRAZIONE',
            on: 'ON',
            off: 'OFF',
        },
        // Quit dialog
        quit: {
            title: 'Tornare al Menu?',
            message: 'I tuoi progressi andranno persi.',
            confirm: 'SÌ, ESCI',
            cancel: 'ANNULLA',
        },
        // High scores
        highScores: {
            title: 'PUNTEGGI MIGLIORI',
            rank: '#',
            player: 'GIOCATORE',
            level: 'LIVELLO',
            score: 'PUNTI',
            empty: 'Nessun punteggio. Sii il primo!',
        },
        // Statistics
        stats: {
            title: 'LE MIE STATISTICHE',
            progress: 'Progressi',
            gamesPlayed: 'Partite Giocate',
            totalPlayTime: 'Tempo di Gioco',
            levelsCompleted: 'Livelli Completati',
            perfectLevels: 'Livelli Perfetti',
            records: 'Record',
            bestScore: 'Miglior Punteggio',
            totalScore: 'Punteggio Totale',
            maxCombo: 'Combo Massima',
            bonusCompleted: 'Bonus Completati',
            unlocks: 'Sbloccati',
            achievements: 'Traguardi',
            cosmetics: 'Cosmetici',
            playstyle: 'Il Tuo Stile',
            newcomer: 'Principiante',
            playMoreToDiscover: 'Gioca di più per scoprire il tuo stile!',
            communityStats: 'Statistiche Community',
            totalGames: 'Partite Totali',
            avgScore: 'Punteggio Medio',
            allTimeHigh: 'Record Assoluto',
            activePlayers: 'Giocatori Attivi',
            gamesToday: 'Partite Oggi',
            thisWeek: 'Questa Settimana',
            weeklyActivity: 'Attività Settimanale',
            gamesByMode: 'Partite per Modalità',
        },
        // Customize
        customize: {
            title: 'PERSONALIZZA',
            paddle: 'RACCHETTA',
            trail: 'SCIA',
            background: 'SFONDO',
            locked: 'Bloccato',
            selected: 'Selezionato',
            select: 'Seleziona',
        },
        // Achievements
        achievementsScreen: {
            title: 'TRAGUARDI',
            unlocked: 'Sbloccati',
        },
        // Achievement names and descriptions
        achievements: {
            first_blood: { name: 'Prima Vittoria', desc: 'Completa il tuo primo livello' },
            combo_5: { name: 'Maestro Combo', desc: 'Raggiungi 5x moltiplicatore' },
            combo_10: { name: 'Inarrestabile', desc: 'Raggiungi 10x moltiplicatore' },
            perfect: { name: 'Impeccabile', desc: 'Completa un livello senza perdere vite' },
            perfect_3: { name: 'Perfezionista', desc: 'Completa 3 livelli perfetti' },
            perfect_5: { name: 'Maestro Precisione', desc: 'Completa 5 livelli perfetti' },
            speed_demon: { name: 'Demone Velocità', desc: 'Completa un livello in meno di 30 secondi' },
            survivor: { name: 'Sopravvissuto', desc: 'Completa modalità Roguelike' },
            boss_slayer: { name: 'Ammazzaboss', desc: 'Sconfiggi il Boss' },
            multiball_king: { name: 'Signore del Caos', desc: 'Raggiungi 20+ palle contemporaneamente' },
            zen_master: { name: 'Maestro Zen', desc: 'Completa modalità Relax' },
            score_10k: { name: 'Stella Nascente', desc: 'Raggiungi 10.000 punti totali' },
            score_50k: { name: 'Grande Giocatore', desc: 'Raggiungi 50.000 punti totali' },
            score_100k: { name: 'Leggenda', desc: 'Raggiungi 100.000 punti totali' },
            score_500k: { name: 'Titano dei Punti', desc: 'Raggiungi 500.000 punti totali' },
            tough_cookie: { name: 'Duro a Morire', desc: 'Sopravvivi a 5 malus' },
            iron_will: { name: 'Volontà di Ferro', desc: 'Sopravvivi a 15 malus' },
            bullet_hell_master: { name: 'Schiva Proiettili', desc: 'Completa Pioggia di Proiettili' },
            speed_runner: { name: 'Velocista', desc: 'Completa Corsa Veloce' },
            bounce_champion: { name: 'Campione Rimbalzo', desc: 'Completa modalità Rimbalzo' },
            invasion_defender: { name: 'Difensore Invasione', desc: 'Completa modalità Invasione' },
            multiball_mania: { name: 'Follia Multipalla', desc: 'Completa modalità Follia Multipalla' },
            games_10: { name: 'Primi Passi', desc: 'Gioca 10 partite' },
            games_50: { name: 'Giocatore Dedicato', desc: 'Gioca 50 partite' },
            time_30min: { name: 'Il Tempo Vola', desc: 'Gioca per 30 minuti totali' },
            time_2hours: { name: 'Maratoneta', desc: 'Gioca per 2 ore totali' },
        },
        // Share
        share: {
            label: 'Condividi il tuo punteggio:',
            facebook: 'Facebook',
            copyLink: 'Copia Link',
            copied: 'Copiato!',
            shareText: 'Ho fatto {score} punti e raggiunto {level} in {game} {mode}! Riesci a battermi?',
        },
        // Powerups
        powerups: {
            wide: 'LARGO',
            multi: 'MULTI',
            slow: 'LENTO',
            laser: 'LASER',
            shield: 'SCUDO',
            magnet: 'MAGNETE',
            fire: 'FUOCO',
            mini: 'MINI',
            fast: 'VELOCE',
            glitch: 'GLITCH',
        },
        // Controls hint
        controls: {
            hint: 'Mouse / Frecce / Touch',
        },
        // Credits
        credits: {
            createdBy: 'Creato da',
        },
        // Level descriptions by theme
        levels: {
            code: [
                'Le fondamenta del web',
                'Strati stilizzati',
                'Dinamico e imprevedibile',
                'Elegante semplicità',
                'Frenesia del web',
                'Sopravvivi 2:30!',
                'Maestro delle combo',
                'Pesante e robusto',
                'Caos multi-thread',
                'Precisione tipizzata',
                'Potenza pura',
                'Rilassati e accumula punti!',
                'Macchinario complesso',
                'Goroutine concorrenti',
                'Borrow checker',
                'Portali monadici',
                'Continua a saltare!',
                'Massime prestazioni',
                'Schiva i proiettili!',
                'Ferma la discesa!',
                'Raggiungi 50 palle!',
                'Sconfiggi il boss!',
                'Pulisci le ondate! 60 secondi!',
            ],
            cake: [
                'Dolci inizi',
                'Croccante delizia',
                'Soffice e caldo',
                'Ricco cioccolato',
                'Glassatura perfetta',
                'Sopravvivi 2:30!',
                'Eleganza francese',
                'Strati cremosi',
                'Ricoperto di cioccolato',
                'Strati burrosi',
                'Infuso di caffè',
                'Rilassati e accumula punti!',
                'Delicata lievitazione',
                'Copertura caramellata',
                'Ripieno di crema',
                'Strati al miele',
                'Continua a saltare!',
                'Padronanza suprema',
                'Schiva le caramelle!',
                'Ferma la glassa!',
                'Raggiungi 50 codette!',
                'Sconfiggi lo chef!',
                'Cuoci veloce! 60 secondi!',
            ],
            astro: [
                'Primo passo nello spazio',
                'Il pianeta rosso',
                'Atmosfera rovente',
                'Tempeste giganti',
                'Bellezza ad anelli',
                'Sopravvivi 2:30!',
                'Gigante di ghiaccio',
                'Blu profondo',
                'Pianeta nano',
                'Vagabondo di ghiaccio',
                'Potenza stellare',
                'Rilassati e accumula punti!',
                'La stella più vicina',
                'Supergigante rossa',
                'La stella più luminosa',
                'Stella di neutroni rotante',
                'Continua a saltare!',
                'Orizzonte degli eventi',
                'Schiva le meteore!',
                'Ferma gli alieni!',
                'Raggiungi 50 stelle!',
                'Sconfiggi l\'entità!',
                'Velocità della luce! 60 secondi!',
            ],
        },
    },
};

// Current language
let currentLanguage = 'en';

/**
 * Initialize language system
 * @param {string} savedLanguage - Language code from storage
 */
export function initializeLanguage(savedLanguage) {
    currentLanguage = TRANSLATIONS[savedLanguage] ? savedLanguage : 'en';
}

/**
 * Get current language code
 * @returns {string}
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Get current language info
 * @returns {object}
 */
export function getCurrentLanguageInfo() {
    return LANGUAGES[currentLanguage];
}

/**
 * Set language
 * @param {string} langCode - Language code
 */
export function setLanguage(langCode) {
    if (TRANSLATIONS[langCode]) {
        currentLanguage = langCode;
    }
}

/**
 * Cycle to next language
 * @returns {string} New language code
 */
export function cycleLanguage() {
    const langCodes = Object.keys(LANGUAGES);
    const currentIndex = langCodes.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % langCodes.length;
    currentLanguage = langCodes[nextIndex];
    return currentLanguage;
}

/**
 * Get translation by key path
 * @param {string} path - Dot-separated path like "menu.classic"
 * @param {object} params - Optional parameters for interpolation
 * @returns {string}
 */
export function t(path, params = {}) {
    const keys = path.split('.');
    let value = TRANSLATIONS[currentLanguage];

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            // Fallback to English
            value = TRANSLATIONS.en;
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return path; // Return path if not found
                }
            }
            break;
        }
    }

    // Interpolate parameters
    if (typeof value === 'string' && Object.keys(params).length > 0) {
        for (const [key, val] of Object.entries(params)) {
            value = value.replace(`{${key}}`, val);
        }
    }

    return value;
}

/**
 * Get all available languages
 * @returns {object[]}
 */
export function getAvailableLanguages() {
    return Object.values(LANGUAGES);
}
