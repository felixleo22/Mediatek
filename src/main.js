"use strict";
import { Film } from "./models/film.js";
import { Album } from "./models/album.js";
import { Jeu } from "./models/jeu.js";
import { Collection } from "./models/collection.js";

const cards = document.getElementById('cards');
const radioJeu = document.getElementById("radioJeu");
const radioFilm = document.getElementById("radioFilm");
const radioAlbum = document.getElementById("radioAlbum");
const radioFilmOMDBAPI = document.getElementById("filmOMDBAPI");
const buttonAddValide = document.getElementById("addValide");
const formAddMedia = document.getElementById('formAddMedia');
const formModifMedia = document.getElementById('formModifMedia');
const buttonTrier = document.getElementById('trier');
let valTrie = 'none';
let type = "jeu";

//init modal
$('.modal').modal();


let collection = initCollection();
showCollection();

function initCollection() { 
    //initialisation d'une liste au départ dans le localStorage
    if (!localStorage.getItem("collection")){
        const collection = new Collection();
        const album = new Album("Choeurs de l'Armée Rouge - L'intégrale","http://www.chartsinfrance.net/covers/aHR0cHM6Ly9pLnNjZG4uY28vaW1hZ2UvZmMxZDY4ODkzMzYyYmVhYmEyNzQ3NGI4NTI3OGRlZDdmNmQ2YTVlZQ==.jpg","1928","Académique Alexandrov","40");
        const film = new Film("Rambo 2","https://media3.giphy.com/media/TBOvwBGkQShnq/giphy.gif?cid=790b761194ecc1d8e031f12b783c20d44f2f6f81c1476c05&rid=giphy.gif","1985", "George Pan Cosmatos","92","Après avoir vaincu le shérif Will Teasle, John Rambo fut incarcerrer. Son colonel lui propose de faire une mission pour purger sa peine. Rambo part alors au Vietnam effectuer une mission de reconnaissance pour retrouver des soldats Américains prisonniers. Malheureusment il fut trahi et abandonné à son sort, Rambo est ramené au camp vietnamien et torturé. Il fera tout pour s'échapper, venir en aide à d'autres prisonniers, se venger de Murdock, mais aussi et surtout prendre sa revanche sur le Viêt Nam.");
        const jeu = Jeu.fromJson("The witcher III Wild hunt", "https://media3.giphy.com/media/JORbonHXxF56EJ1Aw7/giphy.gif?cid=790b7611d2e4871e23f90fabda28ca831aa46d25c2a6cc6d&rid=giphy.gif","2015","Action-RPG en open world pour PC, The Witcher 3 : Wild Hunt est le troisième opus de la série de jeux éponyme. Le joueur y retrouve le personnage de Geralt de Riv pour découvrir la fin de son histoire mouvementée.");
        collection.addMedia(jeu);
        collection.addMedia(film);
        collection.addMedia(album);
        updateLocalStorage()
        return collection
    } else { 
        //recupération de la liste dans le localStorage
        return Collection.fromJson(localStorage.getItem("collection"));
    }
}

const filtres = document.getElementsByClassName('filtre');
for (let i = 0; i < filtres.length; i++) {
    const button = filtres[i];
    button.addEventListener('click', () => {
        document.getElementsByClassName('filtre active')[0].classList.remove('active');
        button.classList.add('active');
        showCollection(button.dataset.filter);
    });
}


buttonTrier.addEventListener('click', () => {
    if(valTrie === 'titre') {
        valTrie = 'none';
    } else {
        valTrie = 'titre';
    }
    showCollection();
});

/**
 * affiche la collection selon les différents parametres
 *  - selon le type de la carte
 *  - selon si le filtre par nom est activé
 */
function showCollection(type = 'all') {
    const filtre = (elem) => {
        if(type === 'films') {
            return elem instanceof Film;
        }
        if(type === 'jeux') {
            return elem instanceof Jeu;
        }
        if(type === 'albums') {
            return elem instanceof Album;
        }
        return true;
    }

    const trie = (a, b) => {
        return ((a, b) => {
            if(valTrie === 'titre') {
                return a.titre.localeCompare(b.titre);
            }  
        })(a, b);
    }

    const collectionTrieType = collection.filter(filtre).sort(trie);
    cards.innerHTML = '';
    for (let i = 0; i < collectionTrieType.length; i++) {
        const media = collectionTrieType[i];
        cards.appendChild(createCard(media));
    }
}

