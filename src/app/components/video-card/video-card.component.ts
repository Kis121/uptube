import {Component, Input, OnInit} from '@angular/core';
import {UpTubeServiceService} from "../../services/up-tube-service.service";
import {faShareAlt} from "@fortawesome/free-solid-svg-icons";
import {faBookmark} from "@fortawesome/free-regular-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {Video} from "../../model/video";
import {iThematic, Thematic} from "../../model/thematics";
import {CardData} from 'src/app/model/card-data';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.scss']
})
export class VideoCardComponent implements OnInit {
  user: any;
  apiRoute = this._service.getApiRoute()
  data = {} as CardData
  @Input() video_data = {} as Video;
  @Input() icons = false
  @Input() thematics = {} as Thematic
  processPage = false
  faShareSquare = faShareAlt
  bookmark = {} as IconProp


  constructor(private _service: UpTubeServiceService) {
  }

  ngOnInit(): void {
    if (Object.keys(this.video_data).length !== 0) {
      this.getUserdata()
      console.log(this.data)
    } else if (Object.keys(this.thematics).length !== 0) {
      console.log("mandei uma tematica")
      console.log(this.thematics)
    }
  }

  getUserdata() {
    this._service.getUser(this.video_data.channel).subscribe(d => {
      this.user = <Video[]>d
      this.user = this.user[0] //api retorna array...
      this.bookmark = this._service.icone_favorito(this.video_data.id)
      this.processPage = true
    })
  }

  toggleFavorito(id_video: number) {
    this._service.toggleFavorito(id_video)
    this.bookmark = this._service.icone_favorito(id_video)
  }

  myFunction() {
    var popup = document.getElementById(this.video_data.id.toString());
    navigator.clipboard.writeText(document.URL.replace("homepage", "video/") + this.video_data.id);
    // @ts-ignore
    popup.classList.toggle("show");
  }

}
