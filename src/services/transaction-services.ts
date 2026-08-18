import { Transaction } from "../types/transaction";


export class TransactionServices {
    static getTransaction = async (accountId: string): Promise<Transaction[]> => {
    try {
      // https://api.akahu.io/v1/accounts/acc_cmrlb85g8008n02ky52ybeqgx/transactions
            const response = await fetch(
              `https://api.akahu.io/v1/accounts/${accountId}/transactions`,
              {
                headers: {
                  Authorization: 'Bearer user_token_cmrlb9ky2000002l1hep0ad2c',
                  'X-Akahu-Id': 'app_token_cmrl8mwy6000102l7bpwd80je',
                },
              }
            );

            /**
       *
              Authorization: 'Bearer user_token_cmrlb9ky2000002l1hep0ad2c',
              'X-Akahu-Id': 'app_token_cmrl8mwy6000102l7bpwd80je',
       */
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const transactionResults: Transaction[] = data.items;

            // const startOfWeek = new Date(START_OF_WEEK);
            // startOfWeek.setHours(0, 0, 0, 0);

            // const endOfWeek = new Date('2026-08-04');
            // endOfWeek.setHours(23, 59, 59, 999);

            // const result = transactionResults.filter((transaction) => {
            //   const transactionDate = new Date(transaction.date);

            //   return transactionDate >= startOfWeek; //&& transactionDate <= endOfWeek;
            // });
      return transactionResults;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  };
}