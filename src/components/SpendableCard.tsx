import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../utils/money';

interface SpendableCardProps {
  amount: number;
}


export const SpendableCard = ({
  amount,
}: SpendableCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        SPENDABLE
      </Text>

      <Text
        style={[
          styles.amount,
          amount < 0 && styles.negative,
        ]}
      >
        {formatMoney(amount)}
      </Text>

      <Text style={styles.description}>
        Money you can safely spend
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#243447',
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
  },

  label: {
    color: '#AAB6C3',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  amount: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    marginTop: 8,
  },

  negative: {
    color: '#FF8A8A',
  },

  description: {
    color: '#AAB6C3',
    fontSize: 14,
    marginTop: 4,
  },
});