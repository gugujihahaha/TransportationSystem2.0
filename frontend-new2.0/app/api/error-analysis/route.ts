import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  const exp = request.nextUrl.searchParams.get('exp') || 'exp2';
  const filePath = path.join(process.cwd(), 'public', 'evaluation_results', exp, 'error_analysis.csv');
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(1);
    const pairs: Record<string, number> = {};
    lines.forEach(line => {
      if (!line.trim()) return;
      const [trueLabel, predLabel] = line.split(',');
      const key = `${trueLabel} → ${predLabel}`;
      pairs[key] = (pairs[key] || 0) + 1;
    });
    const result = Object.entries(pairs)
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}