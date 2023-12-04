//////////////////////////////////////////////////////////////////////////////
/////////////////////////PERSISTANCE SUR FIRESTORE////////////////////////////
//////////////////////////////////////////////////////////////////////////////

const dbRefObject = firebase.database().ref().child('Books')

let cloudLib = {};
let cloudLibData = [];
let libTemporaire = [];
//variable globale pour l'index du livre
let idBook;
let globVar;

dbRefObject.on('value', snap => {
    //console.log(snap.val())
    cloudLib = snap.val();
    cloudLibData = cloudLib["myLibrary"];
    let myLibrary = cloudLibData;
    libTemporaire = myLibrary;
    syncData();
    renderTable();
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


//////////////////////////////////////////////////////////////////////////////
/////////////////////////FONCTIONS PRINCIPALE DE L'APPLI//////////////////////
//////////////////////////////////////////////////////////////////////////////
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

const reverseGreLite = {
    'Biographie': 1, 
    'Fantastique': 2, 
    'Historique': 3,
    'Policier': 4,
    'Science-Fiction': 5,
    'Conte philosophique': 6,
    'Comédie': 7,
    'Littéraire': 8,
    'Scientifique': 9,
    'Autre': 10,
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

//on crée une variable globale qui recevra les index de la librairie
let tableOfIndex;

/**
 * Cette fonction crée la table des livres 
 * elle est appelé chaque fois que le la librairie est modifiée
 */
function renderTable(bookList=cloudLibData) {  
    //on efface la zone dans laquelle la table doit être placée
    table.innerHTML = ''
    tableOfIndex = [];
    for (let index = 0; index < bookList.length; index++) {    
        tableOfIndex.push(index);
        let newRow = table.insertRow(index);
        newRow.addEventListener("click", () => {
            changeSelectedLineColor(index);     
        });
        newRow.insertCell(0).innerText = index + 1;
        newRow.insertCell(1).innerText = bookList[index].title;
        newRow.insertCell(2).innerText = bookList[index].author;
        newRow.insertCell(3).innerText = bookList[index].pages;
        newRow.insertCell(4).innerHTML = `<span id='instock${index}'>${bookList[index].instock}</span>`;
        newRow.insertCell(5).innerHTML = `<button onclick='bookAvailable(${index})' class='tableButtons'>Check</button>`;      
        newRow.insertCell(6).innerHTML = `<button onclick='showDetails(${index})' class='tableButtons' 
        data-bs-toggle='modal' data-bs-target='#displaybookdetails'>details</button>`
    }
    //on appelle l'affichage du nombre de livre
    getLibraryLength();
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
        //let newStock = document.getElementById('flexCheckDefault').value;
        //set newStock default value at 'Yes' 
        let newStock = 'Yes';
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
 * Cette fonction est appellée pour afficher les détails de l'objet livre
 * dans une modal réservée à cette effet
 * @param {number} index : numéro du livre donc les détails doivent être affichés
 */
function showDetails(index) {
    idBook = ''
    document.getElementById('newTitle').innerText = libTemporaire[index].title;
    document.getElementById('newAuthor').innerText = libTemporaire[index].author;
    document.getElementById('newPages').innerText = libTemporaire[index].pages;
    document.getElementById('newGenre').innerText = genreLiteraire[libTemporaire[index].genre];
    document.getElementById('newEditor').innerText = libTemporaire[index].editor;
    document.getElementById('newPublicationYear').innerText = libTemporaire[index].pub_year;
    document.getElementById('newPrice').innerText = formaterPrix(index);
    document.getElementById('bookresume').innerText = libTemporaire[index].resume;
    document.getElementById('newRegistrationDate').innerText = libTemporaire[index].regdate;
    //let srcimage = myLibrary[index].cover;
    //console.log(getPath(srcimage));  
    document.getElementById('coverbook').innerHTML = `<img src="images/no-image.png"
    class='img-fluid' alt='Page de couverture' />`;
    //let cover_book = document.getElementById("coverbook");
    //let image = document.createElement("img");
    //image.src = `"${srcimage}"`;
    //cover_book.appendChild(image)    
    idBook = index
}

/**
 * Cette fonction permet rempli le formulaire de modification
 */
function editBookAttribut(index) {  
    document.getElementById('edittitle').value = libTemporaire[index].title;
    document.getElementById('editauthor').value = libTemporaire[index].author;
    document.getElementById('editpages').value = libTemporaire[index].pages;
    document.getElementById('editeditor').value = libTemporaire[index].editor;
    document.getElementById('editgenre').value = libTemporaire[index].genre;  
    document.getElementById('editresume').value = libTemporaire[index].resume;
    document.getElementById('editcurrency-field').value = libTemporaire[index].price;
    document.getElementById('editcover-image').value = libTemporaire[index].cover;
}

/**
 * cette fonction permet de sauvegarder les modifications des propriétés 
 * du livre selectionné
 */
function saveChanges(index) {
    myLibrary[index].author = document.getElementById('editauthor').value;
    myLibrary[index].pages = document.getElementById('editpages').value;
    myLibrary[index].editor = document.getElementById('editeditor').value;
    myLibrary[index].genre = document.getElementById('editgenre').value;
    editingresume = document.getElementById('editresume').value;
    if (editingresume) {
        myLibrary[index].resume = editingresume;
    };
    editingprice = document.getElementById('editcurrency-field').value;
    if (editingprice) {
        myLibrary[index].price = editingprice;
    };
    myLibrary[index].cover = document.getElementById('editcover-image').value;
    //ensuite on met à jour l'affichage de la table
    writeUserData()
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
function deleteRow() {
    let delbook = "";  
    let titleofbookdeleted = "";
    const newlibrary = [];      
    //on supprime et on récupère le livre supprimé
    if (idBook >= 1) {
        delbook = libTemporaire.splice(idBook, 1);
        titleofbookdeleted = delbook[0].title;
    } else if (idBook == 0) {
        delbook = libTemporaire.shift();
        titleofbookdeleted = delbook.title
    }  
  
    //on met à jour myLibrary    
    for (let index = 0; index < myLibrary.length; index++) {
        if(myLibrary[index].title != titleofbookdeleted) {
            newlibrary.push(myLibrary[index]);
        }
    }
    //console.log(newlibrary);
    myLibrary = [];
    myLibrary = newlibrary;  
    //ensuite on met à jour l'affichage de la table
    writeUserData();
}

//////////////////////////////////////////////////////////////////////////////
/////////////////////////GESTION VALIDITE DU FORMULAIRE///////////////////////
//////////////////////////////////////////////////////////////////////////////
/**
 * Cette fonction prend un nom en paramètre et valide qu'il est au bon format
 * ici : deux caractères au minimum
 * @param {string} nom 
 * @throws {Error}
 */
function validerSaisie(saisie) {
    let saisieRegExp = new RegExp("[a-zA-Zçàéèê0-9._-]{2,}")
    if (!saisieRegExp.test(saisie)) {
        throw new Error("Veuillez à bien remplir le formulaire.")
    }else{
        return saisie
    } 
}

/**
* Cette fonction prend un nombre en paramètre et valide qu'il est au bon format. 
* @param {number} pages 
* @throws {Error}
*/
function validerPages(pages) {
    let pagesRegExp = new RegExp("[0-9]+")
    if (!pagesRegExp.test(pages)) {
        throw new Error("Le nombre de pages n'est pas valide.")
    }else{
        return pages
    }   
}

//////////////////////////////////////////////////////////////////////////////
/////////////////////////GESTIONNAIRE D'EVENEMENTS////////////////////////////
//////////////////////////////////////////////////////////////////////////////
// Gestion de l'événement submit sur le formulaire d'ajout de livre. 
let form = document.querySelector(".modal-body form");
viderFormulaire();
form.addEventListener("submit", (event) => {
    event.preventDefault();
    //console.log("Add this book");
    addBookToLibrary();
    let closeForn = document.querySelector(".btn-close"); 
    closeForn.click();
    
})

// Gestion de l'événement cancel sur le formulaire d'ajout de livre. 
let cancelform = document.getElementById("btncancel");
cancelform.addEventListener("click", () => {
    //event.preventDefault();    
    viderFormulaire(); 
})

// Gestion de l'événement sur le bouton delete book 
let deletebook = document.getElementById('btnsupprimer')
deletebook.addEventListener("click", () => {
    
    console.log("delete this book")    
    console.log(idBook)
    
    if (window.confirm("Souhaitez-vous vraiment supprimer ce livre ?")) {
      deleteRow(idBook);
    }    
    let closeModal = document.getElementById("close-me") 
    closeModal.click()
    
})

// Gestion de l'événement sur le bouton Edit book 
let editbook = document.getElementById('btnmodifier')
editbook.addEventListener("click", () => {  
    
    editBookAttribut(idBook);    
    
})

// Gestion de l'événement sur le bouton save changes 
let modifier = document.getElementById('savechanges')
modifier.addEventListener("click", () => {
    //event.preventDefault()       
    //console.log(idBook)
    if (window.confirm("Souhaitez-vous vraiment modifier ce livre ?")) {
      saveChanges(idBook);
    }    
    let closepopup = document.getElementById("modaleditclose") 
    closepopup.click()
    // affichage de la table mise à jour 
    renderTable()   
      
})

// Ajout d'un listener à notre balise input titre du formulaire add book
const inputrequired = document.getElementById("title");

// On ajoute un listener de type input qui permet de recupérer une valeur dans 
// le champ input sans avoir besoin de clicker sur validé
inputrequired.addEventListener("input", function () {    
    let btnaddbook = document.querySelector(".modal-body form #btnsubmit");
    //on active le bouton add this book si une saisie est opérée sur la balise 
    //input du champs titre.
    btnaddbook.disabled = false
    //console.log(inputrequired.value)    
})


//on crée et rempli la combobox du tri 
let triselect = document.getElementById('triage');
triselect.innerHTML = '';
const ordredetri = ['---', 'a_z', 'z_a','pages_up', 'pages_down', 'date_up', 'date_down'];
let tricombo = document.createElement('select');
triselect.appendChild(fillComboOptions(ordredetri, tricombo));

//on crée et rempli la combobox des filtres
let filtreselect = document.getElementById('filtrage');
filtreselect.innerHTML = '';
const listefiltre = ['---', 'author', 'genre', 'editor', 'available'];
let filtrecombo = document.createElement('select');
filtreselect.appendChild(fillComboOptions(listefiltre, filtrecombo));


//on crée un variable globale pour l'étiquette du filtre
let etiqkfiltr;
//on ajoute un listener sur l'élément donc d'id est "filtrage"
let selectlefiltre = document.querySelector('#filtrage select');
selectlefiltre.addEventListener("change", () => {
 
    //console.log(selectlefiltre.value);
    let monfiltre = document.getElementById('quelfiltre');
    monfiltre.innerText = '';
    if(selectlefiltre.value != "---") {
        monfiltre.innerText = `Select ${selectlefiltre.value} :`;
        globVar =  selectlefiltre.value.toLowerCase();
    etiqkfiltr = globVar;
    let f = document.getElementById('nomdufiltre');
    f.innerHTML = '';
    //const colors = ['red', 'green', 'blue', 'yellow'];
    let val = getBookAttribute(selectlefiltre.value);
    val.push('---');
    //console.log(val);
    
    let combo = document.createElement('select');
    f.appendChild(fillComboOptions(val, combo, selectlefiltre.value));
    combo.addEventListener("change", () => {
        //on fait appel à la fonction de filtrage    
        filterMyLibrary(etiqkfiltr, combo.value);
        // on rafraichi l'affichage de l'écran
        renderTable(libTemporaire);        
    })
    //returnlistofauthor();
    }else{ 
        libTemporaire = myLibrary;
        renderTable(libTemporaire);
    };  
})  

//Gestion de l'événement sur la combobox de triage
const letriage = document.querySelector('#triage select');
// Ajout du listener pour trier les livres
letriage.addEventListener("change", () => {
    //console.log("point test : entrée");
    const livresOrdonnees = Array.from(libTemporaire);
    
    let nomtri = letriage.value.toLowerCase();
    if(nomtri == 'a_z') {
        livresOrdonnees.sort((a, b) => a.title.localeCompare(b.title));
    }else if(nomtri == 'z_a') {
        livresOrdonnees.sort((a, b) => b.title.localeCompare(a.title));
    }else if(nomtri == 'date_down') {
        livresOrdonnees.sort((a, b) => a.pub_year - b.pub_year);
    }else if(nomtri == 'date_up') {
        livresOrdonnees.sort((a, b) => b.pub_year - a.pub_year);
    }else if (nomtri == 'pages_down') {
        livresOrdonnees.sort((a, b) => a.pages - b.pages);
    }else if(nomtri == 'pages_up') {
        livresOrdonnees.sort((a, b) => b.pages - a.pages)
    }         
    updateLibTemp(livresOrdonnees);
    renderTable(libTemporaire);   
});

//////////////////////////////////////////////////////////////////////////////
/////////////////////////FONCTIONS UTILITAIRES DE L'APPLI/////////////////////
//////////////////////////////////////////////////////////////////////////////

/**
 * Cette fonction fait en sorte que même en dessous de 10 on garde 
 * deux chiffres, en insérant un zéro à la gauche du chiffre restant
 * @param {number} nb : un nombre quelconque  
 */
function tjrs2Chiffres(nb) {
    return (nb < 10) ? "0" + nb : nb
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
 * Cette fonction s'assure à ce qu'on n'enregistre pas des livres
 * ayant des titres idendiques
 */
function comparerTitre(newTitre) {
  for (let i = 0; i < myLibrary.length; i++) {
      if(newTitre === myLibrary[i].title){
          throw new Error("La bibliothèque possède déjà un livre de titre identique.")
      }
  }
}

/**
 * Cette fonction formate le prix du livre en lui ajoutant
 * une device ou en affichant N/A si le prix n'est pas fourni
 * @param {number} indice : index du livre dans la librairie 
 */
function formaterPrix(indice) {
    let prix = myLibrary[indice].price
    return (!prix) ? prix : `${prix} FCFA`  
}


/**
 * Cette fonction affiche la taille de la librairie
 */
function getLibraryLength() {    
    let nbrlivre = libTemporaire.length;
    let totalLivre = cloudLibData.length;
    document.getElementById('nbrdelivre').innerText = `displayed_books = ${nbrlivre}/${totalLivre}`
}

/**
 * Cette fonction se charge de renvoyer la liste d'un attribut
 * en partitulier. Par exemple la liste de tous les titre des
 * livres présents dans la librairie.
 * @param {string} myattr : le nom de l'attribut souhaité
 * @returns 
 */
function getBookAttribute (myattr) {
        let valattr = myattr.toLowerCase();    
        const objAttrBook = {
        author : myLibrary.map(book => book.author),
        genre : myLibrary.map(book => book.genre),
        editor : myLibrary.map(book => book.editor),
        available : myLibrary.map(book => book.instock)   
        };     
        const newTab = [];
        for(let i=0; i<objAttrBook[valattr].length; i++) {
            //on s'assure de me pas mettre dans la nouvelle
            //liste plus d'une fois le même élément    
        if(!newTab.includes(objAttrBook[valattr][i])){
            newTab.push(objAttrBook[valattr][i]);
        };
        }
        //console.log(objAttrBook[valattr]);
        return newTab;
  }

/**
 * Cette fonction permet de changer la couleur du text de 
 * la ligne selectionnée jusqu'à ce qu'une autre  ligne le soit.
 * @param {number} index : id de la ligne selectionnée
 */
function changeSelectedLineColor(index) {  
    let allrows = document.getElementById('libraryTable');
    let rows = allrows.getElementsByTagName('tr');
    //console.log(tableOfIndex);
    for (let i = 0; i < tableOfIndex.length; i++) {
        if(index != tableOfIndex[i]) {
            rows[i].style.color = "black";
        }else{
            rows[i].style.color = "yellow";
        }
    }  
}

/**
 * Cette fonction rempli nos combo box
 */
function fillComboOptions(tab, comboElt, testElt='') {
    while(tab.length)
    {
        let valeur = tab.pop();
        let opt;
        //console.log("contenu: "+testElt);
        if(testElt == "genre") {     
            if(valeur == '---') {
                opt = new Option('---', '---', true, true);
            }else{
                opt = new Option(genreLiteraire[valeur], genreLiteraire[valeur], false, false);
            }       
        }else{
            if(valeur == '---') {
            opt = new Option(valeur, valeur, true, true);
            }else{
                opt = new Option(valeur, valeur, false, false);
            }
        }            
        comboElt.options[comboElt.options.length] = opt;
    }
    return comboElt;
} 

/**
 * Cette fonction va se chargée des opérations de filtrage des livres
 * en fonction des arguments qui lui seront passés en paramètre
 * @param {*} filtr 
 * @param {*} nomfiltr 
 */
function filterMyLibrary(filtr, nomfiltr) {
    if(filtr != "---") {  
        libTemporaire = [];
        if(filtr == "available") { filtr = "instock" };
        if(filtr == "genre") { nomfiltr = reverseGreLite[nomfiltr] };
        for(let i=0; i<myLibrary.length; i++) {
            if(myLibrary[i][filtr] == nomfiltr){
            //console.log("point test : rouge");
            libTemporaire.push(myLibrary[i]);
            }
        }
    }
}

/**
 * Cette fonction met à jour la librairie temporaire après le trie
 * pour affichage
 * @param {*} newtab : tableau resultat du tri effectué
 */
function updateLibTemp(newtab) {
    //on vide la libTemporaire
    libTemporaire = [];
    for (let i = 0; i < newtab.length; i++) {
        libTemporaire.push(newtab[i]);
    }  
}

///////////////////////////////////////////////////////////
// Example starter JavaScript for disabling form submissions 
//if there are invalid fields
/*
(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()
*/