//===================== FIREBASE STUFF =====================
import { initializeApp } from 'firebase/app'

import {
    getFirestore, collection, getDocs,
    query, where, getDoc, doc, updateDoc,
    update, setDoc, addDoc, onSnapshot,
    deleteDoc
}from '@firebase/firestore'

import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL} from 'firebase/storage'

import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC7Fvfzf_JUowAi8mYQMyOE_uDa5yUqX0Q",
    authDomain: "fir-prac-310e2.firebaseapp.com",
    projectId: "fir-prac-310e2",
    storageBucket: "fir-prac-310e2.appspot.com",
    messagingSenderId: "311742368262",
    appId: "1:311742368262:web:7d6fe303992c5ced3f5187"
};

// init firebase app
initializeApp(firebaseConfig)

// init services
const db = getFirestore()

// room_booking_packages collection ref
const room_packages_Ref = collection(db, 'room_booking_packages')

// room_booking_packages collection ref
const customers_Ref = collection(db, 'customer')

// rooms collection Ref
const rooms_Ref = collection(db, 'rooms')

// storage ref
const storageRef = getStorage()

// users collection Ref (for login)
const users_Ref = collection(db, 'roles')

//Auth Reference
const auth = getAuth()

// CHECKS IF LOGGED IN
auth.onAuthStateChanged( async function(user) {
    if (!user) {
      // User is not signed in, redirect to login page
      alert('This page requires you to be logged in as a Hotel Manager')
      window.location.href = "login.html";
    } else {
      const role = await getDoc(doc(users_Ref, user.uid))
      if(role.data().role != 'manager'){
        alert('You do not have permission to access this site')
        window.location.href = "login.html";
      }
    }
})

const logout = document.getElementById('logout')
logout.addEventListener('click', async(e) => {
  try {
    await signOut(auth);
    // Sign-out successful.
    // alert('User logged out');
    window.location.href = "login.html";
  } catch (error) {
    const errorMessage = error.message;
    alert(errorMessage);
  }
})


const loading_screen = document.querySelector('.loader_container')
function toggleLoader(){
    loading_screen.classList.toggle('invisible')
}


//Initializing packages data
var customer_list = []
onSnapshot(customers_Ref, (snap) => {
    toggleLoader()
    customer_list = []
    snap.forEach((doc) => {
        customer_list.push({...doc.data(), id: doc.id })
    })
    initializeMainContent()
    addButtonFunctions()
    toggleLoader()
})

function initializeMainContent(){
    const e_customer_list_container = document.getElementById('customer_list_container')
    let content = ''
    customer_list.forEach((customer) => {
        content += 
        `<div class="customer_container" id="${customer.id}">
            <p class="customer_content last_name_container">${customer.last_name}</p>
            <p class="customer_content first_name_container">${customer.first_name}</p>
            <p class="customer_content email_container">${customer.email}</p>
            <span title="Edit" class="material-symbols-rounded edit" style="font-size: 2rem;">edit</span>
        </div>`
    })
    e_customer_list_container.innerHTML = content
}

var selectedCustomer
function addButtonFunctions(){
    var e_edit_button_list = document.querySelectorAll('.edit')
    e_edit_button_list.forEach((button) => {
        button.addEventListener('click', (e) => {
            selectedCustomer = customer_list.find((cust) => cust.id == button.parentElement.id)
            edit_customer(button.parentElement.id)
        })
    })

}

function edit_customer(){
    const e_popup = document.querySelector('.popup')
    e_popup.classList.toggle('invisible')
    e_last_name.value = selectedCustomer.last_name
    e_first_name.value = selectedCustomer.first_name
    e_email.value = selectedCustomer.email
    e_phone.value = selectedCustomer.phone_num
}   

const e_last_name = document.getElementById('e_last_name')
const e_first_name = document.getElementById('e_first_name')
const e_email = document.getElementById('e_email')
const e_phone = document.getElementById('e_phone_num')
document.getElementById('e_last_name_undo').addEventListener('click', (e) => {e_last_name.value = selectedCustomer.last_name})
document.getElementById('e_first_name_undo').addEventListener('click', (e) => {e_first_name.value = selectedCustomer.first_name})
document.getElementById('e_email_undo').addEventListener('click', (e) => {e_email.value = selectedCustomer.email})
document.getElementById('e_phone_num_undo').addEventListener('click', (e) => {e_phone.value = selectedCustomer.phone_name})

document.getElementById('close_popup').addEventListener('click', (e) => {
    document.querySelector('.popup').classList.toggle('invisible')
})

document.getElementById('submit_button').addEventListener('click', (e)=> {
    e.preventDefault()
    toggleLoader()
    updateDoc(doc(customers_Ref, selectedCustomer.id),
        {
            last_name: e_last_name.value,
            first_name: e_first_name.value,
            email: e_email.value,
            phone_num: e_phone.value
        }
    ).then((snap) => {
        document.querySelector('.popup').classList.toggle('invisible')
        toggleLoader()
    })
})


document.getElementById('search_button').addEventListener('click', (e) => {
    refresh_search()
    searchFunction()
})

document.getElementById('undo_button').addEventListener('click', (e) => {
    refresh_search()
})

function refresh_search(){
    let searched_node_list = document.querySelectorAll('.customer_container')
    searched_node_list.forEach((node) => {
        node.classList.remove('invisible')
    })
}

function searchFunction(){
    let search_type = document.getElementById('current_search_type').value
    let search_input = document.getElementById('search_input')
    let searched_node_list
    if(search_type == 0){
        searched_node_list = document.querySelectorAll('.last_name_container')
    }else if(search_type == 1){
        searched_node_list = document.querySelectorAll('.first_name_container')
    }else{
        searched_node_list = document.querySelectorAll('.customer_container')
    }

    searched_node_list.forEach((node) => {
        if(node.innerHTML.toLowerCase().includes(search_input.value.toLowerCase())){
            
        }else{
            if(search_type == 0 || search_type == 1){
                node.parentElement.classList.add('invisible')
            }else{
                node.classList.add('invisible')
            }
        }
    })

}