//affiche le bon formulaire
radioFilm.addEventListener('click', () => {
    formAddMedia.innerHTML = addFormFilm();
    formAddMedia.dataset.type = 'film';
});

radioJeu.addEventListener('click', () => {
    formAddMedia.innerHTML = addFormJeu();
    formAddMedia.dataset.type = 'jeu';
});

radioAlbum.addEventListener('click', () => {
    formAddMedia.innerHTML = addFormAlbum();
    formAddMedia.dataset.type = 'album';
});

radioFilmOMDBAPI.addEventListener('click', () => {
    formAddMedia.innerHTML = addFormFilmOMDBAPI();
    formAddMedia.dataset.type = 'OMDBAPI';
});

//ajoute le media selon le radio bouton séléctionner
buttonAddValide.addEventListener('click', () => {
    let media = null;
    const type = formAddMedia.dataset.type;
    if(type === 'OMDBAPI'){
        const titre = document.getElementById('filmRecherche').value;
        fetch(`http://www.omdbapi.com/?apikey=4207e810&t=${titre}`).then((response) => {
            if(response.ok)
                return response.json();
        })
        .then((data) => {
            if(data.Error) {
                alert(data.Error);
                return;
            }
            const media = new Film(data.Title, data.Poster, new Date(data.Released).getFullYear(), data.Director, data.Runtime, data.Plot);
            collection.addMedia(media);
            showCollection();
            updateLocalStorage();
        });
    }else{
        if (type === "film") {
            media = createFilm();
        }
        if (type === "jeu") {
            media = createJeu();
        }
        if (type === "album") {
            media = createAlbum();
        }
        collection.addMedia(media);
        cards.appendChild(createCard(media));
        updateLocalStorage();
    }
    
});

function updateLocalStorage() {
    localStorage.setItem("collection",collection.toJson());
}

function createCard(media) {
    let html = null;
    if (media instanceof Film) {
        html = filmAsHTML(media);
    }
    if (media instanceof Jeu) {
        html = jeuAsHTML(media);
    }
    if (media instanceof Album) {
        html = albumAsHTML(media);
    }
    
    const buttonModif = html.querySelector('.buttonModif');
    buttonModif.addEventListener('click', () => {
        formModifMedia.dataset.id = media.id;
        if (media instanceof Film) {
            formModifMedia.innerHTML =  modifFormFilm(media);
        }
        if (media instanceof Jeu) {
            formModifMedia.innerHTML = modifFormJeu(media);
        }
        if (media instanceof Album) {
            formModifMedia.innerHTML = modifFormAlbum(media);
        }
    });

    const buttonDel = html.querySelector('.buttonDel');
    buttonDel.addEventListener('click', () => {
        collection.removeMedia(media);
        updateLocalStorage();
        cards.removeChild(html);
    });
    return html;
}

const buttonModifValide = document.getElementById('buttonModifValide');
buttonModifValide.addEventListener('click', () => {
    const id = formModifMedia.dataset.id;
    let media = collection.get(id);
    collection.removeMedia(media);
    const currennode = document.getElementById('media_' + id);
    if (media instanceof Film) {
        media = updateFilm(media);
    }
    if (media instanceof Jeu) {
        media = updateJeu(media);
    }
    if (media instanceof Album) {
        media = updateAlbum(media);
    }
    collection.addMedia(media);
    updateLocalStorage();  
    currennode.replaceWith(createCard(media));
});

function addFormFilm() {
    return `
        <div id="formular">
            <div>
                <label>Titre : </label>
                <input type="text" id="titreFilm"/>
            </div>
            <div>
                <label>image : </label>
                <input type="text" id="imageFilm"/>
            </div>
            <div>
                <label>Date de sortie : </label>
                <input type="text" id="dateFilm"/>
            </div>
            <div>
                <label>Réalisateur</label>
                <input type="text" id="realisateurFilm"/>
            </div>
            <div>
                <label>durée </label>
                <input type="text" id="dureeFilm"/>
            </div>
            <div>
                <label>résumé </label>
                <input type="text" id="resumeFilm"/>
            </div>
        </div>`;
}

function addFormFilmOMDBAPI() {
    return `<div id="formular">
                <div>
                    <label for="filmRecherche">Titre</label>
                    <input id="filmRecherche" type="text">
                </div> 
            </div>`;
}

