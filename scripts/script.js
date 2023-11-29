//persistance sur firestore
const dbRefObject = firebase.database().ref().child('Books')

let cloudLib = {};
let cloudLibData = [];
//variable globale pour l'index du livre
let idBook;

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

/**
 * Cette fonction permet la synchronisation entre la librairie stockée
 * dans le cloud et la livrairie qui est manipulé par l'utilisateur
 */
function syncData() {
    for (i = 0; i < cloudLibData.length; i++) {
      myLibrary[i] = cloudLibData[i]
    }
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

// on charge notre librairie à partir du cloud
let myLibrary = cloudLibData;

//correspondance valeur - genre litéraire
const genreLiteraire = {
    1:'Biographie', 
    2:'Fantastique', 
    3:'Historique',
    4:'Policier',
    5:'Science-Fiction',
    6:'Conte philosophique',
    7:'Comédie',
    8:'Littéraire',
    9:'Scientifique',
    10:'Autre',
}

/**
 * Cette fonction fait en sorte que même en dessous de 10 on garde 
 * deux chiffres, en insérant un zéro à la gauche du chiffre restant
 * @param {number} nb : un nombre quelconque  
 */
function tjrs2Chiffres(nb) {
    return (nb < 10) ? "0" + nb : nb
}

/**
 * Cette fonction renvoie la date du moment où elle est appelée   
 */
function recordDate() {
    let date = new Date();
    let day = tjrs2Chiffres(date.getDate());
    let month = tjrs2Chiffres(date.getMonth()+1);
    let year = date.getFullYear();
    let hour = tjrs2Chiffres(date.getHours());
    let minutes = tjrs2Chiffres(date.getMinutes()); 
    let sec = tjrs2Chiffres(date.getSeconds());
    return `${day}/${month}/${year} at ${hour}:${minutes}:${sec}`
}

/**
 * Cette fonction permet d'obtenir le bon chemin du fichier
 */
function getPath(cover) {
    let path = cover;
    let filename = path.replace(/^C:\\fakepath\\/, "");
    //console.log(filename);
    return filename
}

/**
 * Cette fonction crée la table des livres 
 * elle est appelé chaque fois que le la librairie est modifiée
 */
function renderTable() {
    //on efface la zone dans laquelle la table doit être placée
    table.innerHTML = ''
    for (let index = 0; index < cloudLibData.length; index++) {
        let newRow = table.insertRow(index);
        newRow.insertCell(0).innerText = cloudLibData[index].title;
        newRow.insertCell(1).innerText = cloudLibData[index].author;
        newRow.insertCell(2).innerText = cloudLibData[index].pages;
        newRow.insertCell(3).innerHTML = `<span id='instock${index}'>${cloudLibData[index].instock}</span>`;
        newRow.insertCell(4).innerHTML = `<button onclick='bookAvailable(${index})' class='tableButtons'>Check</button>`;    
        newRow.insertCell(5).innerHTML = `<button onclick='showDetails(${index})' class='tableButtons' 
        data-bs-toggle='modal' data-bs-target='#displaybookdetails'>details</button>`
    }
  
}

/**
 * Cette fonction extrait les données venant du formulaire d'ajout
 * de nouveau puis appelle le constructeur d'objet pour un nouveau livre
 * à la fin de l'opération, elle vide le formulaire
 */
function addBookToLibrary () { 
    try {
        let newTitle = validerSaisie(document.getElementById('title').value);
        //est ce que un livre ayant ce titre est déjà enregistré dans la librairie ?
        comparerTitre(newTitle);
        let newAuthor = validerSaisie(document.getElementById('author').value);
        let newGenre = document.getElementById('genre').value;
        let newEditor = validerSaisie(document.getElementById('editor').value);
        let newPages = validerPages(document.getElementById('pages').value);
        let newPub_year = document.getElementById('publication-year').value;
        let newResune = document.getElementById('resume').value;
        let newPrice = document.getElementById('currency-field').value;    
        let newCover = document.getElementById('cover-image').value;
        let newStock = document.getElementById('flexCheckDefault').value;
        let newRegdate = recordDate();    
        newCover = getPath(newCover);
        //console.log(newCover);
        new newBook(newTitle, newAuthor, newGenre, newEditor, newPages, newPub_year,
          newResune, newPrice, newCover, newStock, newRegdate);
        //on vide les champs du formulaire
        viderFormulaire();
    }catch(erreur) {
        viderFormulaire();
        window.alert(erreur.message);
        //console.log(erreur.message);         
    }  

}

/**
 * Cette fonction permet de réinitialiser le formulaire
 */
function viderFormulaire() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('pages').value = '';
    document.getElementById('editor').value = '';
    document.getElementById('genre').value = '';
    document.getElementById('publication-year').value = '';
    document.getElementById('resume').value = '';
    document.getElementById('currency-field').value = '';
    document.getElementById('cover-image').value = '';
}


/**
 * Cette fonction permet d'indiquer si un livre est disponible
 * (Yes) ou pas (No)
 * @param {number} index 
 */
function bookAvailable(index) {
    if (myLibrary[index].instock == 'No') {
        myLibrary[index].instock = 'Yes'
        document.getElementById(`instock${index}`).innerHTML = `<span id='instock${index}'>${myLibrary[index].instock}</span>`
    } else {
        myLibrary[index].instock = 'No'
        document.getElementById(`instock${index}`).innerHTML = `<span id='instock${index}'>${myLibrary[index].instock}</span>`
    }
    writeUserData()
}

/**
 * Cette fonction permet de supprimer l'objet donc l'index est transmit en 
 * argument
 * @param {number} index : index du livre à supprimer
 */
function deleteRow(index) {
    if (index > 1) {
        myLibrary.splice(index, index-1);
    } else if (index == 1) {
        myLibrary.splice(index, index);
    } else if (index == 0) {
        myLibrary.shift();
    }
    //ensuite on met à jour l'affichage de la table
    writeUserData()
}

