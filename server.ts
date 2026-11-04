import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Live Customer Support & Diagnostics Specialist Chatbot
app.post('/api/gemini/support', async (req, res) => {
  try {
    const { messages, userVehicle, currentContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemInstruction = `You are the Apex Tesla Hub AI Concierge & Senior Service Specialist.
Apex Tesla Hub is a premier all-in-one ecosystem for Tesla owners and enthusiasts offering:
1. Scheduled Maintenance & Mechanical Fixes: HV battery health checks, drive unit diagnostics, brake fluid flush, HEPA filter replacement, suspension alignment, Ranger mobile dispatch.
2. Customization & Styling: Bespoke color wraps (Stealth Satin Black, Liquid Silver Chrome, Miami Blue, British Racing Green, Forged Carbon), full-body Paint Protection Film (PPF), ceramic coatings, forged wheels, aero spoilers, yoke steering wheel retrofits.
3. Fleet Rentals: High-performance Tesla fleet including Cybertruck Cyberbeast, Model S Plaid (1,020 HP), Roadster Founders Edition, Model X Tri-Motor, and Model Y Performance.
4. Vehicle & Fleet Investment: Decentralized fleet revenue-sharing pools, Supercharger node staking with up to 18.5% APY, daily crypto dividend distributions.
5. Promotions: Daily Spin-and-Win Wheel (credits, Tesla merchandise, car giveaways) and Purchasable Scratch & Win cards ($50 to $8,000 max winnings).
6. Crypto Payments: Instant deposits and service settlements via BTC, USDT (TRC20/ERC20), XRP, BNB, and ETH.
7. Ambassador & Referral Rewards: Every registered customer gets a unique invite link and custom referral code. When a friend signs up and completes their first deposit, the referrer receives $100 Platform Credits directly into their vault plus 2 Free Wheel Spins. The friend receives a $25 welcome service credit and 5 Free Spins upon sign up.

Customer context:
${userVehicle ? `Current User Vehicle: ${JSON.stringify(userVehicle)}` : 'Customer vehicle: Not specified'}
${currentContext ? `Active Context: ${currentContext}` : ''}

Tone: Futuristic, highly technical, courteous, confident, and concise. Format responses with neat bullet points, markdown bold highlights, and clear next steps. If a diagnostic issue or service is discussed, recommend booking a service slot or consulting our mobile ranger technicians.`;

    // Format conversation history for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      return res.json({ text: response.text });
    } else {
      // Graceful fallback if API key is pending
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "Welcome to Apex Tesla Hub Service. Our technicians are ready to assist with your Model S, 3, X, Y, Cybertruck, or Roadster. How can we optimize your vehicle today?";
      if (lastUserMsg.includes('referral') || lastUserMsg.includes('invite') || lastUserMsg.includes('friend')) {
        reply = "You can earn $100 Platform Credits directly in your dashboard vault for every friend who joins via your unique invite link and makes their first deposit! Your friend also gets $25 welcome credits and 5 free promotional spins. Access your link anytime in the **Refer & Earn** tab.";
      } else if (lastUserMsg.includes('wrap') || lastUserMsg.includes('color')) {
        reply = "Our custom wrap studio offers premium 3M and Avery Dennison 3.2mil cast vinyl wraps, including Satin Stealth Black, Liquid Chrome, and Forged Carbon fiber. Full body wrap packages include a 5-year warranty against peeling and UV discoloration. You can preview colors directly in our Custom Studio tab!";
      } else if (lastUserMsg.includes('battery') || lastUserMsg.includes('range') || lastUserMsg.includes('charge')) {
        reply = "For high-voltage battery health, we recommend keeping daily charging limits between 80-90% unless preparing for long road trips. We also perform cell impedance profiling and thermal management pump flushes during routine 24-month inspections.";
      } else if (lastUserMsg.includes('rent') || lastUserMsg.includes('cybertruck')) {
        reply = "Our rental fleet features top-tier trims including the Cybertruck Cyberbeast ($299/day) and Model S Plaid ($249/day). Every rental includes unlimited Supercharging access and Full Self-Driving (Supervised) capability.";
      } else if (lastUserMsg.includes('crypto') || lastUserMsg.includes('deposit') || lastUserMsg.includes('pay')) {
        reply = "We accept BTC, USDT, XRP, and BNB directly through your personalized user dashboard. Deposits are credited instantly upon 3 network confirmations with zero platform processing fees.";
      }
      return res.json({ text: reply });
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in support chatbot:', error);
    return res.status(500).json({
      error: 'Failed to generate response',
      details: error?.message || 'Unknown error',
    });
  }
});

// Admin Ops & Fleet Management AI Copilot
app.post('/api/gemini/admin', async (req, res) => {
  try {
    const { prompt, adminStats } = req.body;

    const systemInstruction = `You are the Apex Tesla Hub Executive Fleet Operations & Intelligence AI.
You help platform administrators oversee:
- Active service bays and mobile Ranger dispatch efficiency
- Fleet rental telemetry, utilization rate, and maintenance scheduling
- Crypto deposit reconciliation (BTC, USDT, XRP, BNB) and wallet hot/cold vault reserves
- Vehicle investment pool staking APY performance and automated dividend payouts
- Spin-and-Win & Scratch card prize liquidity balance and fraud prevention
- Parts & custom wrap vinyl roll inventory stock levels

Respond with crisp executive summaries, data-driven suggestions, operational status flags, and actionable recommendations.`;

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            parts: [
              {
                text: `Platform Real-time Stats: ${JSON.stringify(adminStats || {})}\n\nAdmin Prompt: ${prompt}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction,
        },
      });

      return res.json({ text: response.text });
    } else {
      return res.json({
        text: `**Fleet Intelligence Briefing:**\n- All 18 Service Bays Operating at 92% efficiency.\n- Active Rental Fleet: 24/28 units booked (85.7% utilization).\n- Crypto Inflow (24h): +4.28 BTC, +14,200 USDT, +8,400 XRP processed with 100% on-chain verification.\n- Recommended Action: Restock Satin Stealth Black 3M Vinyl rolls and allocate 2 extra Mobile Rangers for Fremont & Austin service zones.`,
      });
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in admin assistant:', error);
    return res.status(500).json({
      error: 'Failed to generate admin analysis',
      details: error?.message || 'Unknown error',
    });
  }
});

// Tesla Diagnostic Code & Symptom Scanner
app.post('/api/gemini/diagnostics', async (req, res) => {
  try {
    const { query, modelYear } = req.body;

    const prompt = `Perform an instant diagnostic breakdown for this Tesla issue/code:
Vehicle: ${modelYear || 'Tesla Generic'}
Symptom or Error Code: ${query}

Provide a concise breakdown:
1. Probable Root Cause
2. Urgency Level (Low, Medium, Critical)
3. Estimated Repair Time & Cost Range
4. DIY / Reset Step (if safe, e.g. scroll-wheel reset or power cycle)
5. Service Bay Recommendation`;

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an ASE-certified master Tesla diagnostic engineer with deep expertise in CAN bus signals, thermal loops, High Voltage pyrofuses, and motor inverters.',
        },
      });

      return res.json({ analysis: response.text });
    } else {
      return res.json({
        analysis: `### Diagnostic Analysis for: ${query}
- **Probable Root Cause**: High Voltage Contactors or 16V Low Voltage Li-ion subsystem warning flag.
- **Urgency Level**: Medium - Safe to drive to nearest service hub within 72 hours.
- **Estimated Service Time**: 1.5 - 3 hours.
- **Recommended Action**: Book Bay 4 diagnostic scan or dispatch a Mobile Ranger. Schedule appointment via your Apex Dashboard.`,
      });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(500).json({ error: error.message });
  }
});

// Vite middleware setup for Development or Static serving for Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apex Tesla Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
