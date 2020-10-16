export class Film {
    constructor(titre, image, date, realisateur, duree, resume) {
        this.id = 0;
        this.titre = titre;
        this.image = image;
        this.date = date;
        this.realisateur = realisateur;
        this.duree = duree;
        this.resume = resume;
    }

    static fromJson(json){
        const film = JSON.parse(json); 
        return new Film(film.titre, film.image, film.date, film.realisateur, film.duree, film.resume);
    }

    toJson() {        
        return JSON.stringify(this);
    }
}