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

// rooms collection Ref
const rooms_Ref = collection(db, 'rooms')

// storage ref
const storageRef = getStorage()
const package_imgsRef = ref(storageRef, 'package_imgs')


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
var packages = []
onSnapshot(room_packages_Ref, (snap) => {
    toggleLoader()
    packages = []
    snap.forEach((doc) => {
        packages.push({...doc.data(), id: doc.id })
    })
    initializeMainContent()
    addButtonFunctions()
    toggleLoader()
})




function initializeMainContent(){
    const e_package_list_container = document.getElementById('package_list_container')
    let content = ''
    packages.forEach((room_package) => {
        content += 
        `<div class="package_container" id="${room_package.id}">
            <img class="package_content" src="${room_package.img_link}" alt="${room_package.package_title}">
            <p class="package_content">${room_package.package_title}</p>
            <p class="package_content">${room_package.id}</p>
            <p class="package_content">${room_package.max_adult}</p>
            <div class="package_content icon_container">
                <span title="Edit Rooms" class="material-symbols-rounded edit_room" style="font-size: 2rem;">meeting_room</span>
                <span title="Edit" class="material-symbols-rounded edit" style="font-size: 2rem;">edit</span>
                <span title="Delete" class="material-symbols-rounded delete" style="font-size: 2rem;">delete</span>
            </div>
        </div>`
    })
    e_package_list_container.innerHTML = content
}

function addButtonFunctions(){
    var e_edit_button_list = document.querySelectorAll('.edit')
    var e_delete_button_list = document.querySelectorAll('.delete')
    var e_edit_room_button_list = document.querySelectorAll('.edit_room')
    e_edit_button_list.forEach((button) => {
        button.addEventListener('click', (e) => {
            edit_package(button.parentElement.parentElement.id)
        })
    })
    e_delete_button_list.forEach((button) => {
        button.addEventListener('click', (e) => {
            delete_package(button.parentElement.parentElement.id)
        })
    })
    e_edit_room_button_list.forEach((button) => {
        button.addEventListener('click', (e) => {
            edit_room_main(button.parentElement.parentElement.id)
        })
    })
}


var target_id_of_package
const e_edit_add_package = document.querySelector('.add-edit_data_popup')
const e_pack_title = document.getElementById('e_pack_title')
const e_room_size = document.getElementById('e_room_size')
const e_bed_style = document.getElementById('e_bed_style')
const e_max_adult = document.getElementById('e_max_adult')
const e_max_child = document.getElementById('e_max_child')
const e_buffet = document.getElementById('e_buffet')
const e_room_rate = document.getElementById('e_room_rate')
const e_image = document.getElementById('e_image')
const e_desc = document.getElementById('e_desc')
var searchPackage
var pop_up_mode
function edit_package(target_id){

    //show undo buttons if previous mode is create
    if(pop_up_mode==1){
        let undo_button = document.querySelectorAll('.undo')
        undo_button.forEach((button) => { button.classList.toggle('invisible') })
    }

    pop_up_mode = 0
    target_id_of_package = target_id
    e_edit_add_package.classList.toggle('invisible')

    searchPackage = packages.find((room_package) => room_package.id == target_id);

    const e_pop_up_title = document.querySelector('.pop_up_title')
    e_pop_up_title.innerHTML = `Edit ${searchPackage.package_title}`

    e_pack_title.value=`${searchPackage.package_title}`
    e_room_size.value=`${searchPackage.room_size}`
    e_bed_style.value=`${searchPackage.bed_style}`
    e_max_adult.value=`${searchPackage.max_adult}`
    e_max_child.value=`${searchPackage.max_child}`
    e_buffet.value=`${searchPackage.buffet}`
    e_room_rate.value=`${searchPackage.room_rate}`
    e_image.value=``
    e_desc.value=`${searchPackage.desc}`
}
function create_package(){
    //hide undo buttons if previous mode is not create
    if(pop_up_mode!=1){
        let undo_button = document.querySelectorAll('.undo')
        undo_button.forEach((button) => { button.classList.toggle('invisible') })
    }

    pop_up_mode = 1
    e_edit_add_package.classList.toggle('invisible')
    

    const e_pop_up_title = document.querySelector('.pop_up_title')
    e_pop_up_title.innerHTML = `Create New Package`

    e_pack_title.value=``
    e_room_size.value=``
    e_bed_style.value=``
    e_max_adult.value=``
    e_max_child.value=``
    e_buffet.value=``
    e_room_rate.value=``
    e_image.value=``
    e_desc.value=``
}
async function delete_package(target_id){
    const delete_is_confirmed = confirm(
        'Are you sure you want to delete this package? This also deletes all rooms under this package'
        )
    
    if(delete_is_confirmed){
        toggleLoader()
        //Code to delete package
        const deletedocRef = doc(room_packages_Ref, target_id)
        await deleteDoc(deletedocRef)
        
        //Code to delete rooms
        let rooms_to_delete = []
        const rooms_to_delete_ref = query(rooms_Ref, where('package', '==', target_id))
        let snapshot = await getDocs(rooms_to_delete_ref)
        snapshot.forEach((doc) => {
            rooms_to_delete.push(doc.id)
            console.log(doc.id)
        })
        rooms_to_delete.forEach(async (room) => {
            const deleteRoomRef = doc(rooms_Ref, room)
            await deleteDoc(deleteRoomRef)
        })

        toggleLoader()
        alert('data is deleted')
    }
}

