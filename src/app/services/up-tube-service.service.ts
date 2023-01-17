import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import {faBookmark as solidBookmark, faThumbsUp as solidThumbsUp} from "@fortawesome/free-solid-svg-icons";
import {faBookmark, faThumbsUp} from "@fortawesome/free-regular-svg-icons";
import {iThematic} from "../model/thematics";
import {Router} from "@angular/router";
import {Video} from '../model/video';
import {Channel} from "../model/channel";
import {Tag} from '../model/tag';


const BASE_URL = "https://dev-testeuptube.pantheonsite.io";

@Injectable({
  providedIn: 'root'
})

export class UpTubeServiceService {
  bookmark = faBookmark;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private route: Router) {
  }

  getApiRoute() {
    return BASE_URL;
  }

  getSugestedChannels() {
    return this.http.get(BASE_URL + "/api/channels")
  }

  getVideos() {
    return this.http.get(BASE_URL + "/api/videos")
  }

  getSugestedVideos() {
    return this.http.get(BASE_URL + "/api/SugestedVideos")
  }

  getChannel(id: number): Promise<Channel[]> { //retorna array de channels por causa de varios videos ids
    return new Promise((resolve) => {
      this.http.get(BASE_URL + "/api/channel/" + id).subscribe(channels => {
        resolve(<Channel[]>channels);
      })
    })
  }

  getVideosFromChannel(id_channel: number): Promise<number[]> {
    return new Promise((resolve) => {
      this.getChannel(id_channel).then(channels => {
        let videos: number[] = [];
        for (const d of <Channel[]>channels) {
          videos.push(d.video_id)
        }
        resolve(videos);
      })
    })
  }

  getVideo(id: number) {
    return this.http.get(BASE_URL + "/api/video/" + id)
  }

  getTags() {
    return this.http.get(BASE_URL + "/api/tags")
  }

  getChannels(): Promise<Channel[]> {
    return new Promise((resolve) => {
      this.http.get(BASE_URL + "/api/channels").subscribe(jsonData => {
        let channels = <Channel[]>jsonData
        for (let channel of channels) {
          channel = this.sanitizeChannel(channel)
        }
        resolve(channels)
      })
    })
  }
  sanitizeChannel(channel: Channel): Channel {
    channel.logo = this.addBase_Route(channel.logo)
    channel.banner = this.addBase_Route(channel.banner)
    return channel
  }


  getTagsNames() {
    return new Promise((resolve) => {
      this.getTags().subscribe(data => {
        let tags: string[] = [];
        // @ts-ignore
        for (const d of data) {
          tags.push(d.name)
        }
        resolve(tags);
      })
    })
  }

  getVideosIdbyTagName(tag_name: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.http.get(BASE_URL + "/api/tag/" + tag_name).subscribe(tagsData => {
        let videos_id: number[] = [];
        for (const tag of <any[]>tagsData) {
          videos_id.push(tag.video_id)
        }
        if (videos_id.length <= 0) {
          this.route.navigate(['/homepage'])
          return;
        }
        resolve(videos_id);
      })
    })
  }

  getVideosIdbyTagId(tag_id: number): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.http.get(BASE_URL + "/api/tagid/" + tag_id).subscribe(tagsData => {
        let videos_id: number[] = [];
        for (const tag of <any[]>tagsData) {
          videos_id.push(tag.video_id)
        }
        if (videos_id.length <= 0) {
          this.route.navigate(['/homepage'])
          return;
        }
        resolve(videos_id);
      })
    })
  }

  getVideoData(id_video: number) {
    return new Promise((resolve) => {
      let data: any;
      this.getVideo(id_video).subscribe(d => {
        data = d;
        data = data[0]; //api retorna array
        data.tags = data.tags.split(",").map(Number) //as tags vêm em string da api....
        data.url = this.sanitizer.bypassSecurityTrustResourceUrl(data.url.replace("watch?v=", "embed/"));
        resolve(data);
      });
    })
  }

  getVideosFromIds(ids_videos: number[]): Promise<Video[]> {
    return new Promise((resolve) => {
      let ids_string = ids_videos.join(",")
      this.http.get(BASE_URL + "/api/video/" + ids_string).subscribe(d => {
        let videos = <Video[]>d
        for (const video of videos) {
          if (typeof video.tags === "string") {
            video.tags = video.tags.split(",").map(Number)
          }
        }
        resolve(videos)
      })
    })
  }

  getTagsNamebyID(ids: number[]): Promise<string[]> {
    return new Promise((resolve) => {
      this.getTags().subscribe(d => {
        let data = <Tag[]>d;
        let tags: string[] = [];
        for (const id of ids) {
          tags.push(data.filter(obj => obj.tid == id).map(obj => obj.name).toString())
        }
        resolve(tags);
      })
    })
  }

  getUser(id: number) {
    return this.http.get(BASE_URL + "/api/channel/" + id)
  }

  getUsers() {
    return this.http.get(BASE_URL + "/api/channels")
  }

  getUserData(id_user: number) {
    return new Promise((resolve) => {
      let user: any
      user = this.getUser(id_user).subscribe(d => {
        user = d;
        user = user[0]
        resolve(user);
      })
    })
  }

  getThematics() {
    return this.http.get(BASE_URL + "/api/thematics")
  }

  getThematicsById(id_thematic: number): Promise<iThematic> {
    return new Promise((resolve) => {
      this.http.get(BASE_URL + "/api/thematics/" + id_thematic).subscribe(thematic => {
        let theme = <iThematic[]>thematic
        resolve(theme[0])
      })
    })
  }

  getThematicTagsById(id: number): Promise<number[]> {
    return new Promise((resolve) => {
      this.http.get(BASE_URL + "/api/thematics/" + id).subscribe(thematic => {
        let thematicData = <iThematic[]>thematic
        let tags = thematicData[0].tags.split(",").map(Number) //as tags vêm em string da api....
        resolve(tags)
      })
    })

  }

  getSuggestedThematics() {
    return this.http.get(BASE_URL + "/api/suggestedthematics")
  }

  //<<<<<<<<<<<<<<<<<<<<<<<Local Storage and Favourites>>>>>>>>>>>>>>>>>>>>>>>>>>

  getFavouritesFromLocal() {
    let favourites = localStorage.getItem("Favourites")
    if (favourites !== null) {
      return JSON.parse(favourites)
    }
    return []
  }

  removeFavouriteFromLocal(id_video: number) {
    let favourites = this.getFavouritesFromLocal()
    let indice = favourites.indexOf(id_video)
    favourites.splice(indice, 1)
    localStorage.setItem("Favourites", JSON.stringify(favourites))
  }

  addFavouriteToLocal(id_video: number) {
    let favourites = this.getFavouritesFromLocal()
    favourites.push(id_video)
    localStorage.setItem("Favourites", JSON.stringify(favourites))
  }

  toggleFavorito(id_video: number) {
    if (this.isFavourite(id_video)) {
      this.removeFavouriteFromLocal(id_video)
    } else {
      this.addFavouriteToLocal(id_video)
    }
  }

  icone_favorito(id_video: number) {
    return this.isFavourite(id_video) ? solidBookmark : faBookmark;
  }

  isFavourite(id_video: number): boolean {
    return this.getFavouritesFromLocal().includes(id_video);
  }

}
