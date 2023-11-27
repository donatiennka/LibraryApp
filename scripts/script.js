//persistance sur firestore
const dbRefObject = firebase.database().ref().child('Books')

let cloudLib = {};
let cloudLibData = [];
//variable globale pour l'index du livre
let idBook ='';

dbRefObject.on('value', snap => {
  //console.log(snap.val())
  cloudLib = snap.val();
  cloudLibData = cloudLib["myLibrary"];
  let myLibrary = cloudLibData;
  syncData()
  renderTable()
})