const e_close_popup_button = document.getElementById('close_add-edit_data_popup')
e_close_popup_button.addEventListener('click', (e) => {
    e_edit_add_package.classList.toggle('invisible')
})

const e_submit_button = document.getElementById('submit_button')
e_submit_button.addEventListener('click', async function(e){
    e.preventDefault();
    let upload_obj = {
        package_title: e_pack_title.value,
        room_size: e_room_size.value,
        bed_style: e_bed_style.value,
        max_adult: e_max_adult.value,
        max_child: e_max_child.value,
        buffet: e_buffet.value,
        room_rate: e_room_rate.value,
        desc: e_desc.value
    }

    toggleLoader()

    if(fileItem===undefined){
    }else{
        fileName = `${e_pack_title.value}.`+ fileItem.name.split('.').pop();
        fileUploadPath = ref(package_imgsRef, fileName)
        await uploadImage()
        upload_obj.img_link = file_access_link
    }
    if(pop_up_mode==0){
        const target_ref = doc(room_packages_Ref, target_id_of_package)
        await updateDoc(target_ref, upload_obj)
    }else if(pop_up_mode==1){
        await addDoc(room_packages_Ref, upload_obj)
    }
    e_edit_add_package.classList.toggle('invisible')
    toggleLoader()
})

const e_add_package_button = document.getElementById('add_package_button')
e_add_package_button.addEventListener('click', (e)=> { create_package() })


const e_pack_title_undo = document.getElementById('e_pack_title_undo')
const e_room_size_undo = document.getElementById('e_room_size_undo')
const e_bed_style_undo = document.getElementById('e_bed_style_undo')
const e_max_adult_undo = document.getElementById('e_max_adult_undo')
const e_max_child_undo = document.getElementById('e_max_child_undo')
const e_buffet_undo = document.getElementById('e_buffet_undo')
const e_room_rate_undo = document.getElementById('e_room_rate_undo')
const e_image_undo = document.getElementById('e_image_undo')
const e_desc_undo = document.getElementById('e_desc_undo')
e_pack_title_undo.addEventListener('click', (e) => {e_pack_title.value = searchPackage.package_title})
e_room_size_undo.addEventListener('click', (e) => {e_room_size.value = searchPackage.room_size})
e_bed_style_undo.addEventListener('click', (e) => {e_bed_style.value = searchPackage.bed_style})
e_max_adult_undo.addEventListener('click', (e) => {e_max_adult.value = searchPackage.max_adult})
e_max_child_undo.addEventListener('click', (e) => {e_max_child.value = searchPackage.max_child})
e_buffet_undo.addEventListener('click', (e) => {e_buffet.value = searchPackage.buffet})
e_room_rate_undo.addEventListener('click', (e) => {e_room_rate.value = searchPackage.room_rate})
e_image_undo.addEventListener('click', (e) => {})
e_desc_undo.addEventListener('click', (e) => {e_desc.value = searchPackage.desc})


