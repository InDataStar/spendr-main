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
import { Cost } from "../types/cost";

interface CostModalProps {
  visible: boolean;
  cost?: Cost | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (cost: Cost) => void;
  onDelete?: (costId: string) => void;
}

export const CostModal = ({
  visible,
  cost,
  loading = false,
  onClose,
  onSave,
  onDelete,
}: CostModalProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const editing = !!cost;

  useEffect(() => {
    if (visible) {
      setName(cost?.name ?? "");
      setAmount(
        cost?.amount !== undefined
          ? cost.amount.toString()
          : ""
      );
    }
  }, [visible, cost]);

  const handleSave = () => {
    const parsedAmount = Number(amount);

    if (!name.trim()) {
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      return;
    }

    const updatedCost: Cost = {
      id: cost?.id ?? Date.now().toString(),
      name: name.trim(),
      amount: parsedAmount, 
    };

    onSave(updatedCost);
  };

  const handleDelete = () => {
    if (!cost || !onDelete) {
      return;
    }

    onDelete(cost.id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {editing ? "Edit cost" : "Add cost"}
          </Text>

          <Text style={styles.subtitle}>
            {editing
              ? "Update this cost."
              : "Add a cost to your upcoming expenses."}
          </Text>

          <Text style={styles.label}>
            Name
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rent"
            placeholderTextColor="#9AA3AD"
            style={styles.input}
          />

          <Text style={styles.label}>
            Amount
          </Text>

          <View style={styles.amountContainer}>
            <Text style={styles.currency}>
              $
            </Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#9AA3AD"
              keyboardType="decimal-pad"
              style={styles.amountInput}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.saveButton,
                (!name.trim() || !amount) &&
                  styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={
                loading ||
                !name.trim() ||
                !amount
              }
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.saveText}>
                  {editing ? "Save changes" : "Add cost"}
                </Text>
              )}
            </Pressable>
          </View>

          {editing && (
            <Pressable
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.deleteText}>
                Remove cost
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#243447",
  },

  subtitle: {
    fontSize: 14,
    color: "#7A8795",
    marginTop: 5,
    marginBottom: 24,
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
    borderColor: "#D5DAE0",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#243447",
    marginBottom: 18,
  },

  amountContainer: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D5DAE0",
    borderRadius: 10,
    marginBottom: 24,
  },

  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#243447",
    marginLeft: 14,
  },

  amountInput: {
    flex: 1,
    fontSize: 15,
    color: "#243447",
    paddingHorizontal: 8,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D5DAE0",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#243447",
  },

  saveButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#243447",
    justifyContent: "center",
    alignItems: "center",
  },

  saveText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.5,
  },

  deleteButton: {
    marginTop: 18,
    alignItems: "center",
  },

  deleteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C0392B",
  },
});