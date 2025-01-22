//===================== FIREBASE STUFF =====================
import { initializeApp } from 'firebase/app'

import {
    getFirestore, collection, getDoc,
    doc
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

// customer collection ref
const booking_Ref = collection(db, 'booking')

const form_element = document.querySelector('.form_id')
const id_input = document.getElementById('booking_no')

form_element.addEventListener('submit', (e) => {
    e.preventDefault();
    check_if_input_exists()
})



async function check_if_input_exists(){
    const customer_booking_ref = doc(booking_Ref, id_input.value)
    var book_obj = await getDoc(customer_booking_ref)
    

    if(book_obj.data() !== undefined) {
            // console.log(book_obj.id)
            // console.log('here')
            sessionStorage.setItem('doc_id', book_obj.id)
            const url = "/dist/hh_review_booking_dash.html";
            window.location.href = url;
    }else{
        alert("Booking doesn't exist. Double check your booking number.")
        // console.log('here2')
    }
    
}