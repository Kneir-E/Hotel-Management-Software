//===================== FIREBASE STUFF =====================
import { initializeApp } from 'firebase/app'

import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import {
    getFirestore, collection, getDocs,
    query, where, getDoc, doc, updateDoc,
    update, setDoc, addDoc, onSnapshot,
    Timestamp
}from '@firebase/firestore'


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
// rooms collection Ref
const rooms_Ref = collection(db, 'rooms')
// room_add_ons collection Ref
const room_add_ons_Ref = collection(db, 'room_add_ons')
// customer collection ref
const customer_Ref = collection(db, 'customer')
// customer collection ref
const booking_Ref = collection(db, 'booking')

//users Ref (for login)
const users_Ref = collection(db, 'roles')

//Auth Reference
const auth = getAuth()

// CHECKS IF LOGGED IN
auth.onAuthStateChanged( async function(user) {
    if (!user) {
      // User is not signed in, redirect to login page
      alert('This page requires you to be logged in as an employee')
      window.location.href = "login.html";
    } else {
      const role = await getDoc(doc(users_Ref, user.uid))
      if(role.data().role != 'employee'){
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

async function main(){
  var today = new Date()
  await initializePage(today)
  addFunctionToSearch()
}
main()

var filtered_bookings = []
async function initializePage(today){
  const q = query(booking_Ref, where('check_out', '>=', Timestamp.fromDate(today)))
  let unfiltered_bookings = await getDocs(q)

  unfiltered_bookings.forEach((booking) => {
    let this_check_in = new Date(booking.data().check_in.toDate())
    if(this_check_in <= today)
    filtered_bookings.push({...booking.data(), id: booking.id})
  })

  checked_total = 0
  unchecked_total = 0
  filtered_bookings.forEach((booking) => {
    // console.log(booking)
    if(booking.checked_in == 0){
      createUncheckedData(booking)
    }else if(booking.checked_out == 0){
      createCheckedData(booking)
    }
  })
}


var total_expected_guests = 0
let unchecked_total = 0
const e_unchecked_bookings_container = document.getElementById('unchecked_bookings_container')
async function createUncheckedData(booking){
  let container = document.createElement('div')
  container.className = 'booking'
  container.id = booking.id

  let name_ref = doc(customer_Ref, booking.customer_id)
  let name_snap = await getDoc(name_ref)
  let room_ref = doc(rooms_Ref, booking.room)
  let room_snap = await getDoc(room_ref)

  let e_customer_name = document.createElement('span')
  e_customer_name.className = 'customer_name'
  e_customer_name.innerHTML = `${name_snap.data().last_name} ${name_snap.data().first_name}`

  let e_room = document.createElement('span')
  e_room.innerHTML = room_snap.data().roomNo

  let check_in_date = booking.check_in.toDate()
  let e_date_check_in = document.createElement('span')
  e_date_check_in.innerHTML = `${check_in_date.getMonth()+1} ${check_in_date.getDate()}, ${check_in_date.getFullYear()}`

  let check_out_date = booking.check_out.toDate()
  let e_date_check_out = document.createElement('span')
  e_date_check_out.innerHTML = `${check_out_date.getMonth()+1} ${check_out_date.getDate()}, ${check_out_date.getFullYear()}`

  let e_icon_group = document.createElement('div')

  let e_icon_check_in = document.createElement('span')
  e_icon_check_in.classList.add("material-symbols-rounded", "check_in_button")
  e_icon_check_in.title = 'Check-in'
  e_icon_check_in.innerHTML = 'login'

  e_icon_check_in.addEventListener('click', async (e) => {
    await updateDoc(doc(booking_Ref, e_icon_check_in.parentElement.parentElement.id), {checked_in: 1})
    location.reload()
  })

  let e_icon_expand = document.createElement('span')
  e_icon_expand.classList.add("material-symbols-rounded", "expand_content_button")
  e_icon_expand.title = 'Expand'
  e_icon_expand.innerHTML = 'expand_content'
  
  e_icon_expand.addEventListener('click', (e) => {
    popupActive(booking, name_snap, room_snap)
  })

  e_icon_group.append(e_icon_check_in, e_icon_expand)
  container.append(e_customer_name, e_room, e_date_check_in, e_date_check_out, e_icon_group)

  e_unchecked_bookings_container.append(container)
  unchecked_total++;
  total_expected_guests += Number(booking.no_child)
  total_expected_guests += Number(booking.no_adult)
  document.getElementById('total_guests').innerHTML = total_expected_guests
  document.getElementById('total_unchecked').innerHTML = unchecked_total
}

let checked_total = 0
const e_checked_bookings_container = document.getElementById('checked_bookings_container')
async function createCheckedData(booking){
  let container = document.createElement('div')
  container.className = 'booking'
  container.id = booking.id

  let name_ref = doc(customer_Ref, booking.customer_id)
  let name_snap = await getDoc(name_ref)
  let room_ref = doc(rooms_Ref, booking.room)
  let room_snap = await getDoc(room_ref)

  let e_customer_name = document.createElement('span')
  e_customer_name.innerHTML = `${name_snap.data().last_name} ${name_snap.data().first_name}`
  e_customer_name.className = 'customer_name'

  let e_room = document.createElement('span')
  e_room.innerHTML = room_snap.data().roomNo

  let check_in_date = booking.check_in.toDate()
  let e_date_check_in = document.createElement('span')
  e_date_check_in.innerHTML = `${check_in_date.getMonth()+1} ${check_in_date.getDate()}, ${check_in_date.getFullYear()}`

  let check_out_date = booking.check_out.toDate()
  let e_date_check_out = document.createElement('span')
  e_date_check_out.innerHTML = `${check_out_date.getMonth()+1} ${check_out_date.getDate()}, ${check_out_date.getFullYear()}`

  let e_icon_group = document.createElement('div')

  let e_icon_check_in = document.createElement('span')
  e_icon_check_in.classList.add("material-symbols-rounded", "check_out_button")
  e_icon_check_in.title = 'Check-out'
  e_icon_check_in.innerHTML = 'logout'

  e_icon_check_in.addEventListener('click', async (e) => {
    await updateDoc(doc(booking_Ref, e_icon_check_in.parentElement.parentElement.id), {checked_out: 1})
    location.reload()
  })

  let e_icon_expand = document.createElement('span')
  e_icon_expand.classList.add("material-symbols-rounded", "expand_content_button")
  e_icon_expand.title = 'Expand'
  e_icon_expand.innerHTML = 'expand_content'
  
  e_icon_expand.addEventListener('click', (e) => {
    popupActive(booking, name_snap, room_snap)
  })

  e_icon_group.append(e_icon_check_in, e_icon_expand)
  container.append(e_customer_name, e_room, e_date_check_in, e_date_check_out, e_icon_group)
  
  e_checked_bookings_container.append(container)
  checked_total++;
  total_expected_guests += Number(booking.no_child)
  total_expected_guests += Number(booking.no_adult)
  document.getElementById('total_guests').innerHTML = total_expected_guests
  document.getElementById('total_checked').innerHTML = checked_total
}

function popupActive(booking, cust_snap, room_snap){
  document.getElementById('popup').classList.toggle('invisible')
  document.getElementById('pp_cust_name').innerHTML = `${cust_snap.data().last_name} ${cust_snap.data().first_name}`
  document.getElementById('pp_package').innerHTML = booking.package
  document.getElementById('pp_room_no').innerHTML = room_snap.data().roomNo
  let check_in_date = booking.check_in.toDate()
  document.getElementById('pp_check_in').innerHTML = `${check_in_date.getMonth()+1} ${check_in_date.getDate()}, ${check_in_date.getFullYear()}`
  let check_out_date = booking.check_out.toDate()
  document.getElementById('pp_check_out').innerHTML = `${check_out_date.getMonth()+1} ${check_out_date.getDate()}, ${check_out_date.getFullYear()}`
  document.getElementById('pp_adtl_amen').innerHTML = booking.additional_amenities
}

document.getElementById('close_popup').addEventListener('click', (e) =>{
  document.getElementById('popup').classList.toggle('invisible')
})


function toggleLoader(){

}


function addFunctionToSearch(){
  const e_unchecked_search = document.getElementById('unchecked_search')
  const e_usearch_button = document.getElementById('unchecked_search_button')
  const e_uundo_button = document.getElementById('unchecked_undo_button')
  const e_unchecked_bookings_container = document.getElementById('unchecked_bookings_container')
  

  e_usearch_button.addEventListener('click', (e)=>{
    let unchecked_cust_name_list = e_unchecked_bookings_container.querySelectorAll('.customer_name')
    unchecked_cust_name_list.forEach((node) => {
      if(node.innerHTML.toLowerCase().includes(e_unchecked_search.value.toLowerCase())){
        
      }else{
        node.parentElement.classList.add('invisible')
      }
    })
  })
  e_uundo_button.addEventListener('click', (e)=>{
    let unchecked_cust_name_list = e_unchecked_bookings_container.querySelectorAll('.customer_name')
    unchecked_cust_name_list.forEach((node) => {
      node.parentElement.classList.remove('invisible')
    })
    e_unchecked_search.value=''
  })


  const e_checked_search = document.getElementById('checked_search')
  const e_csearch_button = document.getElementById('checked_search_button')
  const e_cundo_button = document.getElementById('checked_undo_button')
  const e_checked_bookings_container = document.getElementById('checked_bookings_container')
  let checked_cust_name_list = e_checked_bookings_container.querySelectorAll('.customer_name')

  e_csearch_button.addEventListener('click', (e)=>{
    let checked_cust_name_list = e_checked_bookings_container.querySelectorAll('.customer_name')
    checked_cust_name_list.forEach((node) => {
      if(node.innerHTML.toLowerCase().includes(e_checked_search.value.toLowerCase())){
        
      }else{
        node.parentElement.classList.add('invisible')
      }
    })
  })
  e_cundo_button.addEventListener('click', (e)=>{
    let checked_cust_name_list = e_checked_bookings_container.querySelectorAll('.customer_name')
    checked_cust_name_list.forEach((node) => {
      node.parentElement.classList.remove('invisible')
    })
    e_unchecked_search.value=''
  })
}
