import { AccountSelectorModal } from "../components/AccountSelectorModal";
import { CostsHeader } from "../components/CostHeader";
import { CostList } from "../components/CostList";
import { PrimaryAccountCard } from "../components/PrimaryAccountCard";
import { SpendableCard } from "../components/SpendableCard";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { APP_TITLE } from "../constants/configurations";
import { AccountServices } from "../services/account-services";
import { TransactionServices } from "../services/transaction-services";
import { Cost } from "../types/cost";
import { Transaction } from "../types/transaction";
import { Account } from "../types/account";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { CostServices } from "../services/cost-service";
import { CostModal } from "../components/CostModal";
import { IncomeServices } from "../services/income-service";
import { Income } from "../types/income";
import { formatMoney } from "../utils/money";

export const Dashboard = () => {
  const navigation = useNavigation();
  const [income, setIncome] = useState<Income[]>([]);
  const [primaryAccountId, setPrimaryAccountId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [changingAccount, setChangingAccount] = useState(false);
  const [spending, setSpending] = useState(0);
  const [costModalVisible, setCostModalVisible] = useState(false);
  const [selectedCost, setSelectedCost] = useState<Cost | null>(null);
  const [costLoading, setCostLoading] = useState(false);

  const openAddCost = () => {
    setSelectedCost(null);
    setCostModalVisible(true);
  };

  const openEditCost = (cost: Cost) => {
    setSelectedCost(cost);
    setCostModalVisible(true);
  };

  const closeCostModal = () => {
    if (costLoading) {
      return;
    }

    setCostModalVisible(false);
    setSelectedCost(null);
  };

  const saveCost = async (cost: Cost) => {
    try {
      setCostLoading(true);

      if (selectedCost) {
        await CostServices.updateCost(cost);

        setCosts((currentCosts) =>
          currentCosts.map((existingCost) =>
            existingCost.id === cost.id ? cost : existingCost,
          ),
        );
      } else {
        await CostServices.addCost(cost);

        setCosts((currentCosts) => [...currentCosts, cost]);
      }

      closeCostModal();
    } catch (error) {
      console.error("Failed to save cost:", error);
    } finally {
      setCostLoading(false);
    }
  };

  const removeCost = async (costId: string) => {
    try {
      setCostLoading(true);

      await CostServices.deleteCost(costId);

      setCosts((currentCosts) =>
        currentCosts.filter((cost) => cost.id !== costId),
      );

      closeCostModal();
    } catch (error) {
      console.error("Failed to delete cost:", error);
    } finally {
      setCostLoading(false);
    }
  };

  /*
   * Load dashboard
   *
   * 1. Get costs
   * 2. Get primary account
   * 3. Get accounts
   * 4. Get transactions
   */
  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
    }, []),
  );

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [primaryAccountId, accountResult, costResult, incomeResult] =
        await Promise.all([
          AccountServices.getPrimaryAccounts(),
          AccountServices.getAccounts(),
          CostServices.getCosts(),
          IncomeServices.getIncome(),
        ]);

      console.log("costResult");
      console.log(costResult);

      setPrimaryAccountId(primaryAccountId);
      setAccounts(accountResult);
      setCosts(costResult);

      /*
       * Find primary account
       */
      const primary = accountResult.find(
        (account) => account._id === primaryAccountId,
      );

      if (primary) {
        setSpending(primary.balance.available ?? primary.balance.current ?? 0);
      }

      /*
       * Load transactions
       */
      if (primaryAccountId) {
        const transactionResult =
          await TransactionServices.getTransaction(primaryAccountId);

        setTransactions(transactionResult);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Primary account
   */
  const primaryAccount = useMemo(() => {
    return accounts.find((account) => account._id === primaryAccountId);
  }, [accounts, primaryAccountId]);

  /*
   * Unpaid costs
   */
  const unpaidCosts = useMemo(() => {
    return costs;
  }, [costs]);

  /*
   * Total unpaid costs
   */
  const unpaidTotal = useMemo(() => {
    return unpaidCosts.reduce((total, cost) => total + cost.amount, 0);
  }, [unpaidCosts]);

  /*
   * Spendable
   *
   * Bank balance - unpaid costs
   */
  const spendable = spending - unpaidTotal;

  /*
   * Mark cost paid/unpaid
   */
  const toggleCostPaid = async (cost: Cost) => {
    try {
      const updatedCost: Cost = {
        ...cost,
      };

      await CostServices.updateCost(updatedCost);

      setCosts((currentCosts) =>
        currentCosts.map((currentCost) =>
          currentCost.id === cost.id ? updatedCost : currentCost,
        ),
      );
    } catch (error) {
      console.error("Failed to update cost:", error);
    }
  };

  /*
   * Add cost
   */
  const addCost = async (cost: Cost) => {
    try {
      await CostServices.addCost(cost);

      setCosts((currentCosts) => [...currentCosts, cost]);
    } catch (error) {
      console.error("Failed to add cost:", error);
    }
  };

  /*
   * Delete cost
   */
  const deleteCost = async (costId: string) => {
    try {
      await CostServices.deleteCost(costId);

      setCosts((currentCosts) =>
        currentCosts.filter((cost) => cost.id !== costId),
      );
    } catch (error) {
      console.error("Failed to delete cost:", error);
    }
  };

  /*
   * Change primary account
   */
  const selectAccount = async (accountId: string) => {
    try {
      setChangingAccount(true);

      await AccountServices.setPrimaryAccounts(accountId);

      setPrimaryAccountId(accountId);

      /*
       * Load transactions for the
       * newly selected account.
       */
      const transactionResult =
        await TransactionServices.getTransaction(accountId);

      setTransactions(transactionResult);

      /*
       * Update account list so the
       * PrimaryAccountCard updates.
       */
      const updatedAccounts = await AccountServices.getAccounts();

      setAccounts(updatedAccounts);

      const newPrimary = updatedAccounts.find(
        (account) => account._id === accountId,
      );

      if (newPrimary) {
        setSpending(
          newPrimary.balance.available ?? newPrimary.balance.current ?? 0,
        );
      }

      setAccountModalVisible(false);
    } catch (error) {
      console.error("Failed to change primary account:", error);
    } finally {
      setChangingAccount(false);
    }
  };

  const goToAccountsScreen = () => {
    navigation.navigate("Accounts");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.title}>{APP_TITLE}</Text>

          <Text style={styles.subtitle}>Your money, made simple</Text>
        </View>

        <View style={styles.incomeCard}>
          <View>
            <Text style={styles.incomeLabel}>Next income</Text>

            {income.length > 0 ? (
              <>
                <Text style={styles.incomeName}>{income[0].name}</Text>

                <Text style={styles.incomeFrequency}>
                  {income[0].frequency}
                </Text>
              </>
            ) : (
              <Text style={styles.noIncome}>No income added</Text>
            )}
          </View>

          {income.length > 0 && (
            <Text style={styles.incomeAmount}>
              {formatMoney(income[0].amount)}
            </Text>
          )}
        </View>

        {/* Spendable */}

        <SpendableCard amount={spendable} />

        {/* Primary Account */}

        <PrimaryAccountCard
          account={primaryAccount}
          loading={loading}
          onPress={goToAccountsScreen}
        />

        {/* Costs */}

        <CostsHeader
          unpaidCount={unpaidCosts.length}
          onAdd={() => {
            openAddCost();
            // Add cost modal later
          }}
        />

        <CostList
          costs={costs}
          onTogglePaid={() => {}}
          amount={spendable}
          onEdit={openEditCost}
        />
      </ScrollView>

      {/* Account Selector */}

      <AccountSelectorModal
        visible={accountModalVisible}
        accounts={accounts}
        selectedAccount={primaryAccount}
        loading={changingAccount}
        onClose={() => setAccountModalVisible(false)}
        onSelect={selectAccount}
      />
      <CostModal
        visible={costModalVisible}
        cost={selectedCost}
        loading={costLoading}
        onClose={closeCostModal}
        onSave={saveCost}
        onDelete={removeCost}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#243447",
  },

  subtitle: {
    fontSize: 14,
    color: "#7A8795",
    marginTop: 3,
  },

  incomeCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  padding: 18,
  marginBottom: 15,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

incomeLabel: {
  fontSize: 12,
  color: "#7A8795",
  marginBottom: 4,
},

incomeName: {
  fontSize: 16,
  fontWeight: "700",
  color: "#243447",
},

incomeFrequency: {
  fontSize: 12,
  color: "#7A8795",
  marginTop: 3,
},

incomeAmount: {
  fontSize: 18,
  fontWeight: "700",
  color: "#243447",
},

noIncome: {
  fontSize: 14,
  color: "#7A8795",
},
});
