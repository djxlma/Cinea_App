import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RatingStars } from '../../components/RatingStars';
import { ScreenHeader } from '../../components/ScreenHeader';
import { UserAvatar } from '../../components/UserAvatar';
import { demoMovies } from '../../data/mock/demoContent';
import { supabase } from '../../lib/supabase';
import { createReview } from '../../services/reviews';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'CreateReview'>;

export function CreateReviewScreen({ navigation, route }: Props) {
  const { movieTitle } = route.params;
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [currentUserName, setCurrentUserName] = useState('Usuário');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const movie = demoMovies.find((item) => item.title === movieTitle) ?? demoMovies[0];
  const movieId = movie.id;

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setCurrentUserName(data.user?.email?.split('@')[0] ?? 'Usuário');
    }

    void loadUser();
  }, []);

  async function saveReview() {
    if (!movieId || !movieTitle) {
      setError('Filme inválido para avaliação.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Selecione uma avaliação de 1 a 5 estrelas.');
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      setError('Escreva uma avaliação antes de publicar.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createReview({
        movieId,
        movieTitle,
        rating,
        content: trimmedText,
      });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível publicar a avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CineaScreen
      contentContainerStyle={styles.content}
      footer={<PrimaryButton label={isSubmitting ? 'Publicando...' : 'Publicar'} onPress={() => void saveReview()} disabled={isSubmitting} />}
    >
      <ScreenHeader title={movieTitle} onBack={() => navigation.goBack()} />
      <View style={styles.form}>
        <View style={styles.authorRow}>
          <UserAvatar size={47} />
          <Text style={styles.author}>{currentUserName}</Text>
        </View>
        <TextInput
          accessibilityLabel="Sua avaliacao"
          multiline
          onChangeText={(value) => {
            setText(value);
            if (error) {
              setError('');
            }
          }}
          placeholder="Escreva sua avaliacao"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          textAlignVertical="top"
          value={text}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <RatingStars value={rating} size={42} interactive onChange={setRating} color="#FFA424" empty="outline" />
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
  },
  form: {
    gap: 16,
    marginTop: spacing.sm,
  },
  authorRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  author: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    minHeight: 222,
    padding: 9,
    borderWidth: 1,
    borderColor: '#B28B70',
    borderRadius: 7,
    color: colors.text,
    backgroundColor: '#5D0000',
    fontSize: 17,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FFB4A2',
    fontSize: 14,
  },
});