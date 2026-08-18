import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Income,
  IncomeFrequency,
} from "../types/income";

interface IncomeModalProps {
  visible: boolean;
  income: Income | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (income: Income) => void;
  onDelete?: (id: string) => void;
}

const frequencies: {
  label: string;
  value: IncomeFrequency;
}[] = [
  {
    label: "Weekly",
    value: "WEEKLY",
  },
  {
    label: "Fortnightly",
    value: "FORTNIGHTLY",
  },
  {
    label: "Monthly",
    value: "MONTHLY",
  },
  {
    label: "Yearly",
    value: "YEARLY",
  },
];

export const IncomeModal = ({
  visible,
  income,
  loading = false,
  onClose,
  onSave,
  onDelete,
}: IncomeModalProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [frequency, setFrequency] =
    useState<IncomeFrequency>("FORTNIGHTLY");

  useEffect(() => {
    if (income) {
      setName(income.name);
      setAmount(income.amount.toString());
      setStartDate(income.startDate);
      setFrequency(income.frequency);
    } else {
      setName("");
      setAmount("");
      setStartDate("");
      setFrequency("FORTNIGHTLY");
    }
  }, [income, visible]);

  const handleSave = () => {
    const numericAmount = Number(amount);

    if (!name.trim()) {
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      return;
    }

    if (!startDate.trim()) {
      return;
    }

    const result: Income = {
      id: income?.id ?? `income-${Date.now()}`,
      name: name.trim(),
      amount: numericAmount,
      startDate: startDate.trim(),
      frequency,
    };

    onSave(result);
  };

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
            <Text style={styles.title}>
              {income ? "Edit income" : "Add income"}
            </Text>

            <Pressable
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Income name</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Salary"
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Amount</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Starting date</Text>

          <TextInput
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Frequency</Text>

          <View style={styles.frequencyContainer}>
            {frequencies.map((item) => {
              const selected =
                frequency === item.value;

              return (
                <Pressable
                  key={item.value}
                  onPress={() =>
                    setFrequency(item.value)
                  }
                  disabled={loading}
                  style={[
                    styles.frequencyButton,
                    selected &&
                      styles.frequencyButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      selected &&
                        styles.frequencyTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {income ? "Update income" : "Add income"}
              </Text>
            )}
          </Pressable>

          {income && onDelete && (
            <Pressable
              style={styles.deleteButton}
              onPress={() => onDelete(income.id)}
              disabled={loading}
            >
              <Text style={styles.deleteButtonText}>
                Delete income
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#243447",
  },

  close: {
    fontSize: 20,
    color: "#7A8795",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#243447",
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDE2E7",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#243447",
    marginBottom: 18,
  },

  frequencyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },

  frequencyButton: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE2E7",
  },

  frequencyButtonSelected: {
    backgroundColor: "#243447",
    borderColor: "#243447",
  },

  frequencyText: {
    color: "#243447",
    fontWeight: "600",
  },

  frequencyTextSelected: {
    color: "#FFFFFF",
  },

  saveButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#243447",
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  deleteButton: {
    marginTop: 12,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#C0392B",
    fontWeight: "600",
  },
});