import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, ref, collection, doc, getDoc } from '@firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyC7Fvfzf_JUowAi8mYQMyOE_uDa5yUqX0Q",
  authDomain: "fir-prac-310e2.firebaseapp.com",
  databaseURL: "https://fir-prac-310e2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-prac-310e2",
  storageBucket: "fir-prac-310e2.appspot.com",
  messagingSenderId: "311742368262",
  appId: "1:311742368262:web:7d6fe303992c5ced3f5187"
};

// Initialize Firebase
initializeApp(firebaseConfig)

//init auth
const auth = getAuth();
//init firestore
const db = getFirestore();

// room_booking_packages collection ref
const room_packages_Ref = collection(db, 'room_booking_packages')
// rooms collection Ref
const rooms_Ref = collection(db, 'rooms')
// room_add_ons collection Ref
const room_add_ons_Ref = collection(db, 'room_add_ons')
// customer collection ref
const customer_Ref = collection(db, 'customer')
// customer collection ref
const booking_Ref = collection(db, 'booking')

const users_Ref = collection(db, 'roles')



// Handle sign in button click
const signinbtn = document.getElementById('signIn');
signinbtn.addEventListener('click', async e => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validate user inputs
  if (!email || !password) {
    alert("Please enter valid email and password.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // const dt = new Date();
    // // Store the timestamp instead of the Date object
    // await update(ref(database, 'users/' + user.uid), {
    //   last_login: dt.getTime(),
    // });

    let hyperlink

    let user_type = await check_user_role(user.uid)
    if(user_type == 0){
      hyperlink = "hh_hotel_manager_view.html"
    }else if(user_type == 1){
      hyperlink = "hh_employee_overview.html"
    }else{
      alert('else')
      hyperlink = "login.html"
    }
    
    // alert('User logged in!');
    window.location.href = hyperlink
  } catch (error) {
    const errorMessage = "Invalid login. Check Username and password";
    alert(errorMessage);
  }
});


async function check_user_role(user_uid){
  const user_ref = doc(users_Ref, user_uid)
  let snap = await getDoc(user_ref)
  if(snap.data().role == 'manager'){
    return 0
  }else if(snap.data().role == 'employee'){
    return 1
  }else{
    return 2
  }
}

// // Handle sign up button click
// const signupbtn = document.getElementById('signUp');
// signupbtn.addEventListener("click", async e => {
//   e.preventDefault();

//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   // Validate user inputs
//   if (!email || !password) {
//     alert("Please enter valid email and password.");
//     return;
//   }

//   try {
//     // Create user
//     await createUserWithEmailAndPassword(auth, email, password);
//     alert("Signed Up Successfully");
//     location.reload();

//   } catch (error) {
//     alert(error.message);
//   }
// });

// const signOutBtn = document.getElementById('signOut');
// signOutBtn.addEventListener('click', async e => {
//   e.preventDefault();
//   try {
//     await signOut(auth);
//     // Sign-out successful.
//     alert('User logged out');
//     window.location.href = "login.html";
//   } catch (error) {
//     const errorMessage = error.message;
//     alert(errorMessage);
//   }
// });
