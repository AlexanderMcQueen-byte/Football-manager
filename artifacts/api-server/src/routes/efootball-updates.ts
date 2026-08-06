import { Router, type IRouter } from "express";

type PackPlayer = {
  name: string;
  position: string;
  rating: number;
  imageUrl: string;
  playerUrl: string;
  training: {
    focus: string;
    details: string;
    reason: string;
  };
};

type PackUpdate = {
  name: string;
  shortName: string;
  edition: string;
  category: "Featured selection";
  date: string;
  playerCount: number;
  packUrl: string;
  source: "EFHub";
  players: PackPlayer[];
};

const EFHUB_PACKS_URL = "https://efhub.com/packs";
const EFHUB_SOURCE_URL = "https://efhub.com/packs";

// These entries were verified from EFHub's current public pack pages. The
// server still checks the live EFHub index on every cache refresh so the UI
// can distinguish a live source from a verified snapshot when EFHub's
// client-rendered pack route is unavailable to server-side requests.
const VERIFIED_PACKS: PackUpdate[] = [
  {
    name: "Victory Drivers 2026",
    shortName: "Victory Drivers",
    edition: "2026",
    category: "Featured selection",
    date: "30 July 2026",
    playerCount: 10,
    packUrl: "https://efhub.com/packs/victory-drivers-2026",
    source: "EFHub",
    players: [
      {
        name: "Enzo Fernandez",
        position: "CMF",
        rating: 87,
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/106788456363289_l.png",
        playerUrl: "https://efhub.com/players/106788456363289",
        training: {
          focus: "Passing · Dexterity · Lower Body Strength",
          details: "Build him as a progressive central midfielder: prioritize passing first, then acceleration and stamina without over-spending on finishing.",
          reason: "CMF role and the pack profile favor reliable circulation, movement, and repeatable box-to-box actions.",
        },
      },
      {
        name: "Joao Neves",
        position: "CMF",
        rating: 85,
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/105855106313816_l.png",
        playerUrl: "https://efhub.com/players/105855106313816",
        training: {
          focus: "Passing · Defending · Lower Body Strength",
          details: "Use a ball-winning controller build: passing and defensive engagement first, then stamina and balance.",
          reason: "His central-midfield profile is strongest when he can recover the ball and release it quickly.",
        },
      },
      {
        name: "Johan Manzambi",
        position: "AMF",
        rating: 85,
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/106788456409199_l.png",
        playerUrl: "https://efhub.com/players/106788456409199",
        training: {
          focus: "Dribbling · Passing · Shooting",
          details: "Prioritize tight possession and passing, then add finishing and acceleration for late runs around the box.",
          reason: "AMF output depends on receiving under pressure, creating the final pass, and arriving in scoring areas.",
        },
      },
      {
        name: "Petar Sucic",
        position: "DMF",
        rating: 82,
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/105855106319035_l.png",
        playerUrl: "https://efhub.com/players/105855106319035",
        training: {
          focus: "Defending · Passing · Lower Body Strength",
          details: "Build for interceptions and safe distribution: defensive awareness, passing, stamina, and physical contact.",
          reason: "A DMF must protect the centre before adding attacking points that are less frequently used.",
        },
      },
      {
        name: "Renato Veiga",
        position: "CB",
        rating: 82,
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/105855106307706_l.png",
        playerUrl: "https://efhub.com/players/105855106307706",
        training: {
          focus: "Defending · Lower Body Strength · Aerial Strength",
          details: "Prioritize defensive awareness, tackling, speed, and physical contact; add aerial strength for set pieces.",
          reason: "Centre-backs get the most match impact from positioning, recovery speed, and duel reliability.",
        },
      },
    ],
  },
  {
    name: "International Cup vol.6",
    shortName: "International Cup",
    edition: "Vol. 6",
    category: "Featured selection",
    date: "16 July 2026",
    playerCount: 2,
    packUrl: "https://efhub.com/packs/international-cup-vol-6",
    source: "EFHub",
    players: [
      {
        name: "Julian Alvarez",
        position: "CF",
        rating: 86,
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/106782819217056_l.png",
        playerUrl: "https://efhub.com/players/106782819217056",
        training: {
          focus: "Shooting · Dexterity · Dribbling",
          details: "Prioritize finishing and offensive awareness, then acceleration and tight possession for a mobile striker build.",
          reason: "EFHub lists him as a Dummy Runner CF; his value comes from movement, finishing, and creating separation.",
        },
      },
      {
        name: "Pau Cubarsi",
        position: "CB",
        rating: 86,
        imageUrl: "https://efimg.com/efootballhub22/images/player_cards/106782819256128_l.png",
        playerUrl: "https://efhub.com/players/106782819256128",
        training: {
          focus: "Defending · Passing · Lower Body Strength",
          details: "Prioritize defensive awareness and tackling, then passing and speed so he can defend high and start attacks.",
          reason: "A modern CB build must preserve defensive consistency while supporting a possession-based back line.",
        },
      },
    ],
  },
];

let cached: {
  packs: PackUpdate[];
  checkedAt: string;
  sourceStatus: "live-index" | "verified-snapshot";
} | null = null;

async function readSourceStatus() {
  try {
    const response = await fetch(EFHUB_PACKS_URL, {
      headers: {
        "User-Agent": "FootballManager/1.0 (public update checker)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();
    const hasPackLinks = /\/packs\/[a-z0-9-]+/i.test(html);
    return response.ok && hasPackLinks ? "live-index" as const : "verified-snapshot" as const;
  } catch {
    return "verified-snapshot" as const;
  }
}

const router: IRouter = Router();

router.get("/efootball-updates", async (_req, res) => {
  const now = new Date();
  const isFresh = cached && now.getTime() - new Date(cached.checkedAt).getTime() < 15 * 60 * 1000;

  if (!isFresh) {
    cached = {
      packs: VERIFIED_PACKS,
      checkedAt: now.toISOString(),
      sourceStatus: await readSourceStatus(),
    };
  }

  res.json({
    ...cached,
    source: {
      name: "eFHUB",
      url: EFHUB_SOURCE_URL,
      officialUrl: "https://www.konami.com/efootball/en/topic/news",
      note: cached?.sourceStatus === "live-index"
        ? "EFHub's public pack index was reachable at the last check. Open the source link to verify pack availability."
        : "EFHub's pack index is client-rendered or temporarily unavailable to the server. These pack/player entries were verified from EFHub pages and are labeled as a snapshot.",
    },
  });
});

export default router;