function modifFormFilm(film) {
    return `
        <div id="formular">
            <div>
                <label>Titre : </label>
                <input type="text" id="modifTitreFilm" value="${film.titre}"/>
            </div>
            <div>
                <label>image : </label>
                <input type="text" id="modifImageFilm"  value="${film.image}"/>
            </div>
            <div>
                <label>Date de sortie : </label>
                <input type="text" id="modifDateFilm" value="${film.date}"/>
            </div>
            <div>
                <label>Réalisateur</label>
                <input type="text" id="modifRealisateurFilm" value="${film.realisateur}"/>
            </div>
            <div>
                <label>durée </label>
                <input type="text" id="modifDureeFilm" value="${film.duree}"/>
            </div>
            <div>
                <label>résumé </label>
                <input type="text" id="modifResumeFilm"  value="${film.resume}"/>
            </div>
        </div>`;
}


function addFormJeu() {
    return `
        <div id="formular">
            <div>
                <label>Titre : </label>
                <input type="text" id="titreJeu"/>
            </div>
            <div>
                <label>image : </label>
                <input type="text" id="imageJeu"/>
            </div>
            <div>
                <label>Date de sortie : </label>
                <input type="text" id="dateJeu"/>
            </div>
            <div>
                <label>Resumé </label>
                <input type="text" id="resumeJeu"/>
            </div>
        </div>`
}

function modifFormJeu(jeu) {
    return `
        <div id="formular">
            <div>
                <label>Titre : </label>
                <input type="text" id="modifTitreJeu" value="${jeu.titre}"/>
            </div>
            <div>
                <label>image : </label>
                <input type="text" id="modifImageJeu" value="${jeu.image}"/>
            </div>
            <div>
                <label>Date de sortie : </label>
                <input type="text" id="modifDateJeu" value="${jeu.date}"/>
            </div>
            <div>
                <label>Resumé </label>
                <input type="text" id="modifResumeJeu" value="${jeu.resume}"/>
            </div>
        </div>` ;
}

function addFormAlbum() {
    return `
        <div id="formular">
            <div>
                <label>Titre : </label>
                <input type="text" id="titreAlbum"/>
            </div>
            <div>
                <label>image : </label>
                <input type="text" id="imageAlbum"/>
            </div>
            <div>
                <label>Date de sortie : </label>
                <input type="text" id="dateAlbum"/>
            </div>
            <div>
                <label>Artiste : </label>
                <input type="text" id="artisteAlbum"/>
            </div>
            <div>
                <label>Nombre de musique </label>
                <input type="text" id="nbMusiqueAlbum"/>
            </div>
        </div>`;
}

function modifFormAlbum(album) {
    return `
        <div id="formular">
            <div>
                <label>Titre : </label>
                <input type="text" id="modifTitreAlbum" value="${album.titre}"/>
            </div>
            <div>
                <label>image : </label>
                <input type="text" id="modifImageAlbum" value="${album.image}"/>
            </div>
            <div>
                <label>Date de sortie : </label>
                <input type="text" id="modifDateAlbum" value="${album.date}"/>
            </div>
            <div>
                <label>Artiste : </label>
                <input type="text" id="modifArtisteAlbum" value="${album.artiste}"/>
            </div>
            <div>
                <label>Nombre de musique </label>
                <input type="text" id="modifNbMusiqueAlbum" value="${album.nbMusique}"/>
            </div>
        </div>`;
}


function filmAsHTML(film) {
    const card = document.createElement('div');
    card.classList.add("col","s12","m3");
    card.setAttribute("id", 'media_' + film.id);
    const contenu = `<div class="card grey darken-4 white-text">
                            <div class="card-image">
                                <img src="${film.image}">
                            </div>
                            <div class="card-content">
                                <span class="card-title">${film.titre}</span>
                                <hr>
                                <p>Réalisateur : ${film.realisateur} </p>
                                <p>Sortie en ${film.date}</p>
                                <p>Durée : ${film.duree} minutes</p>
                                <hr>
                                <p>${film.resume}</p>
                            </div>
                        <div class="card-action">
                            <a class="buttonModif modal-trigger" href="#modalModifMedia">Modifer</a>
                            <a class="buttonDel">Supprimer</a>
                        </div>
                    </div>`;
    card.innerHTML = contenu;
    return card;
}

