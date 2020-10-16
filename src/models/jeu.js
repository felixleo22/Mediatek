export class Jeu {
    constructor(titre, image, date, resume) {
        this.id = 0
        this.titre = titre;
        this.image = image;
        this.date = date;
        this.resume = resume;
    }

    static fromJson(json){
        const jeu = JSON.parse(json); 
        return new Jeu(jeu.titre, jeu.image, jeu.date, jeu.resume);
    }

    toJson() {
        return JSON.stringify(this);
    }
}