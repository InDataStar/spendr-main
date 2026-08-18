import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { IncomeModal } from "../components/IncomeModal";
import { IncomeServices } from "../services/income-service";
import {
  Income,
  IncomeFrequency,
} from "../types/income";

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(amount);
};

const frequencyLabel = (
  frequency: IncomeFrequency,
) => {
  switch (frequency) {
    case "WEEKLY":
      return "Weekly";

    case "FORTNIGHTLY":
      return "Fortnightly";

    case "MONTHLY":
      return "Monthly";

    case "YEARLY":
      return "Yearly";
  }
};

export default function IncomeScreen() {
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [selectedIncome, setSelectedIncome] =
    useState<Income | null>(null);

  const [saving, setSaving] = useState(false);

  const loadIncome = async () => {
    try {
      setLoading(true);

      const result =
        await IncomeServices.getIncome();

      setIncome(result);
    } catch (error) {
      console.error(
        "Failed to load income:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIncome();
    }, []),
  );

  const openAddIncome = () => {
    setSelectedIncome(null);
    setModalVisible(true);
  };

  const openEditIncome = (item: Income) => {
    setSelectedIncome(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalVisible(false);
    setSelectedIncome(null);
  };

  const saveIncome = async (item: Income) => {
    try {
      setSaving(true);

      if (selectedIncome) {
        await IncomeServices.updateIncome(item);

        setIncome((current) =>
          current.map((existing) =>
            existing.id === item.id
              ? item
              : existing,
          ),
        );
      } else {
        await IncomeServices.addIncome(item);

        setIncome((current) => [
          ...current,
          item,
        ]);
      }

      closeModal();
    } catch (error) {
      console.error(
        "Failed to save income:",
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      setSaving(true);

      await IncomeServices.deleteIncome(id);

      setIncome((current) =>
        current.filter(
          (item) => item.id !== id,
        ),
      );

      closeModal();
    } catch (error) {
      console.error(
        "Failed to delete income:",
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading income...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Income
          </Text>

          <Text style={styles.subtitle}>
            Manage your regular income
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={openAddIncome}
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={income}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.incomeCard}
            onPress={() =>
              openEditIncome(item)
            }
          >
            <View style={styles.incomeInfo}>
              <Text style={styles.incomeName}>
                {item.name}
              </Text>

              <Text style={styles.frequency}>
                {frequencyLabel(item.frequency)}
              </Text>

              <Text style={styles.startDate}>
                Starting {item.startDate}
              </Text>
            </View>

            <Text style={styles.amount}>
              {formatMoney(item.amount)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No income added
            </Text>

            <Text style={styles.emptyText}>
              Add your salary or other regular
              income to calculate your spendable
              money.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={openAddIncome}
            >
              <Text style={styles.emptyButtonText}>
                Add income
              </Text>
            </Pressable>
          </View>
        }
      />

      <IncomeModal
        visible={modalVisible}
        income={selectedIncome}
        loading={saving}
        onClose={closeModal}
        onSave={saveIncome}
        onDelete={deleteIncome}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#243447",
  },

  subtitle: {
    fontSize: 14,
    color: "#7A8795",
    marginTop: 4,
  },

  addButton: {
    backgroundColor: "#243447",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  list: {
    paddingBottom: 40,
  },

  incomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  incomeInfo: {
    flex: 1,
  },

  incomeName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#243447",
  },

  frequency: {
    fontSize: 13,
    color: "#7A8795",
    marginTop: 5,
  },

  startDate: {
    fontSize: 12,
    color: "#9AA4AE",
    marginTop: 3,
  },

  amount: {
    fontSize: 17,
    fontWeight: "700",
    color: "#243447",
    marginLeft: 10,
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
    marginTop: 8,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: "#243447",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
  },

  loadingText: {
    marginTop: 10,
    color: "#7A8795",
  },
});