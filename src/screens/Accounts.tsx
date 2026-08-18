import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AccountServices } from "../services/account-services";
import { Account } from "../types/account";
import { APP_TITLE } from "../constants/configurations";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ALLOWED_ACCOUNT_TYPES } from "../constants/allow-accounts-types";

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(amount);
};

export default function AccountsScreen() {
  const navigation = useNavigation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryAccountId, setPrimaryAccountId] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
    }, []),
  );

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const result = await AccountServices.getAccounts();
      setAllAccounts(result);
      const primaryAccountId = await AccountServices.getPrimaryAccounts();
      setPrimaryAccountId(primaryAccountId);
      setAccounts(result.filter(account => ALLOWED_ACCOUNT_TYPES.filter(type => type === account.type))); //account.type
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const setPrimary = async (accountId: string) => {
    try {
      setUpdating(accountId);

      await AccountServices.setPrimaryAccounts(accountId);
      setPrimaryAccountId(accountId);
      //setAccounts(updatedAccounts);
    } catch (error) {
      console.error("Failed to set primary account:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>

        <Text style={styles.subtitle}>
          Choose the account used for your spendable balance.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Your accounts</Text>

      <FlatList
        style={styles.list}
        data={accounts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: account }) => {
          const isPrimary = account._id === primaryAccountId;
          const isUpdating = updating === account._id;

          return (
            <View style={[styles.accountCard, isPrimary && styles.primaryCard]}>
              <View style={styles.accountTop}>
                <View style={styles.icon}>
                  <Image
                    source={{ uri: account.connection.logo }}
                    style={{ width: 40, borderRadius: 5, height: 40 }}
                  />
                </View>

                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>

                  {account.formatted_account && (
                    <Text style={styles.accountNumber}>
                      {account.formatted_account}
                    </Text>
                  )}

                  {account.type && (
                    <Text style={styles.accountType}>{account.type}</Text>
                  )}
                </View>

                <View style={styles.balanceContainer}>
                  <Text style={styles.balance}>
                    {formatMoney(
                      account.balance.available
                        ? account.balance.available
                        : account.balance.current,
                    )}
                  </Text>
                </View>
              </View>

              <View style={styles.accountBottom}>
                {isPrimary ? (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>
                      ✓ Primary account
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => setPrimary(account._id)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        Set as primary
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No accounts</Text>

            <Text style={styles.emptyText}>
              {`Connect a bank account to start using ${APP_TITLE}.`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 20,
  },

  header: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#243447",
    marginBottom: 12,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 40,
  },

  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    width: "100%",
  },

  content: {
    padding: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#243447",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#7A8795",
    marginTop: 5,
    maxWidth: 320,
  },

  primaryCard: {
    borderWidth: 2,
    borderColor: "#243447",
  },

  accountTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  iconText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#243447",
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#243447",
  },

  accountNumber: {
    fontSize: 13,
    color: "#8A94A0",
    marginTop: 3,
  },

  accountType: {
    fontSize: 12,
    color: "#8A94A0",
    marginTop: 2,
  },

  balanceContainer: {
    marginLeft: 10,
  },

  balance: {
    fontSize: 15,
    fontWeight: "700",
    color: "#243447",
  },

  accountBottom: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F2",
  },

  primaryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2F5",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },

  primaryBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#243447",
  },

  primaryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D5DAE0",
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#243447",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#7A8795",
  },

  empty: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#243447",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#7A8795",
    textAlign: "center",
    marginTop: 6,
  },
});
