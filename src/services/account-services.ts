import { ACCOUNT_TYPES } from '../constants/account-types';
import { Keys } from '../constants/keys';
import { Account } from '../types/account';
import { loadFromStorageAsync, saveToStorageAsync } from './async-storage-services';

export class AccountServices {
  static getPrimaryAccounts =async ()=>{
    try {
      const primaryAccountId = await loadFromStorageAsync(Keys.PRIMARY_ACCOUNT_ID())
      return primaryAccountId;
    } catch (error) {
      
    }
  }
  static setPrimaryAccounts =async (accountId:string)=>{
    try {
      const primaryAccountId = await saveToStorageAsync(Keys.PRIMARY_ACCOUNT_ID(),accountId) 
      return primaryAccountId;
    } catch (error) {
      console.error(error);
    }
  }


  static getAccounts = async (): Promise<Account[]> => {
    const response = await fetch('https://api.akahu.io/v1/accounts', {
      headers: {
        Authorization: 'Bearer user_token_cmrlb9ky2000002l1hep0ad2c',
        'X-Akahu-Id': 'app_token_cmrl8mwy6000102l7bpwd80je',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json(); 
    return data.items as Account[];
  };
  static getAccount = async (id:string): Promise<Account> => {
    const response = await fetch('https://api.akahu.io/v1/accounts/${id}', {
      headers: {
        Authorization: 'Bearer user_token_cmrlb9ky2000002l1hep0ad2c',
        'X-Akahu-Id': 'app_token_cmrl8mwy6000102l7bpwd80je',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json(); 
    return data.items as Account;
  };
 
}
