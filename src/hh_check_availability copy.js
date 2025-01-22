const currentDate = document.querySelector(".currDate");
const daysArea = document.querySelector(".days");
const navIcons = document.querySelectorAll(".icons span");

let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();

const dayToday = date.getDate(),
monthToday = date.getMonth(),
yearToday = date.getFullYear();

const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];


//Prints out the calendar
const renderCalendar = () => {
    let firstDateofMonth = new Date(currYear, currMonth, 1).getDay(),
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
    lastDateofPrevMonth = new Date(currYear, currMonth, 0).getDate(),
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay();

    let dayList = '';

    //prints out days of previous month as inactive
    for (let i = firstDateofMonth; i >= 1; i--){
        if(currYear < yearToday 
            || ( currYear === yearToday && currMonth <= monthToday )
            ){
            dayList += `<li class="unavailable">${lastDateofPrevMonth -i + 1}</li>`;
        }else{
            dayList += `<li class="inactive">${lastDateofPrevMonth -i + 1}</li>`;
        }
    }

    //prints out days of current month
    //to add: function when pressed
    for (let i = 1; i <= lastDateofMonth; i++){
        if(currYear < yearToday 
            || ( currYear === yearToday && currMonth < monthToday )
            || ( currYear === yearToday && currMonth === monthToday && i < dayToday ) 
            ){
            dayList += `<li class="unavailable">${i}</li>`;
        }else{
            dayList += `<li class="available">${i}</li>`;      //prints available/active days. Function can be added inside the onclick
        }
    }

    //prints out days of next month
    for (let i = lastDayofMonth; i < 6; i++){
        dayList += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }

    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysArea.innerHTML = dayList;

    setFunctionToDates()
}
renderCalendar();

//Sets click function to the dates
function setFunctionToDates(){
    const date_nodes = document.querySelectorAll('li.available')

    date_nodes.forEach(date_node => {
        date_node.addEventListener('click', (e) => {
            setCheckInOut(date_node.innerHTML)
        })
    })
}

//Adds functions to the prev and next buttons
navIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        if(icon.id === "prev"){
            if(currMonth == 0){
                currMonth = currMonth + 11;
                currYear = currYear - 1;
            }else currMonth = currMonth - 1;
        }else{
            if(currMonth == 11){ 
                currMonth = currMonth - 11;
                currYear = currYear + 1;
            }else currMonth = currMonth + 1;
        }
        renderCalendar();
    });
});

//=====================================================
//Code for setting Check-In/Out dates
const checkIn = document.querySelector(".check-in_date");
const checkOut = document.querySelector(".check-out_date");
const checkInNode = document.querySelector(".check-in_node");
const checkOutNode = document.querySelector(".check-out_node");
var checkInOutSelector=0;
var check_in_date;  //pass this value to next page (instance of Date())
var check_out_date; //pass this value to next page (instance of Date())
function setCheckInOut(day_value){
    console.log(day_value)
    if(checkInOutSelector==0){
        let check_in_date_temp = new Date(currYear, currMonth, day_value);
        if(check_in_date_temp >= check_out_date){
            //do nothing
        }else{
            checkIn.innerHTML = `${months[currMonth]} ${day_value} ${currYear}`;
            check_in_date = check_in_date_temp;
        }
    }else{
        let check_out_date_temp = new Date(currYear, currMonth, day_value);
        if(check_out_date_temp <= check_in_date){
            //do nothing
        }else{
            checkOut.innerHTML = `${months[currMonth]} ${day_value} ${currYear}`;
            check_out_date = check_out_date_temp;
        }
    }
    
    gatherAvailablePackages(adultno_select.value);
    setEstimatedPrice();
}


