import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const exp = searchParams.get('exp') || 'exp2';
  const trueLabel = (searchParams.get('trueLabel') || '').trim();

  console.log('[API] Received request:', { exp, trueLabel });

  if (!trueLabel) {
    return NextResponse.json({ error: 'Missing trueLabel' }, { status: 400 });
  }

  const csvPath = path.join(process.cwd(), 'public', 'evaluation_results', exp, `predictions_${exp}.csv`);
  console.log('[API] Looking for CSV at:', csvPath);

  if (!fs.existsSync(csvPath)) {
    console.log('[API] CSV file not found, using mock');
    return NextResponse.json(generateMockPrediction(trueLabel));
  }

  const results: any[] = [];
  const stream = fs.createReadStream(csvPath).pipe(csv());

  for await (const rawRow of stream) {
    // 清理键名中的 BOM 和其他不可见字符
    const cleanedRow: any = {};
    for (const [key, value] of Object.entries(rawRow)) {
      const cleanKey = key.replace(/^\uFEFF/, '').trim();
      cleanedRow[cleanKey] = value;
    }

    // 打印第一行用于调试
    if (results.length === 0) {
      console.log('[API] Cleaned sample row:', cleanedRow);
    }

    // 获取 true_label 字段（多种可能）
    const trueLabelInRow = cleanedRow.true_label || cleanedRow['true label'] || cleanedRow.trueLabel || cleanedRow.true;
    if (!trueLabelInRow) continue;

    const cleanTrueLabel = String(trueLabelInRow).trim();
    if (cleanTrueLabel === trueLabel) {
      results.push(cleanedRow);
    }
  }

  console.log('[API] Found', results.length, 'matches for', trueLabel);

  if (results.length === 0) {
    console.log('[API] No matches, using mock');
    return NextResponse.json(generateMockPrediction(trueLabel));
  }

  const randomRow = results[Math.floor(Math.random() * results.length)];
  const predLabel = randomRow.pred_label || randomRow['pred label'] || randomRow.predLabel || randomRow.predicted;
  const confidence = parseFloat(randomRow.confidence || randomRow.conf || randomRow.score || '0.9');

  return NextResponse.json({
    prediction: predLabel,
    confidence: isNaN(confidence) ? 0.9 : confidence,
    trueLabel: trueLabel,
  });
}

function generateMockPrediction(trueLabel: string) {
  return {
    prediction: trueLabel,
    confidence: 0.95,
    trueLabel: trueLabel,
  };
}