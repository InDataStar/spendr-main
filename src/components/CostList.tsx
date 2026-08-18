import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Cost } from "../types/cost";

interface CostListProps {
  costs: Cost[];
  amount: number;
  onTogglePaid: (id: string) => void;
  onEdit: (cost: Cost) => void;
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(amount);
};

export const CostList = ({
  costs,
  amount,
  onTogglePaid,
  onEdit,
}: CostListProps) => {
  return (
    <View style={styles.card}>
      {costs.map((cost) => {
        const canBePaid = amount > cost.amount;

        return (
          <View
            key={cost.id}
            style={styles.row}
          >
            {/* Checkbox */}
            <Pressable
              style={[
                styles.checkbox,
                canBePaid && styles.checkboxPaid,
              ]}
              onPress={() =>
                canBePaid &&
                onTogglePaid(cost.id)
              }
              disabled={!canBePaid}
            >
              {canBePaid && (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              )}
            </Pressable>

            {/* Details */}
            <Pressable
              style={styles.details}
              onPress={() => onEdit(cost)}
            >
              <Text
                style={[
                  styles.name,
                  canBePaid &&
                    styles.paidName,
                ]}
              >
                {cost.name}
              </Text>

              <Text style={styles.status}>
                {canBePaid
                  ? "Can be paid"
                  : "Can't be paid"}
              </Text>
            </Pressable>

            {/* Amount */}
            <Text
              style={[
                styles.amount,
                canBePaid &&
                  styles.paidAmount,
              ]}
            >
              {formatMoney(cost.amount)}
            </Text>

            {/* Edit */}
            <Pressable
              style={styles.editButton}
              onPress={() => onEdit(cost)}
            >
              <Text style={styles.editText}>
                Edit
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
  },

  row: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F2",
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#C8CED5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  checkboxPaid: {
    backgroundColor: "#243447",
    borderColor: "#243447",
  },

  checkmark: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  details: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#243447",
  },

  paidName: {
    textDecorationLine: "line-through",
    color: "#8A94A0",
  },

  status: {
    fontSize: 12,
    color: "#8A94A0",
    marginTop: 3,
  },

  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#243447",
    marginLeft: 10,
  },

  paidAmount: {
    color: "#8A94A0",
    textDecorationLine: "line-through",
  },

  editButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D5DAE0",
  },

  editText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#243447",
  },
});