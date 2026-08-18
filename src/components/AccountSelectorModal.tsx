import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Account } from '../types/account';
 

interface AccountSelectorModalProps {
  visible: boolean;
  accounts: Account[];
  selectedAccount?: Account;
  loading?: boolean;
  onClose: () => void;
  onSelect: (accountId: string) => void;
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(amount);
};

export const AccountSelectorModal = ({
  visible,
  accounts,
  selectedAccount,
  loading = false,
  onClose,
  onSelect,
}: AccountSelectorModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Select account
              </Text>

              <Text style={styles.subtitle}>
                Choose the account used for your
                spendable money.
              </Text>
            </View>

            <Pressable onPress={onClose}>
              <Text style={styles.close}>
                ×
              </Text>
            </Pressable>
          </View>

          {accounts.map(account => {
            const selected =
              account.id === selectedAccount?.id;

            return (
              <Pressable
                key={account.id}
                style={[
                  styles.account,
                  selected &&
                    styles.selectedAccount,
                ]}
                disabled={loading}
                onPress={() =>
                  onSelect(account.id)
                }
              >
                <View
                  style={[
                    styles.radio,
                    selected &&
                      styles.radioSelected,
                  ]}
                >
                  {selected && (
                    <View style={styles.radioDot} />
                  )}
                </View>

                <View style={styles.details}>
                  <Text style={styles.name}>
                    {account.name}
                  </Text>

                  {account.accountNumber && (
                    <Text style={styles.number}>
                      {account.accountNumber}
                    </Text>
                  )}
                </View>

                <Text style={styles.balance}>
                  {formatMoney(account.balance)}
                </Text>
              </Pressable>
            );
          })}

          {loading && (
            <ActivityIndicator
              style={styles.loader}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#243447',
  },

  subtitle: {
    fontSize: 13,
    color: '#7A8795',
    marginTop: 4,
    maxWidth: 280,
  },

  close: {
    fontSize: 32,
    color: '#8A94A0',
  },

  account: {
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E7EA',
    marginBottom: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedAccount: {
    borderColor: '#243447',
    backgroundColor: '#F5F7F9',
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C8CED5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  radioSelected: {
    borderColor: '#243447',
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#243447',
  },

  details: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#243447',
  },

  number: {
    fontSize: 12,
    color: '#8A94A0',
    marginTop: 2,
  },

  balance: {
    fontSize: 14,
    fontWeight: '700',
    color: '#243447',
  },

  loader: {
    marginTop: 10,
  },
});