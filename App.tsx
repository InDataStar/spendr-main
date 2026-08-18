import React, { useEffect, useMemo, useState } from "react";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AccountServices } from "./src/services/account-services";
import { TransactionServices } from "./src/services/transaction-services";

import { Account } from "./src/types/account";
import { Cost } from "./src/types/cost";
import { Transaction } from "./src/types/transaction";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function DashboardScreen() {
 
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}> 
        <AppNavigator/>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

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
});
