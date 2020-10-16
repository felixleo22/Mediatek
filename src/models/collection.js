import { Album } from "./album.js";
import { Film } from "./film.js";
import { Jeu } from "./jeu.js";
export class Collection {

    constructor() {
        this.medias = [];
        this.idMax = 0;
    }

    addMedia(media) {
        if(!media) return;
        if(this.medias.indexOf(media) >= 0) return;
        this.medias.push(media);
        media.id = this.idMax;
        this.idMax++;
    }

    removeMedia(media) {
        const index = this.medias.indexOf(media);
        this.medias.splice(index,1);
    }

    getNbMedia() {
        return this.medias.length;
    }

    filter(filtre) {
        return this.medias.filter(filtre);
    }

    get(id) {
        for (let i = 0; i < this.medias.length; i++) {
            const media = this.medias[i];
            if(media.id == id) {
                return media;
            }
        }
        return null;
    }

    toJson() {
        const obj = [];
        for (let i = 0; i < this.getNbMedia(); i++){
            const media = this.medias[i];
            obj.push({
                type: media.constructor.name,
                media: media.toJson()
            });
        }
        return JSON.stringify(obj);
    }

    static fromJson(json) {
        const object = JSON.parse(json);
        const collection = new Collection();
        for (let i = 0; i < object.length; i++) {
            const media = object[i];
            switch(media.type) {
                case 'Album':
                    collection.addMedia(Album.fromJson(media.media));
                    break;
                case 'Film':
                    collection.addMedia(Film.fromJson(media.media));
                    break;
                case 'Jeu':
                    collection.addMedia(Jeu.fromJson(media.media));
                    break;
            }
        }
        return collection;
    }
}