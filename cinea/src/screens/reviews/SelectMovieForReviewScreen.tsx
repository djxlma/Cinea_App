import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { PosterTile } from '../../components/PosterTile';
import { ScreenHeader } from '../../components/ScreenHeader';
import { demoMovies } from '../../data/mock/demoContent';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'SelectMovieForReview'>;

export function SelectMovieForReviewScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const tileWidth = (width * 0.82 - 16) / 3;
  const tileHeight = tileWidth * 1.46;

  return (
    <CineaScreen contentContainerStyle={styles.content}>
      <ScreenHeader title="Escolher filme" onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>Selecione o filme que deseja avaliar.</Text>
      <View style={styles.grid}>
        {demoMovies.map((movie) => (
          <PosterTile
            key={movie.id}
            width={tileWidth}
            height={tileHeight}
            posterSource={movie.posterSource}
            backgroundColor={movie.posterColor}
            showRating={false}
            onPress={() => navigation.navigate('CreateReview', { movieTitle: movie.title })}
          />
        ))}
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
    gap: spacing.md,
  },
  subtitle: {
    color: colors.text,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
});