//===================== Function to set the check in/out @ top bar active===========================
function checkInActive(){
    checkInOutSelector=0;
    checkOutNode.classList.remove("bg_dark1");
    checkOutNode.firstElementChild.classList.remove("fontcolor_contrast");
    checkOutNode.lastElementChild.classList.remove("fontcolor_contrast");
    checkInNode.classList.add("bg_dark1");
    checkInNode.firstElementChild.classList.add("fontcolor_contrast");
    checkInNode.lastElementChild.classList.add("fontcolor_contrast");
}
function checkOutActive(){
    checkInOutSelector=1;
    checkOutNode.classList.add("bg_dark1");
    checkOutNode.firstElementChild.classList.add("fontcolor_contrast");
    checkOutNode.lastElementChild.classList.add("fontcolor_contrast");
    checkInNode.classList.remove("bg_dark1");
    checkInNode.firstElementChild.classList.remove("fontcolor_contrast");
    checkInNode.lastElementChild.classList.remove("fontcolor_contrast");
}
checkInNode.addEventListener('click', (e) => {
    checkInActive()
})
checkOutNode.addEventListener('click', (e) => {
    checkOutActive()
})
//DEFAULT: set checkInActive by default
checkInActive();

//========================================== Function to add Listener to packages at the right bar =================================
//Called at the end of gatherAvailablePackages
function setFunctionToPackages(){
    const package_nodes = document.querySelectorAll('.package_node')

    package_nodes.forEach(package_node => {
        package_node.addEventListener('click', (e) => {
            curr_selected_package_index = Number(package_node.querySelector('.index').innerHTML);
            setPackage(curr_selected_package_index, package_node.id)
            active_ID = package_node.querySelector('.ID').innerHTML
        })
    })
}

//===================== Function that sets package to the top bar ====================================
var current_active_roompackage;
function setPackage(index, package_id){
    if(current_active_roompackage !== undefined){
        current_active_roompackage.classList.remove('bg_dark1', 'fontcolor_contrast');
    }
    current_active_roompackage = document.getElementById(`${package_id}`);
    current_active_roompackage.classList.add('bg_dark1', 'fontcolor_contrast');
    let currpackage = document.getElementById("current_package");
    currpackage.innerHTML = `<p>Package</p><p class='package_title'>` + accepted_packages_docs[index].package_title + `</p>`;

    setEstimatedPrice();
}

//====================== Function that sets estimated to the top bar ======================================
// called by 
var estimatedPriceNode = document.getElementById("estimated_price");
function setEstimatedPrice(){
    if(!(check_in_date === undefined || check_out_date === undefined || current_active_roompackage === undefined)){
        let book_button = document.getElementById("book_button");
        if(book_button.classList.contains("invisible")){
            book_button.classList.remove("invisible");
        }
        let price = Number(accepted_packages_docs[curr_selected_package_index].room_rate); //put price per day here
        let diffTime = Math.abs(check_out_date-check_in_date);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        let tentative_price = price * diffDays;
        estimatedPriceNode.innerHTML = "<p>Estimated price<p><p>" + tentative_price + "<p>";
    }
}


//===================== FIREBASE STUFF =====================
import { initializeApp } from 'firebase/app'

