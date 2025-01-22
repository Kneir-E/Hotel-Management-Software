import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7Fvfzf_JUowAi8mYQMyOE_uDa5yUqX0Q",
  authDomain: "fir-prac-310e2.firebaseapp.com",
  databaseURL: "https://fir-prac-310e2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-prac-310e2",
  storageBucket: "fir-prac-310e2.appspot.com",
  messagingSenderId: "311742368262",
  appId: "1:311742368262:web:7d6fe303992c5ced3f5187"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

const bookingRef = collection(db, 'booking');
const customerRef = collection(db, 'customer');
const roomsRef = collection(db, 'rooms');
const room_add_ons_Ref = collection(db, 'room_add_ons')
// customer collection ref
const customer_Ref = collection(db, 'customer')
// customer collection ref
const booking_Ref = collection(db, 'booking')
// Get all the documents from the booking collection

Promise.all([getDocs(bookingRef), getDocs(customerRef), getDocs(roomsRef)])
  .then(([bookingSnapshot, customerSnapshot, roomsSnapshot]) => {
    bookingSnapshot.forEach(async (bookingDoc) => {
      const { customer_id, check_in, check_out, room } = bookingDoc.data();

      const row = bookingTableBody.insertRow();

      const lastNameCell = row.insertCell(0);
      const checkinCell = row.insertCell(1);
      const checkoutCell = row.insertCell(2);
      const roomCell = row.insertCell(3);
      const deleteCell = row.insertCell(4);


      const customerDocRef = doc(customerRef, customer_id);
      const customerSnap = await getDoc(customerDocRef);
      const customerData = customerSnap.data();
      const lastName = customerData.last_name;

      const roomsDocRef = doc(roomsRef, room);
      const roomsSnap = await getDoc(roomsDocRef);
      const roomsData = roomsSnap.data();
      const roomNum = roomsData.roomNo;

      lastNameCell.innerHTML = lastName;
      checkinCell.innerHTML = check_in.toDate().toLocaleString();
      checkoutCell.innerHTML = check_out.toDate().toLocaleString();
      roomCell.innerHTML = roomNum;

      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = "Delete";
      deleteCell.appendChild(deleteButton);

      deleteButton.addEventListener("click", async () => {
        // Delete the booking document
        await deleteDoc(doc(bookingRef, bookingDoc.id));
        // Remove the row from the table
        row.remove();
      });
    });
  });
  
 