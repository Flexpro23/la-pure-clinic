import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Updates the user's balance in Firestore
 * @param userId The user's ID
 * @param amount The amount to add (positive) or subtract (negative)
 * @returns The updated balance
 */
export async function updateUserBalance(userId: string, amount: number): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update the balance using Firebase's increment to avoid race conditions
    await updateDoc(userRef, {
      balance: increment(amount)
    });
    
    // Get the updated balance
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    return userData?.balance || 0;
  } catch (error) {
    console.error('Error updating user balance:', error);
    throw error;
  }
}

/**
 * Gets the current user balance
 * @param userId The user's ID
 * @returns The current balance
 */
export async function getUserBalance(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    return userData?.balance || 0;
  } catch (error) {
    console.error('Error getting user balance:', error);
    return 0;
  }
}

/**
 * Charges the user for a specific API or service usage
 * @param userId The user's ID
 * @param amount The amount to charge (positive number)
 * @param serviceType The type of service being charged for (for tracking purposes)
 * @returns The updated balance or false if the charge failed
 */
export async function chargeUserForService(
  userId: string, 
  amount: number, 
  serviceType: 'report_generation' | 'image_generation'
): Promise<number | false> {
  try {
    // First, check if user has sufficient balance
    const currentBalance = await getUserBalance(userId);
    
    if (currentBalance < amount) {
      console.error('Insufficient balance for service charge');
      return false;
    }
    
    // Charge the user (subtract from balance)
    const newBalance = await updateUserBalance(userId, -amount);
    
    // Record the transaction - use setDoc instead of updateDoc for new documents
    const transactionRef = doc(db, 'users', userId, 'transactions', new Date().toISOString());
    await setDoc(transactionRef, {
      type: 'charge',
      amount: amount,
      serviceType: serviceType,
      timestamp: new Date().toISOString(),
      balanceAfter: newBalance
    }).catch(error => {
      // If transaction recording fails, we still continue since the balance was updated
      console.error('Error recording transaction:', error);
    });
    
    return newBalance;
  } catch (error) {
    console.error('Error charging user for service:', error);
    return false;
  }
} 