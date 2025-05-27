import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, query, where, deleteDoc } from 'firebase/firestore';

// Translation content
const translations = {
  "SmartShopper": { "en": "SmartShopper", "he": "קניות חכמות" },
  "Manage List": { "en": "Manage List", "he": "ניהול רשימה" },
  "Store Layout": { "en": "Store Layout", "he": "מפת חנות" },
  "Smart Shopping, Simplified.": { "en": "Smart Shopping, Simplified.", "he": "קניות חכמות, פשוטות." },
  "Organize your groceries by store section for a faster, smarter trip.": { "en": "Organize your groceries by store section for a faster, smarter trip.", "he": "ארגן את הקניות שלך לפי מדורים בחנות לטיול מהיר וחכם יותר." },
  "Start Shopping": { "en": "Start Shopping", "he": "התחל לקנות" },
  "Your Smart Shopping List": { "en": "Your Smart Shopping List", "he": "רשימת הקניות החכמה שלך" },
  "Add & Manage Items": { "en": "Add & Manage Items", "he": "הוסף ונהל פריטים" },
  "Enter items, one per line (e.g., Milk, Bread, Apples)": { "en": "Enter items, one per line (e.g., Milk, Bread, Apples)", "he": "הכנס פריטים, אחד בכל שורה (לדוגמה: חלב, לחם, תפוחים)" },
  "Add Items": { "en": "Add Items", "he": "הוסף פריטים" },
  "Sort by Section": { "en": "Sort by Section", "he": "מיין לפי מדור" },
  "Suggest Layout": { "en": "Suggest Layout", "he": "הצע מפה" },
  "Save List": { "en": "Save List", "he": "שמור רשימה" },
  "Load List": { "en": "Load List", "he": "טען רשימה" },
  "Clear List": { "en": "Clear List", "he": "נקה רשימה" },
  "Loading/Saving data...": { "en": "Loading/Saving data...", "he": "טוען/שומר נתונים..." },
  "Your User ID:": { "en": "Your User ID:", "he": "מזהה המשתמש שלך:" },
  "Sorted List": { "en": "Sorted List", "he": "רשימה ממוינת" },
  "Add items to your list, then click \"Sort by Section\".": { "en": "Add items to your list, then click \"Sort by Section\".", "he": "הוסף פריטים לרשימה שלך, ואז לחץ על \"מיין לפי מדור\"." },
  "Click \"Sort by Section\" to organize your list.": { "en": "Click \"Sort by Section\" to organize your list.", "he": "לחץ על \"מיין לפי מדור\" כדי לארגן את הרשימה שלך." },
  "Current Raw List:": { "en": "Current Raw List:", "he": "רשימה גולמית נוכחית:" },
  "Remove ": { "en": "Remove ", "he": "הסר " },
  "Customize Your Store Layout": { "en": "Customize Your Store Layout", "he": "התאם אישית את מפת החנות שלך" },
  "Teach SmartShopper how your local store is organized by mapping items to sections. Auto-mapped items will appear here for review.": { "en": "Teach SmartShopper how your local store is organized by mapping items to sections. Auto-mapped items will appear here for review.", "he": "למד את SmartShopper כיצד החנות המקומית שלך מאורגנת על ידי מיפוי פריטים למדורים. פריטים שממופים אוטומטית יופיעו כאן לבדיקה." },
  "Add/Update Mapping": { "en": "Add/Update Mapping", "he": "הוסף/עדכן מיפוי" },
  "Item (e.g., 'Milk')": { "en": "Item (e.g., 'Milk')", "he": "פריט (לדוגמה: 'חלב')" },
  "Section (e.g., 'Dairy')": { "en": "Section (e.g., 'Dairy')", "he": "מדור (לדוגמה: 'מוצרי חלב')" },
  "Add Mapping": { "en": "Add Mapping", "he": "הוסף מיפוי" },
  "Current Mappings:": { "en": "Current Mappings:", "he": "מיפויים נוכחיים:" },
  "No custom mappings yet. Add some above or add items to your list for auto-mapping suggestions!": { "en": "No custom mappings yet. Add some above or add items to your list for auto-mapping suggestions!", "he": "אין עדיין מיפויים מותאמים אישית. הוסף כמה למעלה או הוסף פריטים לרשימה שלך להצעות מיפוי אוטומטיות!" },
  "Save Your Shopping List": { "en": "Save Your Shopping List", "he": "שמור את רשימת הקניות שלך" },
  "Enter list name (e.g., 'Weekly Groceries')": { "en": "Enter list name (e.g., 'Weekly Groceries')", "he": "הכנס שם לרשימה (לדוגמה: 'קניות שבועיות')" },
  "Cancel": { "en": "Cancel", "he": "ביטול" },
  "Save": { "en": "Save", "he": "שמור" },
  "List saved successfully!": { "en": "List saved successfully!", "he": "הרשימה נשמרה בהצלחה!" },
  "Load a Saved List": { "en": "Load a Saved List", "he": "טען רשימה שמורה" },
  "No saved lists found.": { "en": "No saved lists found.", "he": "לא נמצאו רשימות שמורות." },
  "Load": { "en": "Load", "he": "טען" },
  "Delete": { "en": "Delete", "he": "מחק" },
  "Close": { "en": "Close", "he": "סגור" },
  "List loaded successfully!": { "en": "List loaded successfully!", "he": "הרשימה נטענה בהצלחה!" },
  "List deleted successfully!": { "en": "List deleted successfully!", "he": "הרשימה נמחקה בהצלחה!" },
  "Authentication failed:": { "en": "Authentication failed:", "he": "האימות נכשל:" },
  "Firebase init failed:": { "en": "Firebase init failed:", "he": "אתחול Firebase נכשל:" },
  "Failed to load store layout:": { "en": "Failed to load store layout:", "he": "טעינת מפת החנות נכשלה:" },
  "Failed to load saved lists:": { "en": "Failed to load saved lists:", "he": "טעינת רשימות שמורות נכשלה:" },
  "No items in list to suggest layout for.": { "en": "No items in list to suggest layout for.", "he": "אין פריטים ברשימה להצעת מפה." },
  "Firestore not ready for auto-mapping. Please wait for authentication.": { "en": "Firestore not ready for auto-mapping. Please wait for authentication.", "he": "Firestore אינו מוכן למיפוי אוטומטי. אנא המתן לאימות." },
  "AI returned unexpected format for auto-mapping.": { "en": "AI returned unexpected format for auto-mapping.", "he": "ה-AI החזיר פורמט בלתי צפוי למיפוי אוטומטי." },
  "Could not auto-map items. Unexpected AI response.": { "en": "Could not auto-map items. Unexpected AI response.", "he": "לא ניתן למפות פריטים אוטומטית. תגובת AI בלתי צפויה." },
  "Auto-mapping failed:": { "en": "Auto-mapping failed:", "he": "מיפוי אוטומטי נכשל:" },
  "Auto-mapping complete! Review and adjust in \"Store Layout\" section.": { "en": "Auto-mapping complete! Review and adjust in \"Store Layout\" section.", "he": "מיפוי אוטומטי הושלם! סקור והתאם במדור \"מפת חנות\"." },
  "Saving...": { "en": "Saving...", "he": "שומר..." },
  "Suggesting Layout...": { "en": "Suggesting Layout...", "he": "מציע מפה..." },
  "Please enter both an item and a section.": { "en": "Please enter both an item and a section.", "he": "אנא הכנס גם פריט וגם מדור." },
  "Mapping updated successfully!": { "en": "Mapping updated successfully!", "he": "המיפוי עודכן בהצלחה!" },
  "Failed to update layout:": { "en": "Failed to update layout:", "he": "עדכון המפה נכשל:" },
  "Please enter a name for your list.": { "en": "Please enter a name for your list.", "he": "אנא הכנס שם לרשימה שלך." },
  "Cannot save an empty list.": { "en": "Cannot save an empty list.", "he": "לא ניתן לשמור רשימה ריקה." },
  "Failed to save list:": { "en": "Failed to save list:", "he": "שמירת הרשימה נכשלה:" },
  "List not found.": { "en": "List not found.", "he": "הרשימה לא נמצאה." },
  "Failed to load list:": { "en": "Failed to load list:", "he": "טעינת הרשימה נכשלה:" },
  "Failed to delete list:": { "en": "Failed to delete list:", "he": "מחיקת הרשימה נכשלה:" },
  "Section order saved successfully!": { "en": "Section order saved successfully!", "he": "סדר המדורים נשמר בהצלחה!" },
  "Failed to save section order:": { "en": "Failed to save section order:", "he": "שמירת סדר המדורים נכשלה:" },
  "Uncategorized": { "en": "Uncategorized", "he": "לא מקוטלג" },
  "All rights reserved. Powered by intelligent design.": { "en": "All rights reserved. Powered by intelligent design.", "he": "כל הזכויות שמורות. מופעל על ידי עיצוב חכם." },
  "Bought": { "en": "Bought", "he": "נקנה" },
};

