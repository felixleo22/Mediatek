export class Album {
    constructor(titre, image, date, artiste, nbMusique) {
        this.id = 0;
        this.titre = titre;
        this.image = image;
        this.date = date;
        this.artiste = artiste;
        this.nbMusique = nbMusique;
    }

    static fromJson(json){
        const album = JSON.parse(json); 
        return new Album(album.titre, album.image, album.date, album.artiste, album.nbMusique);
    }
    
    toJson() {
       return JSON.stringify(this);
    }
}