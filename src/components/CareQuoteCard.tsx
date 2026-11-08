import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { styles } from '@/constants/styles';
import { fetchCareQuote } from '@/services/careQuote';
import type { CareQuote } from '@/types/api';

export function CareQuoteCard() {
  const [quote, setQuote] = useState<CareQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestQuote = useCallback(() => {
    fetchCareQuote()
      .then((result) => setQuote(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    requestQuote();
  }, [requestQuote]);
  useEffect(() => { requestQuote(); }, [requestQuote]);

  return (
    <View style={styles.quoteCard}>
      <Text style={styles.greeting}>A gentle reminder</Text>
      {loading ? <View style={{ minHeight: 52, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Loading reminder" /></View> : null}
      {!loading && error ? <><Text style={[styles.cardText, styles.errorText]}>Couldn’t load a reminder right now.</Text><Pressable accessibilityRole="button" onPress={load} style={styles.textButton}><Text style={styles.textButtonText}>Try again</Text></Pressable></> : null}
      {!loading && quote ? <><Text style={styles.quoteMark}>“</Text><Text style={styles.quoteText}>{quote.quote}</Text><Text style={styles.quoteAuthor}>— {quote.author}</Text></> : null}
      <Text style={styles.hint}>Shared from a public quote service. Your cycle data is never sent with this request.</Text>
    </View>
  );
}
