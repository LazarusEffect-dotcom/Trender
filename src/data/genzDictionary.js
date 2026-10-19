// GenZ Market & Trading Dictionary
// Short, crisp, high-signal explanations of stocks, trading, macroeconomics, and graphs.

export const GENZ_TERMS = [
  // --- TRADING & STOCKS ---
  {
    term: "Bull Market / Bullish",
    category: "Trading & Stocks",
    emoji: "🚀",
    genzShort: "Stonks only go up. Pure main character energy.",
    definition: "Everything is green, vibes are immaculate, everyone thinks they're Warren Buffett, and diamond hands are flexing. Dip buyers keep eating.",
    example: "Nvidia ripping another +15% after earnings? Certified bull run behaviour, no cap.",
    antonym: "Bearish (Down Bad)"
  },
  {
    term: "Bear Market / Bearish",
    category: "Trading & Stocks",
    emoji: "📉",
    genzShort: "Giving recession vibes. Everything is down bad.",
    definition: "Prices dropping 20%+ from peaks. Panic sellers getting cooked, portfolio bleeding red, everyone saying 'cash is king' and telling you to touch grass.",
    example: "Portfolio down 30% in a month? You're surviving a certified bear winter.",
    antonym: "Bullish (To the Moon)"
  },
  {
    term: "FOMO (Fear Of Missing Out)",
    category: "Trading & Stocks",
    emoji: "😭",
    genzShort: "Buying the top because TikTok hyped it up.",
    definition: "Seeing everyone on Instagram flex 500% gains, panicking that you're left behind, and hitting market-buy right at the absolute peak before it crashes.",
    example: "Buying a viral meme stock after it already 10x'd? Classic textbook FOMO.",
    antonym: "Disciplined DCA"
  },
  {
    term: "S&P 500 (^GSPC)",
    category: "Trading & Stocks",
    emoji: "👑",
    genzShort: "The ultimate 500 company squad. The main character of the US economy.",
    definition: "A basket of America's 500 biggest corporations (Apple, Microsoft, Amazon, Nvidia). If the S&P 500 is chilling, the whole economy is chilling.",
    example: "Boring index funds beat 90% of day traders over 10 years. S&P 500 is the undefeated cheat code.",
    antonym: "Penny Stocks"
  },
  {
    term: "Nasdaq Composite (^IXIC)",
    category: "Trading & Stocks",
    emoji: "💻",
    genzShort: "Tech bro headquarters. High beta, high drama.",
    definition: "Index dominated by heavy tech, AI, cloud, and semiconductor giants. Moves fast, swings wildly, and gets extra twitchy whenever the Fed touches interest rates.",
    example: "AI hype train left the station? Nasdaq is the locomotive pulling the entire market.",
    antonym: "Dow Jones (Boomer Stocks)"
  },
  {
    term: "ETF (Exchange-Traded Fund)",
    category: "Trading & Stocks",
    emoji: "📦",
    genzShort: "A Spotify playlist, but for stonks.",
    definition: "Instead of betting all your money on one company and having an anxiety attack, you buy one ticket that owns hundreds of companies at once.",
    example: "Buying XLK gets you instant exposure to all tech stocks without picking single winners.",
    antonym: "Single Stock YOLO"
  },
  {
    term: "Market Cap (Capitalization)",
    category: "Trading & Stocks",
    emoji: "🏷️",
    genzShort: "The price tag to buy out the entire company.",
    definition: "Share price multiplied by total shares. Micro-cap = indie starter pack; Mega-cap (\$1T+) = final boss tier like Apple or Microsoft.",
    example: "Apple at \$3 Trillion market cap means it's worth more than the entire GDP of most nations.",
    antonym: "Stock Price (which doesn't tell company size)"
  },
  {
    term: "Volatility",
    category: "Trading & Stocks",
    emoji: "🎢",
    genzShort: "Emotional damage on a chart.",
    definition: "How violently price swings up and down. Low volatility = sleeping baby; High volatility = rollercoaster in a thunderstorm (crypto vibes).",
    example: "Bitcoin swinging \$5,000 in an afternoon is standard weekend volatility.",
    antonym: "Stability / Flatline"
  },
  {
    term: "Short Selling",
    category: "Trading & Stocks",
    emoji: "😈",
    genzShort: "Betting on someone's downfall and getting paid for it.",
    definition: "Borrowing shares, selling them immediately, hoping the price tanks so you can buy them back cheaper and pocket the difference. High-risk villain arc.",
    example: "Hedge funds shorted GameStop, got caught in a short squeeze, and lost billions to retail traders.",
    antonym: "Going Long"
  },
  {
    term: "Market Breadth",
    category: "Trading & Stocks",
    emoji: "🤝",
    genzShort: "Is the whole squad winning, or just Nvidia carrying?",
    definition: "Measures how many individual stocks are actually going up versus just 3 giant mega-caps inflating the index while the rest flop.",
    example: "S&P 500 is green but 400 stocks are red? That's terrible market breadth.",
    antonym: "Top-Heavy Concentration"
  },
  {
    term: "Alpha",
    category: "Trading & Stocks",
    emoji: "🧠",
    genzShort: "Beating the market on pure skill.",
    definition: "The extra return you generate beyond what the market benchmark provided. Having positive alpha means you're actually cracked at investing.",
    example: "The market did 10% but your portfolio did 28%? You generated pure alpha.",
    antonym: "Beta (Just riding the wave)"
  },
  {
    term: "Beta",
    category: "Trading & Stocks",
    emoji: "⚡",
    genzShort: "How twitchy a stock is compared to the S&P 500.",
    definition: "Beta of 1.0 moves exactly with the market. Beta of 2.0 jumps twice as high and crashes twice as hard. High beta = hold onto your seat.",
    example: "Tesla has high beta; when tech sneezes, Tesla catches pneumonia.",
    antonym: "Uncorrelated Asset"
  },

  // --- GRAPHS & TECHNICAL ANALYSIS ---
  {
    term: "Area Chart / Mountain Chart",
    category: "Graphs & Charts",
    emoji: "🏔️",
    genzShort: "The visual vibe-check over time.",
    definition: "A filled line graph showing price trajectory. Smooth gradient fill underneath gives instant visual weight to trends—green mountain = building wealth, cliff = oof.",
    example: "Trender's S&P 500 area chart shows you the smooth 5-day trajectory without the noise.",
    antonym: "Tick-by-tick noise"
  },
  {
    term: "Candlestick Chart",
    category: "Graphs & Charts",
    emoji: "🕯️",
    genzShort: "The battle receipt for each trading session.",
    definition: "Each candle shows Open, High, Low, and Close. The 'body' shows who won (buyers or sellers) and the 'wicks' show how far they pushed before getting pushed back.",
    example: "A long green candle with no upper wick means buyers were in total control all day.",
    antonym: "Simple Line Chart"
  },
  {
    term: "Support & Resistance",
    category: "Graphs & Charts",
    emoji: "🧱",
    genzShort: "The trampoline floor and the concrete ceiling.",
    definition: "Support is the price level where dip-buyers swarm in to stop the fall. Resistance is the ceiling where profit-takers dump and bonk the price back down.",
    example: "Bitcoin kept bouncing off \$60,000 like a trampoline—that's unbreakable support.",
    antonym: "Breakout into Freefall"
  },
  {
    term: "Moving Average (MA / EMA)",
    category: "Graphs & Charts",
    emoji: "〰️",
    genzShort: "Noise-cancelling headphones for market trends.",
    definition: "Smooths out day-to-day erratic chaos by averaging the last 20, 50, or 200 days. If price is above the 200-day line, long-term trend is still alive.",
    example: "Golden cross happens when short-term moving average crosses above long-term—bulls rejoice.",
    antonym: "Intraday Whipsaw"
  },

  // --- MACRO & CONSUMER TRENDS ---
  {
    term: "Inflation (CPI)",
    category: "Macro & Economics",
    emoji: "💸",
    genzShort: "Why your iced matcha latte is \$9 now.",
    definition: "The rate at which money loses its purchasing power against real goods. High CPI = your dollar gets nerfed while grocery bills level up.",
    example: "When inflation hit 8%, store brands and dollar stores saw a massive surge in foot traffic.",
    antonym: "Deflation"
  },
  {
    term: "GDP Growth",
    category: "Macro & Economics",
    emoji: "🌐",
    genzShort: "The entire country's economic grindset scorecard.",
    definition: "Gross Domestic Product: total cash value of all goods and services produced in a year. India at 7%+ means rapid growth; negative GDP means recession.",
    example: "World Bank data lets you compare which country's economy is actually cooking.",
    antonym: "Economic Contraction"
  },
  {
    term: "Hype Velocity",
    category: "Viral Trends",
    emoji: "🔥",
    genzShort: "Zero to sold-out on TikTok in 72 hours.",
    definition: "The speed at which a product or aesthetic moves from niche creator discovery to viral saturation, stockouts, and mainstream craze.",
    example: "Labubu bag charms had insane hype velocity after Blackpink Lisa posted them.",
    antonym: "Slow Burn Word of Mouth"
  },
  {
    term: "Resale Markup",
    category: "Viral Trends",
    emoji: "🏷️",
    genzShort: "Scalper math. Limited drop tax.",
    definition: "The percentage premium between official retail price and what desperate buyers are paying on StockX, eBay, or Depop during a stockout.",
    example: "Buying a \$28 blind box and flipping it for \$160 is a +471% resale markup.",
    antonym: "Clearance Discount"
  },
  {
    term: "Dupe Culture",
    category: "Viral Trends",
    emoji: "👯",
    genzShort: "Why pay \$600 when the \$40 Amazon version eats?",
    definition: "Consumers actively celebrating affordable alternatives to luxury items (e.g. Zara duping designer coats, e.l.f. duping high-end makeup).",
    example: "Gen Z made buying dupes a flex rather than a secret, destroying luxury brand margins.",
    antonym: "Status Gatekeeping"
  }
];

export const GENZ_CATEGORIES = [
  "All Terms",
  "Trading & Stocks",
  "Graphs & Charts",
  "Macro & Economics",
  "Viral Trends"
];