import {
    getFirestore, collection, getDocs,
    query, where,
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


//============ Function gatherAvailablePackages 
const load_screen = document.querySelector('.loader_container')
// gathers available packages according to max no of adults and max no of children.
const package_node_container_ref = document.querySelector('.package_node_container')
var accepted_packages_docs = []
var curr_selected_package_index;
function gatherAvailablePackages(ci_max_adult){
    if(! (check_in_date === undefined || check_out_date === undefined )){
        
        //Set loading screen to flex
        load_screen.style.display = "flex"
        
        var date_to_book = convertDateInterval(check_in_date,check_out_date)
        const correct_max_adults = query(room_packages_Ref, where("max_adult", ">=", ci_max_adult), )
        getDocs(correct_max_adults)
            .then(async (snapshot) => {
                accepted_packages_docs = []
                snapshot.docs.forEach((doc) => {
                    if(doc.data().max_child >= childno_select.value){
                        accepted_packages_docs.push({...doc.data(), id: doc.id})
                    }
                })
                // docs with correct no of max adults and
                // max children are now gathered as objects
                // in the var 'accepted_packages_docs'
                
                
                //Check date here
                var available_packages = await checkRoomsBookedNights(date_to_book)


                //setting the content of the Package Node (right side)
                let package_node_contents = ''
                available_packages.forEach( (item, index) =>{
                    package_node_contents += 
                    `<div class="package_node" id="package_node_${index}">
                        <div class="index" style="display:none">${index}</div>
                        <div class="ID" style="display:none">${item.id}</div>
                        <img class="package_img" src="${item.img_link}">
                        <div class="package_captions">
                            <div>
                                <p class="package_title">${item.package_title}</p>
                            </div>
                            <span title="Room Size (sqft.)" class="material-symbols-rounded">square_foot</Span>
                            <span> ${item.room_size}</Span>
                            <div class="max_people_line_container">
                                <span>Max People:</span>
                                <span title="Max no. of Adults" class="material-symbols-rounded">person</span>
                                <span> ${item.max_adult}</span>
                                <span title="Max no. of Children" class="material-symbols-rounded">crib</span>
                                <span> ${item.max_child}</p>
                            </div>
                            <div>
                                <span title="Bed Style" class="material-symbols-rounded">Bed</span>
                                <span> ${item.bed_style}</span>
                                <span title="Buffet included" class="material-symbols-rounded">restaurant</span>
                                <span> ${item.buffet}</span>
                            </div>
                        </div>
                        <div class="room_rate_container">
                            <p>Rate</p>
                            <p id="room_rate_${index}">${item.room_rate}</p>
                        </div>
                    </div>`
                })
                package_node_container_ref.innerHTML=package_node_contents;

                //give functions to the shown packages
                setFunctionToPackages()
                //Set loading screen to none
                load_screen.style.display = "none"
            })

    }

}


//======================= Function that removes the fully booked packages
async function checkRoomsBookedNights(date_to_book){
    let remove_package_indexes = []
    let currIndex = 0
    let arr = []

    console.log(accepted_packages_docs)

    for( let room_package of accepted_packages_docs ){
        // console.log('enter ' + currIndex)
        let room_is_available = false
        let room_list = query(rooms_Ref, where("package", "==", room_package.id))
        let snapshot = await getDocs(room_list)
        // console.log('await done')
        for (let doc of snapshot.docs){
            if( doc.data().booked_nights === undefined || !hasMatchingDate(doc.data().booked_nights,date_to_book)){
                room_is_available = true
                arr.push(room_package)
                break
            }
        }
        if(!room_is_available){
            remove_package_indexes.push(currIndex)
        }
        currIndex++
    }
    return arr
}

  

const adultno_select = document.getElementById('adult_selection_input')
const childno_select = document.getElementById('children_selection_input')
adultno_select.addEventListener('change', (e) => {
    gatherAvailablePackages(adultno_select.value)
})
childno_select.addEventListener('change', (e) => {
    gatherAvailablePackages(adultno_select.value)
})


//======== function to convert date interval into obj
// {yr: {month: {"day,day,day"}, month: {"day,day,day"}}}

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

//add dates to object from startDate to endDate (doesn't include last day)
function addDateIntervalToObj(startDate, endDate, date_obj_holder) {
    let currentDate = new Date(startDate.getTime());

    while (currentDate < endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // add 1 to get 1-indexed months
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
//remove dates to object (doesn't include last day)
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


//Setting Function to Book Now Button
var active_ID
const book_button_setData = document.getElementById('book_button')
book_button_setData.addEventListener('click', (e) => {
    let data_bar = document.querySelector('.data_bar')
    var d1 = data_bar.querySelector('#adult_selection_input').value
    var d2 = data_bar.querySelector('#children_selection_input').value
    // check_in_date,  check_out_date
    var d4 = data_bar.querySelector('.package_title').innerHTML

    // console.log(d1, d2)
    // console.log(check_in_date, check_out_date)
    // console.log(d4)

    sessionStorage.setItem("no_adult", d1)
    sessionStorage.setItem("no_child", d2)

    window.sessionStorage.setItem("ch_in_yr", check_in_date.getFullYear())
    window.sessionStorage.setItem("ch_in_mo", check_in_date.getMonth())
    window.sessionStorage.setItem("ch_in_d", check_in_date.getDate())
    window.sessionStorage.setItem("ch_out_yr", check_out_date.getFullYear())
    window.sessionStorage.setItem("ch_out_mo", check_out_date.getMonth())
    window.sessionStorage.setItem("ch_out_d", check_out_date.getDate())
    sessionStorage.setItem("package_title", d4)
    sessionStorage.setItem("package_id", active_ID)

    console.log(active_ID)

    let redirectPage = () => {
        const url = "/dist/hh_booking_page.html";
        window.location.href = url;
    }
    
    redirectPage()
})