//Image upload
var fileName
var fileItem
var fileUploadPath
var file_access_link

function getFile(e){
    file_access_link = undefined
    fileItem = e.target.files[0]
    // fileName = `${e_pack_title.value}.`+ fileItem.name.split('.').pop();
    // fileUploadPath = ref(package_imgsRef, fileName)
    // console.log(fileUploadPath)
}

e_image.addEventListener('change', (e) => {
    getFile(e)
})

async function uploadImage(){
    if(fileItem===undefined)return
    let url_var = await uploadBytes(fileUploadPath, fileItem)
    file_access_link = await getDownloadURL(url_var.ref)
    // console.log(file_access_link)
}


//codes for rooms
const e_add_edit_rooms_popup = document.querySelector('.add_edit_rooms_popup')
const e_room_pop_up_contents_container = document.querySelector('.room_pop_up_contents_container')
var current_room_count
var room_view_current_package
async function edit_room_main(target_id){
    let room_pop_up_contents = ''

    e_add_edit_rooms_popup.classList.toggle('invisible')
    room_view_current_package = packages.find((room_package) => room_package.id == target_id);
    
    document.getElementById('add_edit_room_title').innerHTML = 'Add/Edit Rooms for ' + room_view_current_package.package_title

    current_room_count = 0
    toggleLoader()
    let package_id_to_search = query(rooms_Ref, where('package','==', target_id))
    let snapshot = await getDocs(package_id_to_search) 
    
    snapshot.docs.forEach((doc) => {
        room_pop_up_contents +=
        `<div class="room_pop_up_content" id=${doc.id}>
            <div class="room_name">${doc.data().roomNo}</div>
            <input class="room_name_input invisible" type="text" value="${doc.data().roomNo}">
            <div class="room_pop_up_icon_group">
                <span title="Edit Name" class="material-symbols-rounded edit_room_name" style="font-size: 2rem;">edit</span>
                <span title="Remove Room" class="material-symbols-rounded remove_room" style="font-size: 2rem;">delete</span>
                <span title="Save" class="material-symbols-rounded save_room invisible" style="font-size: 2rem;">save</span>
            </div>
        </div>`
        current_room_count++
    })
    e_room_pop_up_contents_container.innerHTML = room_pop_up_contents

    edit_room_button_functions()
    toggleLoader()
}

document.getElementById('close_room_popup').addEventListener('click', (e) => {
    e_add_edit_rooms_popup.classList.toggle('invisible')
})

function edit_room_button_functions(){
    let e_edit_room_edit_button_list = document.querySelectorAll('.edit_room_name')
    let e_edit_room_remove_button_list = document.querySelectorAll('.remove_room')
    let e_edit_room_save_button_list = document.querySelectorAll('.save_room')

    e_edit_room_edit_button_list.forEach((button) => {
        button.addEventListener('click', (e) => {
            edit_room_activate(button.parentElement.parentElement.id)
        })
    })
    e_edit_room_remove_button_list.forEach((button) => {
        button.addEventListener('click', (e) => {
            remove_room_activate(button.parentElement.parentElement.id)
        })
    })
    e_edit_room_save_button_list.forEach((button) => {
        button.addEventListener('click', (e) => {
            save_room_activate(button.parentElement.parentElement.id)
        })
    })
}


