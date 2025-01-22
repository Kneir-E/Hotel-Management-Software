//===================== FIREBASE STUFF =====================
import { initializeApp } from 'firebase/app'

import {
    getFirestore, collection, getDocs,
    query, where, getDoc, doc,
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

// room_booking_packages collection ref
const ch_accommodation_Ref = collection(db, 'ch_accommodation')


const e_room_btn = document.getElementById('room_package_selector')
const e_hall_btn = document.getElementById('hall_package_selector')
var current_mode = 0
e_room_btn.addEventListener('click', (e) => {
    e_room_btn.classList.add('bg_dark4', 'fontcolor_contrast')
    e_hall_btn.classList.remove('bg_dark4', 'fontcolor_contrast')
    if(current_mode == 1){
        setRoomInvisible()
        setHallInvisible()
        current_mode = 0
    }
})
// e_hall_btn.addEventListener('click', (e) => {
//     e_hall_btn.classList.add('bg_dark4', 'fontcolor_contrast')
//     e_room_btn.classList.remove('bg_dark4', 'fontcolor_contrast')
//     if(current_mode == 0){
//         setRoomInvisible()
//         setHallInvisible()
//         current_mode = 1
//     }
// })



//GET THE DATA WHEN PAGE IS OPENED
var room_data = []
var hall_data = []

async function getData(){
    var room_snap = await getDocs(room_packages_Ref)
    room_snap.docs.forEach((item) => {
        room_data.push({...item.data(), id: item.id})
    })
    var room_snap = await getDocs(ch_accommodation_Ref)
    room_snap.docs.forEach((item) => {
        hall_data.push({...item.data(), id: item.id} )
    })
}

//CONVERT DATA TO HTML
const e_main_content = document.getElementById('main_content')
async function convertToHTML(){
    await getData()
    let main_content_val = ''
    let index = 0
    room_data.forEach((item) => {
        main_content_val+= 
        `<div class="package_node bg_panel_element room_package">
            <div class="index" style="display:none">${index}</div>
            <div class="id_val" style="display:none">${item.id}</div>
            <div class="img_container">
                <img class="package_img" src="${item.img_link}">
                <div class="floater expand_room fontcolor_contrast">
                    <span class="material-symbols-rounded" style="font-size: 75px">expand_content</span>
                </div>
            </div>
            <div class="package_captions">
                <div>
                    <p class="package_title">${item.package_title}</p>
                </div>
                <div class="max_people_line_container">
                    <span>Max People:</span>
                    <br>
                    <span title="Max no. of Adults" class="material-symbols-rounded">person</span>
                    <span> ${item.max_adult}</span>
                    <br>
                    <span title="Max no. of Children" class="material-symbols-rounded">crib</span>
                    <span> ${item.max_child}</p>
                </div>
            </div>
            <div class="room_rate_container">
                <p>Rate</p>
                <p>${item.room_rate}</p>
                <div class="floater book_room fontcolor_contrast">
                    Book Now >>
                </div>
            </div>
        </div>`
        index++
    })

    index = 0
    hall_data.forEach((item) => {
        main_content_val+= 
        `<div class="package_node bg_panel_element hall_package">
            <div class="index" style="display:none">${index}</div>
            <div class="id_val" style="display:none">${item.id}</div>
            <div class="img_container">
                <img class="package_img" src="${item.img_link}">
                <div class="floater expand_hall fontcolor_contrast">
                    <span class="material-symbols-rounded" style="font-size: 75px">expand_content</span>
                </div>
            </div>
            <div class="package_captions">
                <div>
                    <p class="package_title">${item.title}</p>
                </div>
                <div class="max_people_line_container">
                    <span>Max People:</span>
                    <span> ${item.max_ppl}</span>
                </div>
            </div>
            <div class="room_rate_container">
                <p>Price</p>
                <p>${item.price}</p>
                <div class="floater book_hall fontcolor_contrast">
                    Book Now >>
                </div>
            </div>
        </div>`
        index++
    })
    e_main_content.innerHTML = main_content_val
}

//ADDS FUNCTION TO ALL EXPANDS
//CALL AFTER GATHERING DOCS
const e_popup_panel = document.getElementById('pop_up_panel')
e_popup_panel.classList.toggle("invisible_element")
function setFunctionToExpand(){
    var e_expand_room_floater = document.querySelectorAll('.floater.expand_room')
    e_expand_room_floater.forEach((elem) => {
        elem.addEventListener('click', async (e) => {
            let index = elem.parentElement.parentElement.querySelector('.index').innerHTML
            set_popup_room_data(index)
            e_popup_panel.classList.toggle("invisible_element")
            //console.log(id_value)
        })
    })

    var e_expand_hall_floater = document.querySelectorAll('.floater.expand_hall')
    e_expand_hall_floater.forEach((elem) => {
        elem.addEventListener('click', async (e) => {
            let index = elem.parentElement.parentElement.querySelector('.index').innerHTML
            set_popup_room_data(index)
            e_popup_panel.classList.toggle("invisible_element")
            //console.log(id_value)
        })
    })
}

//Set function to pop up
const e_popup_content = document.getElementById('pop_up_parent_content_container')
function set_popup_room_data(index){
    let popup_content = ''
    if(current_mode==0){
        let selected = room_data[index]
        popup_content =
        `<img id="pop_up_img" src="${selected.img_link}">
        <div id="pop_up_contents_container">
            <div id="pop_up_contents">
                <span>${selected.package_title}</span>
                <br>
                <span title="Room Size (sqft.)" class="material-symbols-rounded">square_foot</Span>
                <span>${selected.room_size}</span>
                <br>
                <span>Max People:</span>
                <br>
                <span title="Max no. of Adults" class="material-symbols-rounded">person</span>
                <span>${selected.max_adult}</span>
                <br>
                <span title="Max no. of Children" class="material-symbols-rounded">crib</span>
                <span>${selected.max_child}</span>
                <br>
                <span title="Bed Style" class="material-symbols-rounded">Bed</span>
                <span>${selected.bed_style}</span>
                <br>
                <span title="Buffet included" class="material-symbols-rounded">restaurant</span>
                <span>${selected.buffet}</span>
                <br>
                <span>Rate</span>
                <span>${selected.room_rate}</span>
            </div>
            <div class="description_container">
                <p>Description:</p>
                <p id="description">${selected.desc}</p>
            </div>
        </div>`
    }else{
        let selected = hall_data[index]
        popup_content =
        `<img id="pop_up_img" src="${selected.img_link}">
        <div id="pop_up_contents_container">
            <div id="pop_up_contents">
                <span>${selected.package_title}</span>
                <br>
                <span>Max no. of People:</span>
                <span>${selected.max_ppl}</span>
                <br>
                <span title="Room Size (sqft.)" class="material-symbols-rounded">square_foot</Span>
                <span>${selected.no_of_tables}</span>
                <br>
                <span title="Room Size (sqft.)" class="material-symbols-rounded">square_foot</Span>
                <span>${selected.no_of_seats}</span>
                <br>
                <span title="Buffet included" class="material-symbols-rounded">restaurant</span>
                <span>${selected.buffet}</span>
                <br>
                <span>amenities</span>
                <span>${selected.amenities}</span>
                <br>
                <span>Price</span>
                <span>${selected.price}</span>
            </div>
            <div class="description_container">
                <p>Description:</p>
                <p id="description">${selected.desc}</p>
            </div>
        </div>`
    }
    e_popup_content.innerHTML = popup_content
}


const close_pop_up = document.getElementById('close')
close_pop_up.addEventListener('click', (e) => {
    e_popup_panel.classList.toggle("invisible_element")
})

//BOOK NOW FUNCTION
function setFunctionToBookNow(){
    var e_book_room_floater = document.querySelectorAll('.floater.book_room')
    e_book_room_floater.forEach((elem) => {
        elem.addEventListener('click', (e) => {
            const url = "/dist/hh_check_availability.html";
            window.location.href = url;
            // console.log("booking room...")
        })
    })
    var e_book_hall_floater = document.querySelectorAll('.floater.book_hall')
    e_book_hall_floater.forEach((elem) => {
        elem.addEventListener('click', (e) => {
            console.log("booking hall...")
            // const url = "/dist/hh_landingPage.html";
            // window.location.href = url;
        })
    })
}

function setHallInvisible(){
    var e_hall_accom = document.querySelectorAll('.hall_package')
    e_hall_accom.forEach((hall) => {
        hall.classList.toggle('invisible_element')
    })
}
function setRoomInvisible(){
    var e_room_accom = document.querySelectorAll('.room_package')
    e_room_accom.forEach((room) => {
        room.classList.toggle('invisible_element')
    })
}

async function main(){
    await convertToHTML()
    setFunctionToBookNow()
    setFunctionToExpand()
    setHallInvisible()
}
main()