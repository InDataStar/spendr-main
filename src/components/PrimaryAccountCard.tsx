import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Account } from '../types/account';
 

interface PrimaryAccountCardProps {
  account?: Account;
  loading?: boolean;
  onPress: () => void;
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(amount);
};

export const PrimaryAccountCard = ({
  account,
  loading = false,
  onPress,
}: PrimaryAccountCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        PRIMARY ACCOUNT
      </Text>

      <Pressable
        style={styles.card}
        onPress={onPress}
      >
        {loading ? (
          <>
            <ActivityIndicator />

            <Text style={styles.loading}>
              Loading accounts...
            </Text>
          </>
        ) : account ? (
          <>
            <View style={styles.icon}>
              <Text style={styles.iconText}>
                $
              </Text>
            </View>

            <View style={styles.details}>
              <Text style={styles.name}>
                {account.name}
              </Text>

              {account.formatted_account && (
                <Text style={styles.number}>
                  {account.formatted_account}
                </Text>
              )}
            </View>

            <View style={styles.balanceContainer}>
              <Text style={styles.balance}>
                {formatMoney(account.balance.available)}
              </Text>

              <Text style={styles.chevron}>
                ›
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.noAccount}>
              Select an account
            </Text>

            <Text style={styles.chevron}>
              ›
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#8A94A0',
    marginBottom: 8,
  },

  card: {
    minHeight: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#243447',
  },

  details: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#243447',
  },

  number: {
    fontSize: 12,
    color: '#8A94A0',
    marginTop: 3,
  },

  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  balance: {
    fontSize: 14,
    fontWeight: '700',
    color: '#243447',
  },

  chevron: {
    fontSize: 25,
    color: '#9AA3AC',
  },

  loading: {
    marginLeft: 10,
    color: '#8A94A0',
  },

  noAccount: {
    flex: 1,
    fontSize: 15,
    color: '#7A8795',
  },
});