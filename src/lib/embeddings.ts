import os from 'os';
import path from 'path';

let extractorPipeline: any = null;

export async function getEmbeddingPipeline() {
  if (!extractorPipeline) {
    console.log('Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
    const { pipeline, env } = await import('@xenova/transformers');
    env.allowLocalModels = false;
    env.cacheDir = path.join(os.tmpdir(), '.cache');
    extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded successfully.');
  }
  return extractorPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const pipe = await getEmbeddingPipeline();
  const results: number[][] = [];
  
  // Process sequentially or in sub-batches to prevent memory pressure
  for (const text of texts) {
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    results.push(Array.from(output.data));
  }
  return results;
}
