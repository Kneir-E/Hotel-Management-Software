//===================== FIREBASE STUFF =====================
import { initializeApp } from 'firebase/app'

import {
    getFirestore, collection, getDocs,
    query, where, getDoc, doc, updateDoc,
    update, setDoc, addDoc, deleteDoc
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

const booking_id = sessionStorage.getItem("doc_id")


//=======================
//      DATA FIELDS
//
//=======================

//Top Bar
const ref_no = document.getElementById('ref_no_val')
//const book_type = document.getElementById('booking_type_val')

//Booking Details
const package_elem = document.getElementById('package')
const room_size_elem = document.getElementById('room_size')
const max_adults_elem = document.getElementById('max_adults')
const max_child_elem = document.getElementById('max_children')
const bed_style_elem = document.getElementById('bed_style')
const buffet_elem = document.getElementById('buffet')

//Room Details
const room_no_elem = document.getElementById('room_no')

//Check-in
const check_in_elem = document.getElementById('check_in_date')
const check_out_elem = document.getElementById('check_out_date')

//add amenities
const amenities_elem = document.getElementById('amenities')

//Room Rate
const room_rate_elem = document.getElementById('room_rate')

//Customer Details
const fname_elem = document.getElementById('fname')
const lname_elem = document.getElementById('lname')
const phone_elem = document.getElementById('customer_number')
const name_on_card_elem = document.getElementById('name_on_card')
const email_elem = document.getElementById('customer_email_address')
const booking_date = document.getElementById('booking_date')


//Date() holders
var check_in_date
var check_out_date
const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];



var booking_snap
var customer_snap
var room_snap
var package_snap
async function initDash(){
    if(sessionStorage.getItem("doc_id") === null){
        alert("There was an error in fetching your booking. Redirecting back to search")
        sessionStorage.clear()
        const url = "/dist/hh_review_booking.html";
        window.location.href = url;
    }

    const booking_doc_ref = doc(booking_Ref, booking_id)
    booking_snap = await getDoc(booking_doc_ref)
    
    const customer_doc_ref = doc(customer_Ref, booking_snap.data().customer_id)
    customer_snap = await getDoc(customer_doc_ref)
    
    const room_doc_ref = doc(rooms_Ref, booking_snap.data().room)
    room_snap = await getDoc(room_doc_ref)

    const package_doc_ref = doc(room_packages_Ref, booking_snap.data().package)
    package_snap = await getDoc(package_doc_ref)

    ref_no.innerHTML = booking_id
    package_elem.innerHTML= package_snap.data().package_title
    room_size_elem.innerHTML= package_snap.data().room_size
    max_adults_elem.innerHTML= package_snap.data().max_adult
    max_child_elem.innerHTML= package_snap.data().max_child
    bed_style_elem.innerHTML= package_snap.data().bed_style
    buffet_elem.innerHTML= package_snap.data().buffet

    room_no_elem.innerHTML = room_snap.data().roomNo

    room_rate_elem.innerHTML = package_snap.data().room_rate
    //Check-in
    check_in_date = booking_snap.data().check_in.toDate()
    check_out_date = booking_snap.data().check_out.toDate()
    check_in_elem.innerHTML = `${months[check_in_date.getMonth()]} ${check_in_date.getDate()} ${check_in_date.getFullYear()}`
    check_out_elem.innerHTML = `${months[check_out_date.getMonth()]} ${check_out_date.getDate()} ${check_out_date.getFullYear()}`

    //add amenities
    amenities_elem.innerHTML = booking_snap.data().additional_amenities

    //Room Rate
    room_rate_elem.innerHTML = package_snap.data().room_rate

    //Customer Details
    fname_elem.innerHTML = customer_snap.data().first_name
    lname_elem.innerHTML = customer_snap.data().last_name
    phone_elem.innerHTML = customer_snap.data().phone_num
    name_on_card_elem.innerHTML = customer_snap.data().card_name_on_card
    email_elem.innerHTML = customer_snap.data().email
    booking_date.innerHTML = booking_snap.data().booked_on.toDate().toDateString()

    let stylesheet = document.styleSheets[1]
    stylesheet.insertRule(`.img_bg { background-image: linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${package_snap.data().img_link});}`, 0);
    //console.log(package_snap.data().img_link)
}
initDash()

document.getElementById('cancel_booking').addEventListener('click', (e) => {
    console.log('here')
    let response = confirm('Are you sure you want to cancel? Refunds are only available when Check in date is 1 week or more from now')
    if(response){
        //delete booked nights from room
        let old = room_snap.data().booked_nights
        let new_booked_nights = deleteDatesInRange(old, booking_snap.data().check_in.toDate(), booking_snap.data().check_out.toDate())

        updateDoc(doc(rooms_Ref, room_snap.id), {booked_nights: new_booked_nights} )

        //delete customer
        deleteDoc(doc(customer_Ref, customer_snap.id))

        //delete booking
        deleteDoc(doc(booking_Ref, booking_snap.id))


        sessionStorage.clear()
        console.log('Cancelled booking')
        window.location.href = "/dist/hh_landingPage.html";
    }else{
        console.log('Cancelled cancel booking')
    }

})


function deleteDatesInRange(date_obj_holder, start_date, end_date) {
    // convert start_date and end_date to Date objects
    const start = new Date(start_date);
    const end = new Date(end_date);

    // iterate over each year in the date_obj_holder
    for (const year in date_obj_holder) {
        // iterate over each month in this year
        for (const month in date_obj_holder[year]) {
        // split the string of days into an array
        const days = date_obj_holder[year][month].split(', ');

        // iterate over each day in this month
        for (let i = 0; i < days.length; i++) {
            // convert the day string to a Date object
            const day = new Date(`${year}-${month}-${days[i]}`);

            // if the day is within the range to be deleted, remove it from the array
            if (day >= start && day < end) {
            days.splice(i, 1);
            i--; // decrement i to account for the removed element
            }
        }

        // join the array of days back into a string
        date_obj_holder[year][month] = days.join(', ');
        }
    }

    // return the modified date_obj_holder object
    return date_obj_holder;
}