import { pipeline } from '@xenova/transformers';

let sentimentPipeline: any = null;

/**
 * Initialize the sentiment analysis pipeline
 */
async function initSentimentPipeline() {
    if (!sentimentPipeline) {
        sentimentPipeline = await pipeline(
            'sentiment-analysis',
            'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
        );
    }
    return sentimentPipeline;
}

/**
 * Analyze sentiment of a single text
 */
export async function analyzeSentiment(text: string): Promise<{ label: string; score: number }> {
    const pipeline = await initSentimentPipeline();
    const results = await pipeline(text);
    return results[0];
}

/**
 * Analyze sentiment of multiple reviews and return breakdown
 */
export async function analyzeReviews(reviews: string[]): Promise<{
    positive: number;
    negative: number;
    total: number;
}> {
    if (reviews.length === 0) {
        return { positive: 0, negative: 0, total: 0 };
    }

    const pipeline = await initSentimentPipeline();

    let positiveCount = 0;
    let negativeCount = 0;

    // Analyze reviews in batches to avoid overwhelming the model
    const batchSize = 5;
    for (let i = 0; i < reviews.length; i += batchSize) {
        const batch = reviews.slice(i, i + batchSize);
        const results = await Promise.all(
            batch.map(review => pipeline(review.substring(0, 512))) // Limit to 512 chars
        );

        results.forEach((result: any) => {
            if (result[0].label === 'POSITIVE') {
                positiveCount++;
            } else {
                negativeCount++;
            }
        });
    }

    const total = positiveCount + negativeCount;
    const positivePercent = total > 0 ? (positiveCount / total) * 100 : 0;
    const negativePercent = total > 0 ? (negativeCount / total) * 100 : 0;

    return {
        positive: Math.round(positivePercent),
        negative: Math.round(negativePercent),
        total
    };
}
