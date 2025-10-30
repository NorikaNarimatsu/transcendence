import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../user/UserContext';
import Button from '../../components/ButtonDarkPink';
import home_icon from '../../assets/icons/Home.png';

import { useLanguage } from '../../contexts/LanguageContext';

interface MatchData {
    matchID: number;
    matchType: string;
    matchMode: string;
    user1ID: number;
    user1Name: string;
    user2ID: number | null;
    user2Name: string;
    user1Score: number;
    user2Score: number;
    winnerID: number;
    winnerName: string;
    isWinner: boolean;
}

interface UserStats {
    userID: number;
    userName: string;
    overall: {
        totalMatches: number;
        wins: number;
        losses: number;
        winRate: string;
    };
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
    target?: number;
}

export default function Dashboard(): JSX.Element {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const { lang, t } = useLanguage();
    const translation = t[lang];
    
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'achievements'>('overview');

    // Calculate XP and Level
    const calculateXP = (wins: number): number => wins * 10;
    const calculateLevel = (xp: number): number => Math.floor(xp / 100) + 1;
    const getXPForNextLevel = (level: number): number => level * 100;

    // Analyze match data for achievements and streaks
    const analyzeMatches = (matches: MatchData[]) => {
        const perfectGames = matches.filter(m => 
            m.isWinner && 
            ((m.user1Score === 3 && m.user2Score === 0))
        ).length;

        // Calculate current win streak
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;

        // reverse to get chronological order
        const chronologicalMatches = [...matches].reverse();
        
        for (const match of chronologicalMatches) {
            if (match.isWinner) {
                tempStreak++;
                maxStreak = Math.max(maxStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        // Current streak is from the end of the matches (most recent)
        for (let i = matches.length - 1; i >= 0; i--) {
            if (matches[i].isWinner) {
                currentStreak++;
            } else {
                break;
            }
        }

        return {
            perfectGames,
            currentStreak,
            maxStreak
        };
    };

    // Generate achievements
    const generateAchievements = (stats: UserStats | null, matchAnalysis: any): Achievement[] => {
        const wins = stats?.overall.wins || 0;
        const totalMatches = stats?.overall.totalMatches || 0;
        
        return [
            {
                id: 'first_win',
                name: translation.pages.dashboard.firstVictory,
                description: translation.pages.dashboard.winYourFirstGame,
                icon: '🏆',
                unlocked: wins >= 1,
                progress: Math.min(wins, 1),
                target: 1
            },
            {
                id: 'ten_wins',
                name: translation.pages.dashboard.risingStar,
                description: translation.pages.dashboard.winTenGames,
                icon: '⭐️',
                unlocked: wins >= 10,
                progress: Math.min(wins, 10),
                target: 10
            },
            {
                id: 'hundred_wins',
                name: translation.pages.dashboard.champion,
                description: translation.pages.dashboard.winOnehundredGames,
                icon: '👑',
                unlocked: wins >= 100,
                progress: Math.min(wins, 100),
                target: 100
            },
            {
                id: 'perfect_game',
                name: translation.pages.dashboard.perfectGame,
                description: translation.pages.dashboard.winAMatchThreeZero,
                icon: '💎',
                unlocked: matchAnalysis.perfectGames > 0,
                progress: Math.min(matchAnalysis.perfectGames, 1),
                target: 1
            },
            {
                id: 'consistency_king',
                name: translation.pages.dashboard.consistencyKing,
                description: translation.pages.dashboard.winFiveGamesInARow,
                icon: '🔥',
                unlocked: matchAnalysis.maxStreak >= 5,
                progress: Math.min(matchAnalysis.maxStreak, 5),
                target: 5
            },
            {
                id: 'active_player',
                name: translation.pages.dashboard.activePlayer,
                description: translation.pages.dashboard.playTwentyFiveMatches,
                icon: '🎮',
                unlocked: totalMatches >= 25,
                progress: Math.min(totalMatches, 25),
                target: 25
            }
        ];
    };

    const handleBackToProfile = () => {
        navigate('/playerProfile');
    };

    // Fetch data
    useEffect(() => {
        if (!user?.userID) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch matches
                const matchesResponse = await fetch(`https://localhost:8443/user/${user.userID}/matches`);
                if (matchesResponse.ok) {
                    const matchesData = await matchesResponse.json();
                    setMatches(matchesData);
                }

                // Fetch stats
                const statsResponse = await fetch(`https://localhost:8443/user/${user.userID}/stats`);
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.userID]);

    // private route guard
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <header className="h-40 bg-blue-deep flex">
                    <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">DASHBOARD</div>
                </header>
                <section className="flex-1 bg-pink-grid flex items-center justify-center">
                    <div className="bg-pink-dark p-8 rounded-lg">
                        <p className="text-white font-pixelify text-2xl mb-4">{translation.pages.dashboard.pleaseLogInToViewDashboard}</p>
                        <button
                            onClick={() => navigate('/playerProfile')} 
                            className="bg-purple-600 hover:bg-purple-700 text-white font-pixelify px-6 py-3 rounded-lg"
                        >
                            {translation.pages.dashboard.goToProfile}
                        </button>
                    </div>
                </section>
                <footer className="h-40 bg-blue-deep"></footer>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-grid">
                <p className="text-white font-pixelify text-3xl">{translation.pages.dashboard.loadingDashboard}...</p>
            </div>
        );
    }

    const matchAnalysis = analyzeMatches(matches);
    const wins = stats?.overall.wins || 0;
    const losses = stats?.overall.losses || 0;
    const totalMatches = wins + losses;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : '0.0';
    
    const xp = calculateXP(wins);
    const level = calculateLevel(xp);
    const xpForNextLevel = getXPForNextLevel(level);
    const xpProgress = ((xp % 100) / 100) * 100;
    
    const achievements = generateAchievements(stats, matchAnalysis);
    const unlockedAchievements = achievements.filter(a => a.unlocked);

    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="h-40 bg-blue-deep flex">
                <div className="font-pixelify text-white text-opacity-25 text-7xl m-auto">DASHBOARD</div>
            </header>

            {/* Main Content */}
            <section className="flex-1 bg-pink-grid flex items-center justify-center">
                <div className="relative bg-pink-dark w-[900px] h-[600px] m-[10px] flex flex-col">
                    {/* Tab Navigation */}
                    <div className="flex p-4 gap-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 font-pixelify text-lg rounded-t-lg transition-colors ${
                                activeTab === 'overview'
                                    ? 'bg-pink-light text-white border-b-2 border-purple-light'
                                    : 'bg-pink-dark text-purple-300 hover:text-white'
                            }`}
                        >
                            {translation.pages.dashboard.overview}
                        </button>
                        <button
                            onClick={() => setActiveTab('matches')}
                            className={`px-4 py-2 font-pixelify text-lg rounded-t-lg transition-colors ${
                                activeTab === 'matches'
                                    ? 'bg-pink-light text-white border-b-2 border-purple-light'
                                    : 'bg-pink-dark text-purple-300 hover:text-white'
                            }`}
                        >
                            {translation.pages.dashboard.matches}
                        </button>
                        <button
                            onClick={() => setActiveTab('achievements')}
                            className={`px-4 py-2 font-pixelify text-lg rounded-t-lg transition-colors ${
                                activeTab === 'achievements'
                                    ? 'bg-pink-light text-white border-b-2 border-purple-light'
                                    : 'bg-pink-dark text-purple-300 hover:text-white'
                            }`}
                        >
                            {translation.pages.dashboard.achievements} ({unlockedAchievements.length})
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Player Summary */}
                                <div className="bg-pink-light p-6 rounded-lg">
                                    <div className="flex items-center gap-6 mb-6">
                                        <img 
                                            src={user.avatarUrl} 
                                            alt="Avatar" 
                                            className="w-16 h-16 rounded-full border-4 border-purple-light"
                                        />
                                        <div>
                                            <div className="font-pixelify text-blue-deep text-3xl">{user.name}</div>
                                            <div className="font-dotgothic text-blue-deep text-lg">
                                                {translation.pages.dashboard.level} {level} • {xp} XP
                                            </div>
                                        </div>
                                    </div>

                                    {/* XP Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm font-dotgothic text-blue-deep mb-2">
                                            <span>{translation.pages.dashboard.level} {level}</span>
                                            <span>{xp}/{xpForNextLevel} XP</span>
                                        </div>
                                        <div className="w-full bg-pink-dark rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${xpProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Win/Loss Visual Bars - Single Line */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-dotgothic text-blue-deep font-bold">{translation.pages.dashboard.winLossRatio}</span>
                                            <div className="flex gap-4">
                                                <span className="font-pixelify text-blue-deep text-xl font-bold">{wins}W</span>
                                                <span className="font-pixelify text-blue-deep text-xl font-bold">{losses}L</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-pink-dark rounded-full h-4 flex overflow-hidden">
                                            <div
                                                className="bg-green-500 h-4 transition-all duration-500"
                                                style={{ width: totalMatches > 0 ? `${(wins / totalMatches) * 100}%` : '50%' }}
                                            ></div>
                                            <div
                                                className="bg-red-500 h-4 transition-all duration-500"
                                                style={{ width: totalMatches > 0 ? `${(losses / totalMatches) * 100}%` : '50%' }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs font-dotgothic text-gray-500 mt-1 font-semibold">
                                            <span>{totalMatches > 0 ? `${((wins / totalMatches) * 100).toFixed(1)}%` : '0%'} {translation.pages.dashboard.wins}</span>
                                            <span>{totalMatches > 0 ? `${((losses / totalMatches) * 100).toFixed(1)}%` : '0%'} {translation.pages.dashboard.losses}</span>
                                        </div>
                                    </div>

                                    {/* Stats Summary */}
                                    <div className="grid grid-cols-4 gap-4 mt-6">
                                        <div className="text-center">
                                            <div className="font-pixelify text-blue-deep text-2xl">{totalMatches}</div>
                                            <div className="font-dotgothic text-blue-deep text-sm">{translation.pages.dashboard.totalGames}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-pixelify text-blue-deep text-2xl">{winRate}%</div>
                                            <div className="font-dotgothic text-blue-deep text-sm">{translation.pages.dashboard.winRate}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-pixelify text-blue-deep text-2xl">{matchAnalysis.currentStreak}</div>
                                            <div className="font-dotgothic text-blue-deep text-sm">{translation.pages.dashboard.currentStreak}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-pixelify text-blue-deep text-2xl">{matchAnalysis.perfectGames}</div>
                                            <div className="font-dotgothic text-blue-deep text-sm">{translation.pages.dashboard.perfectGames}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Achievements */}
                                <div className="bg-pink-light p-4 rounded-lg">
                                    <h3 className="font-pixelify text-blue-deep text-xl mb-4">{translation.pages.dashboard.recentAchievements}</h3>
                                    <div className="flex gap-3 overflow-x-auto">
                                        {unlockedAchievements.slice(-4).map((achievement) => (
                                            <div key={achievement.id} className="flex-shrink-0 bg-pink-dark p-3 rounded-lg text-center min-w-[100px]">
                                                <div className="text-2xl mb-1">{achievement.icon}</div>
                                                <div className="font-dotgothic text-blue-deep text-xs font-bold">{achievement.name}</div>
                                            </div>
                                        ))}
                                        {unlockedAchievements.length === 0 && (
                                            <div className="text-purple-300 font-dotgothic">{translation.pages.dashboard.noAchievementsUnlockedYet}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'matches' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-pixelify text-white text-2xl">{translation.pages.dashboard.matchHistory}</h2>
                                    <p className="font-dotgothic text-blue-deep">
                                        {matches.length} {translation.pages.dashboard.totalMatches}
                                    </p>
                                </div>
                                
                                {matches.length > 0 ? (
                                    <div className="space-y-4">
                                        {matches.map((match, index) => (
                                            <div
                                                key={match.matchID}
                                                className={`p-4 rounded-lg border-l-4 ${
                                                    match.isWinner
                                                        ? 'bg-green-900 bg-opacity-30 border-green-500'
                                                        : 'bg-red-900 bg-opacity-30 border-red-500'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <div className="font-dotgothic text-purple-300 text-sm">
                                                            #{matches.length - index}
                                                        </div>
                                                        <div className={`px-3 py-1 rounded font-pixelify text-sm ${
                                                            match.matchType === 'pong' 
                                                                ? 'bg-blue-600 text-white' 
                                                                : 'bg-purple-600 text-white'
                                                        }`}>
                                                            {match.matchType.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-dotgothic text-white font-bold">
                                                                {match.matchMode === 'single' ? 'Single Player' : '2 Players'}
                                                            </div>
                                                            <div className="font-dotgothic text-purple-300 text-sm">
                                                                vs {match.user2Name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-right">
                                                        <div className="font-pixelify text-white text-xl mb-1">
                                                            {match.user1Score} - {match.user2Score}
                                                        </div>
                                                        <div className={`font-dotgothic text-sm font-bold ${
                                                            match.isWinner ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                            {match.isWinner ? 'WIN' : 'LOSS'}
                                                            {match.isWinner && match.user1Score === 3 && match.user2Score === 0 && (
                                                                <span className="ml-2 text-yellow-400">DIAMOND PERFECT</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="font-pixelify text-purple-300 text-2xl mb-4">{translation.pages.dashboard.noMatchesFound}</p>
                                        <p className="font-dotgothic text-white mb-6">{translation.pages.dashboard.startPlayingToSeeYourMatchHistory}</p>
                                        <button
                                            onClick={() => navigate('/playerProfile')}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-pixelify px-6 py-3 rounded-lg"
                                        >
                                            {translation.pages.dashboard.playGames}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div>
                                <h2 className="font-pixelify text-white text-2xl mb-6">
                                    {translation.pages.dashboard.achievements} ({unlockedAchievements.length}/{achievements.length})
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {achievements.map((achievement) => (
                                        <div
                                            key={achievement.id}
                                            className={`p-4 rounded-lg border-2 ${
                                                achievement.unlocked
                                                    ? 'bg-yellow-900 bg-opacity-30 border-yellow-500'
                                                    : 'bg-gray-900 bg-opacity-30 border-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                                                    {achievement.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-pixelify text-lg ${
                                                        achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'
                                                    }`}>
                                                        {achievement.name}
                                                    </div>
                                                    <div className={`font-dotgothic text-sm ${
                                                        achievement.unlocked ? 'text-white' : 'text-gray-500'
                                                    }`}>
                                                        {achievement.description}
                                                    </div>
                                                    {achievement.target && achievement.progress !== undefined && (
                                                        <div className="mt-2">
                                                            <div className="flex justify-between text-xs font-dotgothic text-purple-300 mb-1">
                                                                <span>{translation.pages.dashboard.progress}</span>
                                                                <span>{achievement.progress}/{achievement.target}</span>
                                                            </div>
                                                            <div className="w-full bg-pink-dark rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-500 ${
                                                                        achievement.unlocked ? 'bg-yellow-500' : 'bg-purple-500'
                                                                    }`}
                                                                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="h-40 bg-blue-deep flex justify-center items-center">
                <Button onClick={handleBackToProfile} className="!mt-0">
                  <img src={home_icon} alt="Home" className="h-8 w-auto"/>
              </Button>
            </footer>
        </main>
    );
}