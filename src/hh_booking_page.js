//===================== FIREBASE STUFF =====================
import { initializeApp } from 'firebase/app'

import {
    getFirestore, collection, getDocs,
    query, where, getDoc, doc, updateDoc,
    update, setDoc, addDoc
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

const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

var check_in_date
var check_out_date
var selected_package
var no_adult
var no_child
var no_ppl_total
var total


var pack_id
async function initBookValues(){
    if(sessionStorage.getItem("package_id") === null){
        alert("Please pick package first.")
        sessionStorage.clear()
        const url = "/dist/hh_check_availability.html";
        window.location.href = url;
        return
    }
    pack_id = sessionStorage.getItem("package_id")
    var selected_package_ref = doc(db, "room_booking_packages", pack_id)
    console.log(pack_id)

    var pack_title = sessionStorage.getItem("package_title")
    document.querySelector('.pack_val').innerHTML = pack_title
    no_adult = sessionStorage.getItem("no_adult")
    no_child = sessionStorage.getItem("no_child")
    document.querySelector('.adult_val').innerHTML = no_adult
    document.querySelector('.child_val').innerHTML = no_child
    check_in_date = new Date(
            Number(sessionStorage.getItem("ch_in_yr")),
            Number(sessionStorage.getItem("ch_in_mo")),
            Number(sessionStorage.getItem("ch_in_d"))
        )
    check_out_date = new Date(
            Number(sessionStorage.getItem("ch_out_yr")),
            Number(sessionStorage.getItem("ch_out_mo")),
            Number(sessionStorage.getItem("ch_out_d"))
        )
    document.querySelector('.ch_in_val').innerHTML = months[check_in_date.getMonth()] + ' ' + check_in_date.getDate() + ', ' + check_in_date.getFullYear()
    document.querySelector('.ch_out_val').innerHTML = months[check_out_date.getMonth()] + ' ' + check_out_date.getDate() + ', ' + check_out_date.getFullYear()

    selected_package = await getDoc(selected_package_ref)

    console.log(selected_package.data())
    total = ( Number(selected_package.data().room_rate) * calcDays(check_in_date, check_out_date))
    console.log(calcDays(check_in_date, check_out_date))
    document.querySelector('.price_val').innerHTML = total
    total_booking_price.innerHTML = total
    no_ppl_total = Number(no_adult) + Number(no_child)
}
initBookValues()

function calcDays(start, end){
    let diffTime = Math.abs(end-start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays
}


var add_ons_holder = []
const add_ons_field = document.querySelector('.service_container')
async function initAddOns(){
    let snapshot = await getDocs(room_add_ons_Ref)
    let inside =''
    snapshot.docs.forEach((doc) => {
        inside +=
        `<div class="service">
            <div style="display: flex; align-items: center;">
                <img src="${doc.data().img_link}">
                <span class="service_name">${doc.data().value}</span>
            </div>
            <div style='text-align:right'>
                <span>P </span>
                <span>${doc.data().price}</span>
                <span> - </span>
                <input type="number" class="input_number" value="0" min="0" max="${no_ppl_total}">
                <br>
                <span>${doc.data().qttyType}</span>
            </div>
        </div>`
        add_ons_holder.push({...doc.data(), id: doc.id})
    })
    add_ons_field.innerHTML = inside
    set_function_add_ons_input()
}
initAddOns()


// FORM INFO
const user_f_Name = document.getElementById('firstName')
const user_l_Name = document.getElementById('lastName')
const user_phone = document.getElementById('phone_num')
const user_email = document.getElementById('email')
const user_card = document.getElementById('cardNum')
const user_CVV = document.getElementById('cvv')
const user_nameoncard = document.getElementById('nameonCard')

const confirm_button = document.getElementById('confirm_booking')
confirm_button.addEventListener('click', async (e) => {
    e.preventDefault()
    // console.log(
    //     user_f_Name.value,
    //     user_l_Name.value,
    //     user_phone.value,
    //     user_email.value,
    //     user_card.value,
    //     user_CVV.value,
    //     user_nameoncard.value
    // )

    // 1. check if still available
    if( await check_if_still_available() ){
        //if true - a. deposit dates into booked_nights

        const chosen_room_ref = doc(db, 'rooms', room_selected_id)
        let snap = await getDoc(chosen_room_ref)
        let curr_booked_nights = snap.data().booked_nights
        let room_id = snap.id
        let new_booked_nights
        if(curr_booked_nights === undefined){
            new_booked_nights = convertDateInterval(check_in_date, check_out_date)
        }else{
            new_booked_nights = addDateIntervalToObj(check_in_date, check_out_date, curr_booked_nights)
        }
        console.log(new_booked_nights)
        setDoc(chosen_room_ref, { booked_nights: new_booked_nights }, { merge: true })



        // b. create customer doc
        let new_customer_ref = await addDoc(customer_Ref, {
            first_name: user_f_Name.value,
            last_name: user_l_Name.value,
            phone_num: user_phone.value,
            email: user_email.value,
            card_number: user_card.value,
            card_cvv: user_CVV.value,
            card_name_on_card: user_nameoncard.value
        })

        // c. create booking doc
        let today = new Date()
        if(add_ons === undefined){ add_ons = "none"}
        let customer_booking_ref = await addDoc(booking_Ref, {
            room: room_id,
            package: pack_id,
            customer_id: new_customer_ref.id,
            booked_nights: new_booked_nights,
            check_in: check_in_date,
            check_out: check_out_date,
            additional_amenities: add_ons,
            checked_in: 0,
            checked_out: 0,
            booked_on: today,
            no_adult: no_adult,
            no_child: no_child
        })
        sessionStorage.clear()
        alert(`Success! Your booking reference is ${customer_booking_ref.id}`)
        const url = "/dist/hh_review_booking.html";
        window.location.href = url;
    }else{
        sessionStorage.clear()
        alert('The package got fully booked at your selected date interval while you were inputting data')
        const url = "/dist/hh_check_availability.html";
        window.location.href = url;
    }

    //      if false - cancel booking and return

})


// check if booking is still available at input
var room_selected_id
async function check_if_still_available(){
    let date_to_book = convertDateInterval(check_in_date, check_out_date)

    let still_available = false
    let rooms_tempq = query(rooms_Ref, where('package', '==', pack_id))
    let rooms_snap = await getDocs(rooms_tempq)
    for (let doc of rooms_snap.docs){
        if( doc.data().booked_nights === undefined || !hasMatchingDate(doc.data().booked_nights,date_to_book)){
            still_available = true
            room_selected_id = doc.id
            console.log(doc.id)
            break
        }
    }

    return still_available
    // console.log(room_selected_id, date_to_book, )
}

function convertDateInterval(startDate, endDate) {
    const date_obj_holder = {};

    let currentDate = new Date(startDate.getTime());

    while (currentDate < endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // add 1 to get 1-indexed months
        const day = currentDate.getDate();

        // add year to date_obj_holder if not already present
        if (!date_obj_holder[year]) {
            date_obj_holder[year] = {};
        }

        // add day to month if not already present
        if (!date_obj_holder[year][month]) {
            date_obj_holder[year][month] = `${day}`;
        } else {
            date_obj_holder[year][month] += `, ${day}`;
        }

        // move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return date_obj_holder;
}

//Checks if first obj contains any 1 date in the second function
function hasMatchingDate(date_obj_holder1, date_obj_holder2) {
    // iterate over each year in date_obj_holder1
    for (const year in date_obj_holder1) {
        // check if date_obj_holder2 has this year
        if (date_obj_holder2.hasOwnProperty(year)) {
        // iterate over each month in this year
        for (const month in date_obj_holder1[year]) {
            // check if date_obj_holder2 has this month
            if (date_obj_holder2[year].hasOwnProperty(month)) {
            // iterate over each day in this month
            for (const day of date_obj_holder1[year][month].split(', ')) {
                // check if date_obj_holder2 has this day
                if (date_obj_holder2[year][month].includes(day)) {
                // return true if a matching date is found
                return true;
                }
            }
            }
        }
        }
    }

    // if no matching date is found, return false
    return false;
}

// //add dates to object from startDate to endDate (doesn't include last day)
function addDateIntervalToObj(startDate, endDate, date_obj_holder) {
    let currentDate = new Date(startDate.getTime());

    while (currentDate < endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // add 1 to get 1-indexed months
    const day = currentDate.getDate();

    // add year to date_obj_holder if not already present
    if (!date_obj_holder[year]) {
        date_obj_holder[year] = {};
    }

    // add day to month if not already present
    if (!date_obj_holder[year][month]) {
        date_obj_holder[year][month] = `${day}`;
    } else {
        date_obj_holder[year][month] += `, ${day}`;
    }

    // move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    }

    return date_obj_holder;
}

function set_function_add_ons_input(){
    const add_ons_input = document.querySelectorAll('.input_number')
    add_ons_input.forEach((field)=> {
        field.addEventListener('change', (e) => {
            update_add_ons_bar()
        })
    })
}

const add_ons_bar_value = document.getElementById('current_add_ons_value')
const total_add_ons_price = document.getElementById('total_add_on_price')
const total_booking_price = document.getElementById('total_booking_price')
var add_ons //string
function update_add_ons_bar(){
    console.log('a')
    const add_ons_input = document.querySelectorAll('.input_number')
    add_ons = ''
    let curr_index = 0;
    let price = 0;
    add_ons_input.forEach((field)=> {
        if(field.value!=0){
            add_ons += `${field.value}x ${add_ons_holder[curr_index].value}, `
            price += Number(field.value) * Number(add_ons_holder[curr_index].price)
            // console.log( Number(field.value), Number(add_ons_holder[curr_index].price))
        }
        curr_index++
    })

    total_add_ons_price.innerHTML = price
    total_booking_price.innerHTML = price + total
    add_ons_bar_value.innerHTML = add_ons
}