//FOR NEXT THREE FUNCTIONS
//id_val is id of both the Parent Element and the document in firebase
function edit_room_activate(id_val){
    const e_room_content_container = document.getElementById(id_val)
    const e_edit_button = e_room_content_container.querySelector('.edit_room_name')
    const e_save_button = e_room_content_container.querySelector('.save_room')
    const e_room_name_input = e_room_content_container.querySelector('.room_name_input')
    const e_room_name_label = e_room_content_container.querySelector('.room_name')
    e_edit_button.classList.toggle('invisible')
    e_save_button.classList.toggle('invisible')
    e_room_name_input.classList.toggle('invisible')
    e_room_name_label.classList.toggle('invisible')
}
function remove_room_activate(id_val){
    let delete_is_confirmed = confirm('Are you sure you want to delete this room?')
    if(delete_is_confirmed){
        let delete_room_ref = doc(rooms_Ref, id_val)
        let delete_elem = document.getElementById(id_val)
        delete_elem.parentElement.removeChild(delete_elem)

        deleteDoc(delete_room_ref)
    }else{
        console.log('Cancelled Delete')
    }
}
async function save_room_activate(id_val){
    const e_room_content_container = document.getElementById(id_val)
    const e_edit_button = e_room_content_container.querySelector('.edit_room_name')
    const e_save_button = e_room_content_container.querySelector('.save_room')
    const e_room_name_input = e_room_content_container.querySelector('.room_name_input')
    const e_room_name_label = e_room_content_container.querySelector('.room_name')
    e_edit_button.classList.toggle('invisible')
    e_save_button.classList.toggle('invisible')
    e_room_name_input.classList.toggle('invisible')
    e_room_name_label.classList.toggle('invisible')

    e_room_name_label.innerHTML = e_room_name_input.value
        
    let update_document_ref = doc(rooms_Ref, id_val)
    await updateDoc(update_document_ref, {roomNo: e_room_name_input.value })

}

const e_add_room_button = document.getElementById('e_add_room_button')
e_add_room_button.addEventListener('click', (e) => {
    var e_new_content_node = document.createElement("div");
    e_new_content_node.className = "room_pop_up_content";
    e_new_content_node.id=""

    var e_room_name_content = document.createElement("div")
    e_room_name_content.classList.add("room_name", "invisible")
    var e_room_input_content = document.createElement("input")
    e_room_input_content.classList.add("room_name_input")
    e_room_input_content.type="text"
    e_room_input_content.value="room_no"
    var e_room_icon_group = document.createElement("div")
    e_room_icon_group.classList.add("room_pop_up_icon_group")
        var e_edit_icon = document.createElement("span")
        e_edit_icon.classList.add("material-symbols-rounded", "edit_room_name", "invisible")
        e_edit_icon.style="font-size: 2rem;"
        e_edit_icon.innerHTML="edit"

        var e_delete_icon = document.createElement("span")
        e_delete_icon.classList.add("material-symbols-rounded", "remove_room")
        e_delete_icon.style="font-size: 2rem;"
        e_delete_icon.innerHTML="delete"

        var e_save_icon = document.createElement("span")
        e_save_icon.classList.add("material-symbols-rounded", "save_room")
        e_save_icon.style="font-size: 2rem;"
        e_save_icon.innerHTML="save"

    e_room_icon_group.append(e_edit_icon,e_delete_icon,e_save_icon)
    e_new_content_node.append(e_room_name_content, e_room_input_content, e_room_icon_group)

    e_edit_icon.onclick = function(){
        edit_room_activate(e_new_content_node.id)
    }
    e_delete_icon.onclick = function() {
        if(e_new_content_node.id==""){
            e_room_pop_up_contents_container.removeChild(e_new_content_node);
        }else{
            remove_room_activate(e_new_content_node.id)
        }
    };
    e_save_icon.onclick = async function() {
        if(e_new_content_node.id==""){
            let snap = await addDoc(rooms_Ref, {roomNo: e_room_input_content.value, package: room_view_current_package.id })
            e_new_content_node.id=snap.id
            e_room_name_content.innerHTML = e_room_input_content.value
            e_edit_icon.classList.toggle('invisible')
            e_save_icon.classList.toggle('invisible')
            e_room_input_content.classList.toggle('invisible')
            e_room_name_content.classList.toggle('invisible')
        }else{
            save_room_activate(e_new_content_node.id)
        }
    };

    e_room_pop_up_contents_container.appendChild(e_new_content_node)
    
})