// Translation function
const t = (key, lang) => {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return key; // Fallback to key if translation not found
};


// Main App Component
function App() {
  // Global Firebase variables (provided by Canvas environment)
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  // Firebase state
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firestoreLoading, setFirestoreLoading] = useState(false);
  const [firestoreError, setFirestoreError] = useState('');

  // UI States
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('en'); // 'en' for English, 'he' for Hebrew
  const [shoppingListInput, setShoppingListInput] = useState('');
  const [rawShoppingList, setRawShoppingList] = useState([]); // Array of items as entered
  const [sortedShoppingList, setSortedShoppingList] = useState({}); // Object: { section: [items] }
  const [storeLayout, setStoreLayout] = useState({}); // Object: { item: section }
  const [savedShoppingLists, setSavedShoppingLists] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [layoutItem, setLayoutItem] = useState('');
  const [layoutSection, setLayoutSection] = useState('');
  const [layoutMessage, setLayoutMessage] = useState('');
  const [sectionOrder, setSectionOrder] = useState([]); // State for custom section order
  const [boughtItems, setBoughtItems] = useState(new Set()); // New state for tracking bought items

  // AI-related states for auto-mapping
  const [loadingAutoMapping, setLoadingAutoMapping] = useState(false);
  const [autoMappingError, setAutoMappingError] = useState('');

  // Ref for the 3D canvas
  const mountRef = useRef(null);
  // Ref for the dynamic cursor element
  const cursorRef = useRef(null);
  // Refs for sections to apply scroll animations
  const sectionRefs = useRef([]);
  sectionRefs.current = [];

  // State for drag and drop
  const dragItem = useRef(null); // Index of the item being dragged
  const dragOverItem = useRef(null); // Index of the item being dragged over

  // Add to refs array for scroll animations
  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'he' : 'en');
  };

  // --- Firebase Initialization and Auth ---
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authentication = getAuth(app);
      setDb(firestore);
      setAuth(authentication);

      const unsubscribe = onAuthStateChanged(authentication, async (user) => {
        if (user) {
          setUserId(user.uid);
          console.log("Authenticated user ID:", user.uid);
        } else {
          // Sign in anonymously if no custom token or if user logs out
          console.log("No user found, signing in anonymously...");
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(authentication, initialAuthToken);
              setUserId(authentication.currentUser.uid);
              console.log("Signed in with custom token:", authentication.currentUser.uid);
            } else {
              await signInAnonymously(authentication);
              setUserId(authentication.currentUser.uid);
              console.log("Signed in anonymously:", authentication.currentUser.uid);
            }
          } catch (error) {
            console.error("Firebase Auth Error:", error);
            setFirestoreError(`${t("Authentication failed:", language)} ${error.message}`);
          }
        }
        setIsAuthReady(true); // Mark auth as ready after initial check
      });

      return () => unsubscribe(); // Cleanup auth listener
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setFirestoreError(`${t("Firebase init failed:", language)} ${error.message}`);
    }
  }, [firebaseConfig, initialAuthToken, language]);

  // --- Firestore Data Fetching (Store Layout & Saved Lists) ---
  useEffect(() => {
    if (!db || !userId || !isAuthReady) return;

    setFirestoreLoading(true);
    setFirestoreError('');

    // Listen for real-time updates to user's store layout and section order
    // Security Rule: allow read, write: if request.auth.uid == userId;
    const userLayoutDocRef = doc(db, `artifacts/${appId}/users/${userId}/userStoreLayouts`, 'myLayout');
    const unsubscribeLayout = onSnapshot(userLayoutDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStoreLayout(data.sections || {});
        // If sectionOrder exists, use it, otherwise initialize from current sections
        if (data.sectionOrder && Array.isArray(data.sectionOrder)) {
          setSectionOrder(data.sectionOrder);
        } else {
          // If no saved order, initialize with sorted keys from current layout
          const initialOrder = Object.keys(data.sections || {}).sort((a, b) => a.localeCompare(b));
          setSectionOrder(initialOrder);
          // Optionally, save this initial order back to Firestore
          // setDoc(userLayoutDocRef, { sectionOrder: initialOrder }, { merge: true });
        }
        console.log("Store layout and section order updated from Firestore:", data.sections, data.sectionOrder);
      } else {
        setStoreLayout({}); // No custom layout yet
        setSectionOrder([]); // No custom order yet
        console.log("No custom store layout found for user.");
      }
      setFirestoreLoading(false);
    }, (error) => {
      console.error("Error fetching store layout:", error);
      setFirestoreError(`${t("Failed to load store layout:", language)} ${error.message}`);
      setFirestoreLoading(false);
    });

    // Listen for real-time updates to user's saved shopping lists
    // Security Rule: allow read, write: if request.auth.uid == request.resource.data.userId;
    const listsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/userShoppingLists`);
    const q = query(listsCollectionRef); // No orderBy to avoid index issues with free tier

    const unsubscribeLists = onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedShoppingLists(lists);
      console.log("Saved shopping lists updated from Firestore:", lists);
      setFirestoreLoading(false);
    }, (error) => {
      console.error("Error fetching saved lists:", error);
      setFirestoreError(`${t("Failed to load saved lists:", language)} ${error.message}`);
      setFirestoreLoading(false);
    });

    return () => {
      unsubscribeLayout();
      unsubscribeLists();
    }; // Cleanup listeners
  }, [db, userId, isAuthReady, appId, language]);

  // --- Core Shopping List Logic ---

  const addItemsToList = useCallback(() => {
    const newItems = shoppingListInput.split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    setRawShoppingList(prev => [...prev, ...newItems]);
    setShoppingListInput('');
  }, [shoppingListInput]);

  const sortShoppingList = useCallback(() => {
    const newSortedList = {};
    const uncategorized = [];

    rawShoppingList.forEach(item => {
      // Find a section where the item (case-insensitive) matches any part of the layout item key
      const foundSection = Object.entries(storeLayout).find(([layoutItemKey, layoutSectionName]) =>
        item.toLowerCase().includes(layoutItemKey.toLowerCase())
      );

      if (foundSection) {
        const sectionName = foundSection[1];
        if (!newSortedList[sectionName]) {
          newSortedList[sectionName] = [];
        }
        newSortedList[sectionName].push(item);
      } else {
        uncategorized.push(item);
      }
    });

    if (uncategorized.length > 0) {
      newSortedList[t('Uncategorized', language)] = uncategorized;
    }

    // Sort items within each section: unbought first, then bought, then alphabetical for same status
    for (const section in newSortedList) {
      newSortedList[section].sort((a, b) => {
        const aIsBought = boughtItems.has(a);
        const bIsBought = boughtItems.has(b);

        if (aIsBought && !bIsBought) return 1; // a (bought) comes after b (unbought)
        if (!aIsBought && bIsBought) return -1; // a (unbought) comes before b (bought)
        return a.localeCompare(b); // Alphabetical for same status
      });
    }

    // Use the custom sectionOrder if available, otherwise sort alphabetically
    let currentSectionOrder = [...sectionOrder];
    const allSectionsInList = Object.keys(newSortedList);

    // Add any new sections from the current list that are not in the saved order
    allSectionsInList.forEach(section => {
      if (!currentSectionOrder.includes(section)) {
        currentSectionOrder.push(section);
      }
    });

    // Filter out sections from the order that are no longer in the list
    currentSectionOrder = currentSectionOrder.filter(section => allSectionsInList.includes(section));

    // Ensure 'Uncategorized' is always last if it exists
    if (currentSectionOrder.includes(t('Uncategorized', language))) {
      currentSectionOrder = currentSectionOrder.filter(s => s !== t('Uncategorized', language));
      currentSectionOrder.push(t('Uncategorized', language));
    }

    // If currentSectionOrder is still empty after adding uncategorized, but there are sections, sort them
    if (currentSectionOrder.length === 0 && allSectionsInList.length > 0) {
        currentSectionOrder = allSectionsInList.sort((a, b) => {
            if (a === t('Uncategorized', language)) return 1;
            if (b === t('Uncategorized', language)) return -1;
            return a.localeCompare(b);
        });
    }


    // Create the final sorted list based on the determined order
    const finalSortedList = {};
    currentSectionOrder.forEach(key => {
      if (newSortedList[key]) {
        finalSortedList[key] = newSortedList[key];
      }
    });

    setSortedShoppingList(finalSortedList);
    // Update the sectionOrder state if it changed (e.g., new sections added)
    if (JSON.stringify(sectionOrder) !== JSON.stringify(currentSectionOrder)) {
      setSectionOrder(currentSectionOrder);
      // Also persist this new order to Firestore
      if (db && userId) {
        const userLayoutDocRef = doc(db, `artifacts/${appId}/users/${userId}/userStoreLayouts`, 'myLayout');
        setDoc(userLayoutDocRef, { sectionOrder: currentSectionOrder, userId: userId }, { merge: true })
          .catch(error => console.error("Error saving new section order:", error));
      }
    }

  }, [rawShoppingList, storeLayout, sectionOrder, boughtItems, db, userId, appId, language]); // Added boughtItems to dependencies

  const clearList = useCallback(() => {
    setRawShoppingList([]);
    setSortedShoppingList({});
    setBoughtItems(new Set()); // Clear bought items when list is cleared
  }, []);

  const removeItem = useCallback((itemToRemove) => {
    setRawShoppingList(prev => {
      const updatedRawList = prev.filter(item => item !== itemToRemove);
      return updatedRawList;
    });
    setBoughtItems(prev => { // Also remove from boughtItems set
      const newSet = new Set(prev);
      newSet.delete(itemToRemove);
      return newSet;
    });
    // Call sortShoppingList to update the displayed sorted list immediately after removal
    // This will re-evaluate sections and items.
    sortShoppingList();
  }, [sortShoppingList]);

  const handleToggleBought = useCallback((itemToToggle) => {
    setBoughtItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemToToggle)) {
        newSet.delete(itemToToggle);
      } else {
        newSet.add(itemToToggle);
      }
      return newSet;
    });
    // Re-sort the list after toggling bought status to move items
    // This will be triggered by boughtItems change in useEffect, but explicit call for immediate feedback.
    sortShoppingList();
  }, [sortShoppingList]);


  // --- Firestore Operations for Store Layout and Saved Lists ---
  const updateStoreLayout = useCallback(async () => {
    if (!db || !userId) {
      setLayoutMessage(t('Firestore not ready. Please wait for authentication.', language));
      return;
    }
    if (!layoutItem.trim() || !layoutSection.trim()) {
      setLayoutMessage(t('Please enter both an item and a section.', language));
      return;
    }

    setFirestoreLoading(true);
    setLayoutMessage('');
    try {
      const userLayoutDocRef = doc(db, `artifacts/${appId}/users/${userId}/userStoreLayouts`, 'myLayout');
      const currentLayout = (await getDoc(userLayoutDocRef)).data()?.sections || {};
      const updatedLayout = {
        ...currentLayout,
        [layoutItem.trim()]: layoutSection.trim()
      };
      await setDoc(userLayoutDocRef, { sections: updatedLayout, userId: userId }, { merge: true });
      setLayoutItem('');
      setLayoutSection('');
      setLayoutMessage(t('Mapping updated successfully!', language));
      sortShoppingList(); // Re-sort the list immediately after updating layout
    } catch (error) {
      console.error("Error updating store layout:", error);
      setLayoutMessage(`${t('Failed to update layout:', language)} ${error.message}`);
    } finally {
      setFirestoreLoading(false);
    }
  }, [db, userId, appId, layoutItem, layoutSection, sortShoppingList, language]);

  const saveCurrentList = useCallback(async () => {
    if (!db || !userId) {
      setLayoutMessage(t('Firestore not ready. Please wait for authentication.', language));
      return;
    }
    if (!newListName.trim()) {
      setLayoutMessage(t('Please enter a name for your list.', language));
      return;
    }
    if (rawShoppingList.length === 0) {
      setLayoutMessage(t('Cannot save an empty list.', language));
      return;
    }

    setFirestoreLoading(true);
    setLayoutMessage('');
    try {
      const listsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/userShoppingLists`);
      await addDoc(listsCollectionRef, {
        name: newListName.trim(),
        items: rawShoppingList,
        boughtItems: Array.from(boughtItems), // Save bought items
        createdAt: new Date(),
        userId: userId // Store userId with the list for security rules
      });
      setNewListName('');
      setShowSaveModal(false);
      setLayoutMessage(t('List saved successfully!', language));
    } catch (error) {
      console.error("Error saving list:", error);
      setLayoutMessage(`${t('Failed to save list:', language)} ${error.message}`);
    } finally {
      setFirestoreLoading(false);
    }
  }, [db, userId, appId, newListName, rawShoppingList, boughtItems, language]);

  const loadSelectedList = useCallback(async (listId) => {
    if (!db || !userId) {
      setLayoutMessage(t('Firestore not ready. Please wait for authentication.', language));
      return;
    }

    setFirestoreLoading(true);
    setLayoutMessage('');
    try {
      const listDocRef = doc(db, `artifacts/${appId}/users/${userId}/userShoppingLists`, listId);
      const docSnap = await getDoc(listDocRef);
      if (docSnap.exists()) {
        const loadedList = docSnap.data();
        setRawShoppingList(loadedList.items || []);
        setShoppingListInput(loadedList.items ? loadedList.items.join('\n') : '');
        setBoughtItems(new Set(loadedList.boughtItems || [])); // Load bought items
        setSortedShoppingList({}); // Clear sorted list until re-sorted
        setShowLoadModal(false);
        setLayoutMessage(`${t('List loaded successfully!', language)}`);
      } else {
        setLayoutMessage(t('List not found.', language));
      }
    } catch (error) {
      console.error("Error loading list:", error);
      setLayoutMessage(`${t('Failed to load list:', language)} ${error.message}`);
    } finally {
      setFirestoreLoading(false);
    }
  }, [db, userId, appId, language]);

  const deleteSavedList = useCallback(async (listId) => {
    if (!db || !userId) {
      setLayoutMessage(t('Firestore not ready. Please wait for authentication.', language));
      return;
    }

    setFirestoreLoading(true);
    setLayoutMessage('');
    try {
      const listDocRef = doc(db, `artifacts/${appId}/users/${userId}/userShoppingLists`, listId);
      await deleteDoc(listDocRef);
      setLayoutMessage(t('List deleted successfully!', language));
    } catch (error) {
      console.error("Error deleting list:", error);
      setLayoutMessage(`${t('Failed to delete list:', language)} ${error.message}`);
    } finally {
      setFirestoreLoading(false);
    }
  }, [db, userId, appId, language]);

  // --- Gemini API Call for Auto-Mapping (NEW) ---
  const autoMapItems = useCallback(async () => {
    if (rawShoppingList.length === 0) {
      setAutoMappingError(t('No items in list to suggest layout for.', language));
      return;
    }
    if (!db || !userId) {
      setAutoMappingError(t('Firestore not ready for auto-mapping. Please wait for authentication.', language));
      return;
    }

    setLoadingAutoMapping(true);
    setAutoMappingError('');

    try {
      const prompt = `For the following list of grocery items, suggest a common supermarket section for each item. Respond with a JSON array of objects, where each object has 'item' and 'section' keys. If an item doesn't fit a common section, use 'Miscellaneous'.

Items:
${rawShoppingList.join('\n')}`;

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "item": { "type": "STRING" },
                "section": { "type": "STRING" }
              },
              "propertyOrdering": ["item", "section"]
            }
          }
        }
      };
      const apiKey = ""; // Canvas will automatically provide the API key at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const suggestedMappings = JSON.parse(jsonString);

        if (Array.isArray(suggestedMappings)) {
          const userLayoutDocRef = doc(db, `artifacts/${appId}/users/${userId}/userStoreLayouts`, 'myLayout');
          const currentLayout = (await getDoc(userLayoutDocRef)).data()?.sections || {};
          let updatedLayout = { ...currentLayout };

          suggestedMappings.forEach(mapping => {
            // Only add if not already explicitly mapped by the user or if it's a new item
            const trimmedItem = mapping.item.trim();
            const trimmedSection = mapping.section.trim();
            if (trimmedItem && trimmedSection && !updatedLayout[trimmedItem]) {
              updatedLayout[trimmedItem] = trimmedSection;
            }
          });

          await setDoc(userLayoutDocRef, { sections: updatedLayout, userId: userId }, { merge: true });
          setLayoutMessage(t('Auto-mapping complete! Review and adjust in \"Store Layout\" section.', language));
          sortShoppingList(); // Re-sort the list after auto-mapping
        } else {
          setAutoMappingError(t('AI returned unexpected format for auto-mapping.', language));
          console.error('AI response format error:', suggestedMappings);
        }
      } else {
        setAutoMappingError(t('Could not auto-map items. Unexpected AI response.', language));
        console.error('AI response error:', result);
      }
    } catch (error) {
      setAutoMappingError(`${t('Auto-mapping failed:', language)} ${error.message}`);
      console.error('Fetch error for auto-mapping:', error);
    } finally {
      setLoadingAutoMapping(false);
    }
  }, [rawShoppingList, db, userId, appId, sortShoppingList, language]);


  // --- Three.js Scene (Adapted for Shopping Theme) ---
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Create a stylized shopping cart
    const cartGroup = new THREE.Group();

    // Body of the cart
    const bodyGeometry = new THREE.BoxGeometry(3, 2, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: darkMode ? 0x4a4a4a : 0xcccccc, roughness: 0.6, metalness: 0.3 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    cartGroup.add(body);

    // Handle
    const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: darkMode ? 0x6a0dad : 0x00bcd4 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 2.2, 2.2);
    cartGroup.add(handle);

    // Wheels (simple cylinders)
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.position.set(1.2, 0.2, 1.8);
    wheel1.rotation.x = Math.PI / 2;
    cartGroup.add(wheel1);

    const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.position.set(-1.2, 0.2, 1.8);
    wheel2.rotation.x = Math.PI / 2;
    cartGroup.add(wheel2);

    const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel3.position.set(1.2, 0.2, -1.8);
    wheel3.rotation.x = Math.PI / 2;
    cartGroup.add(wheel3);

    const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel4.position.set(-1.2, 0.2, -1.8);
    wheel4.rotation.x = Math.PI / 2;
    cartGroup.add(wheel4);

    scene.add(cartGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    camera.position.z = 8;
    camera.position.y = 2;

    const animate = () => {
      requestAnimationFrame(animate);
      cartGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      bodyGeometry.dispose();
      handleGeometry.dispose();
      wheelGeometry.dispose();
      bodyMaterial.dispose();
      handleMaterial.dispose();
      wheelMaterial.dispose();
    };
  }, [darkMode]);

  // --- GSAP ScrollTrigger animations ---
  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('GSAP or ScrollTrigger not loaded yet for scroll animations.');
      return;
    }

    sectionRefs.current.forEach((el) => {
      window.gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    return () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }
    };
  }, [sectionRefs.current]);

  // --- Dynamic Cursor ---
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    if (!window.gsap) {
      console.warn('GSAP not loaded yet for dynamic cursor.');
      return;
    }

    const onMouseMove = (e) => {
      window.gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // --- Drag and Drop Logic for Sections ---
  const handleDragStart = useCallback((e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index); // Set data for drag operation
    e.currentTarget.classList.add('opacity-50'); // Add visual feedback for dragging
  }, []);

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault(); // Necessary to allow drop
    dragOverItem.current = index;
    // Add visual feedback for drag over
    e.currentTarget.classList.add('border-2', 'border-dashed', 'border-cyan-500');
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Remove visual feedback for drag over
    e.currentTarget.classList.remove('border-2', 'border-dashed', 'border-cyan-500');
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); // Necessary to allow drop
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('opacity-50', 'border-2', 'border-dashed', 'border-cyan-500'); // Remove drag feedback

    const draggedIndex = dragItem.current;
    const droppedIndex = dragOverItem.current;

    if (draggedIndex === null || droppedIndex === null || draggedIndex === droppedIndex) {
      return;
    }

    const newSectionOrder = [...sectionOrder];
    const [reorderedItem] = newSectionOrder.splice(draggedIndex, 1);
    newSectionOrder.splice(droppedIndex, 0, reorderedItem);

    setSectionOrder(newSectionOrder); // Update local state
    sortShoppingList(); // Re-sort to reflect new order

    // Persist the new order to Firestore
    if (db && userId) {
      const userLayoutDocRef = doc(db, `artifacts/${appId}/users/${userId}/userStoreLayouts`, 'myLayout');
      try {
        await setDoc(userLayoutDocRef, { sectionOrder: newSectionOrder, userId: userId }, { merge: true });
        setLayoutMessage(t('Section order saved successfully!', language));
      } catch (error) {
        console.error("Error saving section order:", error);
        setLayoutMessage(`${t('Failed to save section order:', language)} ${error.message}`);
      }
    }

    dragItem.current = null;
    dragOverItem.current = null;
  }, [sectionOrder, sortShoppingList, db, userId, appId, language]);

  const handleDragEnd = useCallback((e) => {
    // Clean up opacity after drag ends, regardless of drop success
    e.currentTarget.classList.remove('opacity-50');
    // Also remove drag over styles from any element that might still have them
    const allSections = document.querySelectorAll('[draggable="true"]');
    allSections.forEach(sectionEl => {
      sectionEl.classList.remove('border-2', 'border-dashed', 'border-cyan-500');
    });
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  return (
    <div className={`min-h-screen font-inter transition-colors duration-500 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Dynamic Cursor */}
      <div
        ref={cursorRef}
        className={`fixed z-50 pointer-events-none w-8 h-8 rounded-full mix-blend-difference opacity-70 transition-transform duration-100 ease-out ${language === 'he' ? 'left-auto right-1/2' : ''} -translate-x-1/2 -translate-y-1/2 ${darkMode ? 'bg-cyan-400' : 'bg-purple-600'}`}
        style={{ transform: 'translate(-50%, -50%)', willChange: 'transform' }}
      ></div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold flex items-center gap-2">
          {/* ShoppingCart Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-7 h-7 ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          {t('SmartShopper', language)}
        </div>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li><a href="#manage-list" className="hover:text-purple-400 transition-colors">{t('Manage List', language)}</a></li>
            <li><a href="#store-layout" className="hover:text-purple-400 transition-colors">{t('Store Layout', language)}</a></li>
            <li>
              <button
                onClick={toggleLanguage}
                className={`p-2 rounded-full transition-all duration-300 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                aria-label="Toggle language"
              >
                {/* Globe Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </button>
            </li>
            <li>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all duration-300 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* 3D Canvas */}
        <div ref={mountRef} className="absolute inset-0 z-0"></div>
        <div className="relative z-10 text-center p-4">
          <h1 className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tighter drop-shadow-lg animate-fade-in-up">
            {t('Smart Shopping, Simplified.', language)}
          </h1>
          <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto opacity-90 animate-fade-in-up delay-200">
            {t('Organize your groceries by store section for a faster, smarter trip.', language)}
          </p>
          <button
            onClick={() => document.getElementById('manage-list').scrollIntoView({ behavior: 'smooth' })}
            className={`mt-10 px-8 py-4 rounded-full text-lg font-semibold shadow-xl transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-cyan-500 text-gray-900 hover:bg-cyan-400' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
          >
            {t('Start Shopping', language)}
          </button>
        </div>
      </section>

      {/* Main Shopping List Management Section */}
      <section id="manage-list" className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-16 animate-fade-in-up">{t('Your Smart Shopping List', language)}</h2>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Input & Controls */}
          <div ref={addToRefs} className={`lg:w-1/2 p-8 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
              {/* List Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
              {t('Add & Manage Items', language)}
            </h3>
            <textarea
              value={shoppingListInput}
              onChange={(e) => setShoppingListInput(e.target.value)}
              placeholder={t("Enter items, one per line (e.g., Milk, Bread, Apples)", language)}
              rows="8"
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none resize-y mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'}`}
              aria-label="Shopping list input"
            ></textarea>
            <div className="flex flex-col gap-4 mb-6">
              {/* Primary List Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={addItemsToList}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-purple-700 text-white hover:bg-purple-600'}`}
                >
                  {/* Plus Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  {t('Add Items', language)}
                </button>
                <button
                  onClick={sortShoppingList}
                  disabled={rawShoppingList.length === 0} // Disabled if rawShoppingList is empty
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${rawShoppingList.length === 0 ? 'opacity-60 cursor-not-allowed' : (darkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-cyan-500 text-gray-900 hover:bg-cyan-400')}`}
                >
                  {/* LayoutGrid Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                  {t('Sort by Section', language)}
                </button>
              </div>

              {/* AI Features */}
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={autoMapItems} // New button for auto-mapping
                  disabled={loadingAutoMapping || rawShoppingList.length === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${loadingAutoMapping || rawShoppingList.length === 0 ? 'opacity-60 cursor-not-allowed' : (darkMode ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-teal-600 text-white hover:bg-teal-500')}`}
                >
                  {/* Sparkles Icon for AI suggestion */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M10 13v7.9l-1.3-3.2c-1.4-3.5-4.2-5.7-7.2-6.7"/><path d="M20.2 11.2c-2.3 0-4.6-.3-6.8-.7L10 9.8"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/><path d="m14 10 2 2 4-4"/><path d="m14 10-2-2-4 4"/></svg>
                  {loadingAutoMapping ? t('Suggesting Layout...', language) : t('Suggest Layout', language)}
                </button>
              </div>

              {/* List Persistence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setShowSaveModal(true)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {/* Save Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {t('Save List', language)}
                </button>
                <button
                  onClick={() => setShowLoadModal(true)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {/* FolderOpen Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M6 17a3 3 0 0 0 3 3h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8a2 2 0 0 1-2-2 2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2"/><path d="M10 12h4"/></svg>
                  {t('Load List', language)}
                </button>
              </div>

              {/* Destructive Action */}
              <div className="grid grid-cols-1">
                <button
                  onClick={clearList}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${darkMode ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                  {/* Trash2 Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  {t('Clear List', language)}
                </button>
              </div>
            </div>
            {firestoreLoading && <p className="text-center text-sm opacity-70">{t('Loading/Saving data...', language)}</p>}
            {firestoreError && <p className="text-center text-red-500 text-sm">{firestoreError}</p>}
            {autoMappingError && <p className="text-center text-red-500 text-sm">{autoMappingError}</p>} {/* Auto-mapping error display */}
            {userId && <p className="text-center text-sm opacity-70 mt-4">{t('Your User ID:', language)} <span className="font-mono text-xs">{userId}</span></p>}
          </div>

          {/* Sorted List Display */}
          <div ref={addToRefs} className={`lg:w-1/2 p-8 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
              {/* List Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
              {t('Sorted List', language)}
            </h3>
            {Object.keys(sortedShoppingList).length === 0 && rawShoppingList.length === 0 ? (
              <p className="opacity-70 text-center">{t('Add items to your list, then click "Sort by Section".', language)}</p>
            ) : Object.keys(sortedShoppingList).length === 0 && rawShoppingList.length > 0 ? (
                <>
                    <p className="opacity-70 text-center mb-4">{t('Click "Sort by Section" to organize your list.', language)}</p>
                    <h4 className="text-xl font-semibold mb-3">{t('Current Raw List:', language)}</h4>
                    <ul className="list-disc list-inside space-y-1 opacity-80 max-h-60 overflow-y-auto">
                    {rawShoppingList.map((item, index) => (
                        <li key={index} className="flex justify-between items-center pr-2">
                            <span>{item}</span>
                            <button
                                onClick={() => removeItem(item)}
                                className={`text-red-400 hover:text-red-600 transition-colors p-1 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                                aria-label={`${t('Remove ', language)}${item}`}
                            >
                                {/* Trash2 Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </li>
                    ))}
                    </ul>
                </>
            ) : (
              <div className="space-y-6">
                {sectionOrder.map((section, index) => {
                  // Only render if the section actually has items in the current sorted list
                  if (!sortedShoppingList[section]) return null;
                  return (
                    <div
                      key={section}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                      className={`border-b pb-4 last:border-b-0 cursor-grab transition-all duration-200 ${dragItem.current === index ? 'opacity-50' : ''}`}
                    >
                      <h4
                        className={`text-2xl font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-cyan-400' : 'text-purple-600'}`}
                      >
                        {/* Drag Handle Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-grab"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        {section}
                      </h4>
                      <ul className="space-y-2">
                        {sortedShoppingList[section].map((item, itemIndex) => (
                          <li key={itemIndex} className="flex justify-between items-center text-lg">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={boughtItems.has(item)}
                                onChange={() => handleToggleBought(item)}
                                className={`form-checkbox h-5 w-5 rounded ${darkMode ? 'text-cyan-500 bg-gray-700 border-gray-600' : 'text-purple-600 bg-gray-100 border-gray-300'}`}
                              />
                              <span className={`${boughtItems.has(item) ? 'line-through opacity-60' : ''}`}>
                                {item}
                              </span>
                            </label>
                            <button
                              onClick={() => removeItem(item)}
                              className={`text-red-400 hover:text-red-600 transition-colors p-1 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                              aria-label={`${t('Remove ', language)}${item}`}
                            >
                              {/* Trash2 Icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Store Layout Management Section */}
      <section id="store-layout" className="py-20 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl font-bold mb-8 animate-fade-in-up">{t('Customize Your Store Layout', language)}</h2>
        <p className="text-xl opacity-80 mb-12 animate-fade-in-up delay-100">
          {t('Teach SmartShopper how your local store is organized by mapping items to sections. Auto-mapped items will appear here for review.', language)}
        </p>
        <div ref={addToRefs} className={`p-8 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
            {/* LayoutGrid Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            {t('Add/Update Mapping', language)}
          </h3>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={layoutItem}
              onChange={(e) => setLayoutItem(e.target.value)}
              placeholder={t("Item (e.g., 'Milk')", language)}
              className={`flex-grow p-3 rounded-lg border focus:ring-2 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'}`}
              aria-label="Item for layout"
            />
            <input
              type="text"
              value={layoutSection}
              onChange={(e) => setLayoutSection(e.target.value)}
              placeholder={t("Section (e.g., 'Dairy')", language)}
              className={`flex-grow p-3 rounded-lg border focus:ring-2 focus:outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'}`}
              aria-label="Section for layout"
            />
            <button
              onClick={updateStoreLayout}
              disabled={firestoreLoading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${firestoreLoading ? 'opacity-60 cursor-not-allowed' : (darkMode ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-purple-700 text-white hover:bg-purple-600')}`}
            >
              {/* Plus Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              {t('Add Mapping', language)}
            </button>
          </div>
          {layoutMessage && <p className="text-sm mt-2">{layoutMessage}</p>}

          <h3 className="text-2xl font-bold mt-8 mb-4">{t('Current Mappings:', language)}</h3>
          {Object.keys(storeLayout).length === 0 ? (
            <p className="opacity-70">{t('No custom mappings yet. Add some above or add items to your list for auto-mapping suggestions!', language)}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left max-h-80 overflow-y-auto p-2 rounded-lg border border-dashed">
              {Object.entries(storeLayout).map(([item, section]) => (
                <div key={item} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className="font-semibold">{item}:</span> {section}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Save List Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
            <h3 className="text-2xl font-bold mb-4">{t('Save Your Shopping List', language)}</h3>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={t("Enter list name (e.g., 'Weekly Groceries')", language)}
              className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'}`}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                {t('Cancel', language)}
              </button>
              <button
                onClick={saveCurrentList}
                disabled={firestoreLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${firestoreLoading ? 'opacity-60 cursor-not-allowed' : (darkMode ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-purple-700 text-white hover:bg-purple-600')}`}
              >
                {firestoreLoading ? t('Saving...', language) : t('Save', language)}
              </button>
            </div>
            {layoutMessage && <p className="text-sm mt-4 text-center">{layoutMessage}</p>}
          </div>
        </div>
      )}

      {/* Load List Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
            <h3 className="text-2xl font-bold mb-4">{t('Load a Saved List', language)}</h3>
            {savedShoppingLists.length === 0 ? (
              <p className="opacity-70 mb-4">{t('No saved lists found.', language)}</p>
            ) : (
              <ul className="mb-4 space-y-2 max-h-60 overflow-y-auto">
                {savedShoppingLists.map(list => (
                  <li key={list.id} className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <span>{list.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadSelectedList(list.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${darkMode ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-purple-700 text-white hover:bg-purple-600'}`}
                      >
                        {t('Load', language)}
                      </button>
                      <button
                        onClick={() => deleteSavedList(list.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${darkMode ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                      >
                        {t('Delete', language)}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoadModal(false)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                {t('Close', language)}
              </button>
            </div>
            {layoutMessage && <p className="text-sm mt-4 text-center">{layoutMessage}</p>}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`py-8 text-center text-sm opacity-70 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
        <p>&copy; 2025 {t('SmartShopper', language)}. {t('All rights reserved. Powered by intelligent design.', language)}</p>
      </footer>

      {/* CDN for GSAP and ScrollTrigger */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
      {/* Tailwind CSS CDN - Ensure this is loaded */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Inter font from Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>
        {`
          /* Custom font */
          body {
            font-family: 'Inter', sans-serif;
          }

          /* Basic animation for hero text */
          @keyframes fadeInFromBottom {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-up {
            animation: fadeInFromBottom 0.8s ease-out forwards;
            opacity: 0; /* Ensure it's hidden before animation */
          }

          .animate-fade-in-up.delay-100 { animation-delay: 0.1s; }
          .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
          /* Add more delays as needed */

          /* Hide scrollbar for aesthetics, but allow scrolling */
          body {
            overflow-y: scroll;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none;  /* IE and Edge */
          }
          body::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera*/
          }
          /* Basic prose styling for generated ideas (not used in this version, but kept for consistency if needed) */
          .prose ul {
            list-style-type: disc;
            margin-left: 1.5em;
          }
          .prose li {
            margin-bottom: 0.5em;
          }
        `}
      </style>
    </div>
  );
}
return (
  <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
    <h1>{t("SmartShopper", language)}</h1>
    <p>{t("Smart Shopping, Simplified.", language)}</p>
    {/* Add buttons, lists, inputs, etc. here */}
  </div>
);
export default App;
