import fs from 'fs';
import path from 'path';
import type { Guide } from './types';

const GUIDES_DIR = path.join(process.cwd(), 'data', 'guides');
const TMP_DIR = path.join('/tmp', 'oauth-guides');

// Global in-memory cache so newly generated guides in serverless runtime are instantly accessible
const memoryGuides = new Map<string, Guide>();

function ensureTmpDir() {
  try {
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
}

export function getAllGuides(): Guide[] {
  const map = new Map<string, Guide>();

  // 1. Read pre-baked guides from data/guides
  try {
    if (fs.existsSync(GUIDES_DIR)) {
      const files = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith('.json'));
      for (const f of files) {
        try {
          const raw = fs.readFileSync(path.join(GUIDES_DIR, f), 'utf-8');
          const guide = JSON.parse(raw) as Guide;
          map.set(guide.id, guide);
        } catch {
          // ignore individual file error
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. Read from /tmp if present
  try {
    if (fs.existsSync(TMP_DIR)) {
      const tmpFiles = fs.readdirSync(TMP_DIR).filter((f) => f.endsWith('.json'));
      for (const f of tmpFiles) {
        try {
          const raw = fs.readFileSync(path.join(TMP_DIR, f), 'utf-8');
          const guide = JSON.parse(raw) as Guide;
          map.set(guide.id, guide);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }

  // 3. Overlay in-memory guides
  for (const [id, guide] of memoryGuides.entries()) {
    map.set(id, guide);
  }

  return Array.from(map.values()).sort((a, b) => a.difficulty_score - b.difficulty_score);
}

export function getGuideById(id: string): Guide | null {
  // Check memory first
  if (memoryGuides.has(id)) {
    return memoryGuides.get(id)!;
  }

  // Check /tmp
  try {
    const tmpPath = path.join(TMP_DIR, `${id}.json`);
    if (fs.existsSync(tmpPath)) {
      const raw = fs.readFileSync(tmpPath, 'utf-8');
      const guide = JSON.parse(raw) as Guide;
      memoryGuides.set(id, guide);
      return guide;
    }
  } catch {
    // ignore
  }

  // Check data/guides
  try {
    const filePath = path.join(GUIDES_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const guide = JSON.parse(raw) as Guide;
      memoryGuides.set(id, guide);
      return guide;
    }
  } catch {
    // ignore
  }

  return null;
}

export function saveGuide(guide: Guide): void {
  // Always store in memory
  memoryGuides.set(guide.id, guide);

  // Try writing to data/guides (local dev)
  let wroteToData = false;
  try {
    if (fs.existsSync(GUIDES_DIR)) {
      const filePath = path.join(GUIDES_DIR, `${guide.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(guide, null, 2), 'utf-8');
      wroteToData = true;
    }
  } catch {
    // Likely read-only filesystem (Vercel)
  }

  // If not written to data, write to /tmp
  if (!wroteToData) {
    try {
      ensureTmpDir();
      const tmpPath = path.join(TMP_DIR, `${guide.id}.json`);
      fs.writeFileSync(tmpPath, JSON.stringify(guide, null, 2), 'utf-8');
    } catch {
      // Memory store is already populated
    }
  }
}