function jeuAsHTML(jeu) {
    const card = document.createElement('div');
    card.classList.add("col","s12","m3");
    card.setAttribute("id", 'media_' + jeu.id);
    const contenu = `<div class="card grey darken-4 white-text">
                            <div class="card-image">
                                <img src="${jeu.image}">
                            </div>
                            <div class="card-content">
                                <span class="card-title">${jeu.titre}</span>
                                <hr>
                                <p>Sortie en ${jeu.date}</p>
                                <hr>
                                <p>${jeu.resume}</p>
                            </div>
                        
                        <div class="card-action">
                            <a class="buttonModif modal-trigger " href="#modalModifMedia">Modifer</a>
                            <a class="buttonDel">Supprimer</a>
                        </div>
                    </div>`;
    card.innerHTML = contenu;
    return card;
}

function albumAsHTML(album) {
    const card = document.createElement('div');
    card.classList.add("col","s12","m3");
    card.setAttribute("id", 'media_' + album.id);
    const contenu = `<div class="card grey darken-4 white-text">
                            <div class="card-image">
                                <img src="${album.image}">
                            </div>
                            <div class="card-content">
                                <span class="card-title">${album.titre}</span>
                                <hr>
                                <p>Artiste : ${album.artiste} </p>
                                <p>Sortie en ${album.date}</p>
                                <p>Nombre de musique : ${album.nbMusique}</p>
                            </div>
                        <div class="card-action">
                            <a class="buttonModif modal-trigger" href="#modalModifMedia">Modifer</a>
                            <a class="buttonDel">Supprimer</a>
                        </div>
                    </div>`;
    card.innerHTML = contenu;
    return card;
}

function createFilm() {
    const titre = document.getElementById("titreFilm").value || "Titre non renseigné"; 
    const image = document.getElementById("imageFilm").value || "public/img/no-image.png";
    const date = document.getElementById("dateFilm").value || "Date non renseigné";
    const realisateur = document.getElementById("realisateurFilm").value || "Réalisateur non renseigné";
    const duree = document.getElementById("dureeFilm").value || "durée non renseigné";
    const resume = document.getElementById("resumeFilm").value || "Resumé non renseigné";
    const film = new Film(titre, image, date, realisateur, duree, resume);
    return film;
}

function updateFilm(film) {
    film.titre = document.getElementById("modifTitreFilm").value || "Titre non renseigné";
    film.image = document.getElementById("modifImageFilm").value || "public/img/no-image.png";
    film.date = document.getElementById("modifDateFilm").value || "Date non renseigné";
    film.realisateur = document.getElementById("modifRealisateurFilm").value || "Réalisateur non renseigné";
    film.duree = document.getElementById("modifDureeFilm").value || "Durée non renseigné";
    film.resume = document.getElementById("modifResumeFilm").value || "Resumé non renseigné";
    return film;
}

function createJeu() {
    const titre = document.getElementById("titreJeu").value || "Titre non renseigné";
    const image = document.getElementById("imageJeu").value || "public/img/no-image.png";
    const date = document.getElementById("dateJeu").value || "Date non renseigné";
    const resume = document.getElementById("resumeJeu").value || "Resumé non renseigné";
    const jeu = new Jeu(titre, image, date, resume);
    return jeu;
}

function updateJeu(jeu) {
    jeu.titre  = document.getElementById("modifTitreJeu").value || "Titre non renseigné";
    jeu.image  = document.getElementById("modifImageJeu").value || "public/img/no-image.png";
    jeu.date = document.getElementById("modifDateJeu").value || "Date non renseigné";
    jeu.resume = document.getElementById("modifResumeJeu").value || "Resumé non renseigné";
    return jeu;
}

function createAlbum() {
    const titre = document.getElementById("titreAlbum").value || "Titre non renseigné";
    const image  = document.getElementById("imageAlbum").value || "public/img/no-image.png";
    const date = document.getElementById("dateAlbum").value || "Date non renseigné";
    const artiste = document.getElementById("artisteAlbum").value || "Artiste non renseigné";
    const nbMusique = document.getElementById("nbMusiqueAlbum").value || "Nombre de musiques non renseigné";
    const album = new Jeu(titre, image, date, artiste, nbMusique);
    return album;
}

function updateAlbum(album) {
    album.titre = document.getElementById("modifTitreAlbum").value || "Titre non renseigné";
    album.image = document.getElementById("modifImageAlbum").value || "public/img/no-image.png";
    album.date = document.getElementById("modifDateAlbum").value || "Date non renseigné";
    album.artiste = document.getElementById("modifArtisteAlbum").value || "Artiste non renseigné";
    album.nbMusique = document.getElementById("modifNbMusiqueAlbum").value || "Nombre de musiques non renseigné";
    return album;
}
