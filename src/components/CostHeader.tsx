import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface CostsHeaderProps {
  unpaidCount: number;
  onAdd: () => void;
}

export const CostsHeader = ({
  unpaidCount,
  onAdd,
}: CostsHeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          Your costs
        </Text>

        <Text style={styles.subtitle}>
          {unpaidCount} unpaid
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={onAdd}
      >
        <Text style={styles.buttonText}>
          + Add
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#243447',
  },

  subtitle: {
    fontSize: 13,
    color: '#8A94A0',
    marginTop: 2,
  },

  button: {
    backgroundColor: '#243447',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});