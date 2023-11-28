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

/**
 * Cette fonction enregistre myLibrary dans la firebase
 * et appele l'affichage de la table des livres
 */
function writeUserData() {
    firebase.database().ref('Books').set({
      myLibrary
    });
  
    renderTable()
  }

//on récupére l'emplacement html ou sera affiché le tableau de livres
const table = document.getElementById('libraryTable');

/**
 * cette fonction est un constructeur d'objet de type livre
 */
function newBook(title, author, genre, editor, pages, 
  pub_year, resume, price, cover, instock='Yes', today) {

  this.title = title;
  this.author = author;
  this.genre = genre;
  this.pages = pages;
  this.editor = editor;    
  this.pub_year = pub_year;
  this.resume = resume;
  this.price = price;
  this.cover = cover;
  this.instock = instock;
  this.regdate = today;

//on evoie le nouveau livre dans la librairie
myLibrary.push(this);
writeUserData();

}
