import { pipeline, env } from '@xenova/transformers';

// Configure local cache if needed
env.allowLocalModels = false;

let extractorPipeline: any = null;

export async function getEmbeddingPipeline() {
  if (!extractorPipeline) {
    console.log('Loading local embedding model (Xenova/all-MiniLM-L6-v2)...');
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
