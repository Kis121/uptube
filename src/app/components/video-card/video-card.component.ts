import {Component, Input, OnInit} from '@angular/core';
import {UpTubeServiceService} from "../../services/up-tube-service.service";
import {faShareAlt} from "@fortawesome/free-solid-svg-icons";
import {faBookmark} from "@fortawesome/free-regular-svg-icons";
import {faClapperboard as faClapperboardSolid} from "@fortawesome/free-solid-svg-icons";
import {faPlay as faPlaySolid,} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {Video} from "../../model/video";
import {iThematic} from "../../model/thematics";
import {CardData} from 'src/app/model/card-data';
import {Channel} from "../../model/channel";

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.scss']
})
export class VideoCardComponent implements OnInit {
  @Input() video_data = {} as Video;
  @Input() icons = false
  @Input() thematic = {} as iThematic
  user: any;
  data = {} as CardData
  apiRoute = this._service.getApiRoute()
  processPage = false
  faClapperboardSolid = faClapperboardSolid;
  faPlaySolid = faPlaySolid;
  faShareSquare = faShareAlt
  bookmark = {} as IconProp
  routerLink = ""
  isVideo = false

  constructor(private _service: UpTubeServiceService) {
  }

  ngOnInit(): void {
    if (Object.keys(this.video_data).length !== 0) {
      this.getUserdata()
      this.isVideo = true
      this.routerLink = "/video/" + this.video_data.id
    } else if (Object.keys(this.thematic).length !== 0) {
      this.constructCardData(this.thematic.thumbnail, this.thematic.logo, this.thematic.teaser, this.thematic.title, this.thematic.date)
      this.routerLink = "/thematic/" + this.thematic.id
      this.processPage = true
    }
  }

  getUserdata() {
    this._service.getUser(this.video_data.channel).subscribe(d => {
      this.user = <Channel>d
      this.user = this.user[0] //api retorna array...
      if (this.icons) {
        this.bookmark = this._service.icone_favorito(this.video_data.id_number)
      }
      this.constructCardData(this.video_data.thumbnail, this.user.logo, this.video_data.name, this.user.name, this.video_data.date)
      this.processPage = true
    })
  }

  constructCardData(thumbnail: string, logo: string, title: string, name: string, date: string) {
    this.data.thumbnail = thumbnail
    this.data.logo = logo
    this.data.title = title
    this.data.name = name
    this.data.date = date
  }

  toggleFavorito(id_video: number) {
    this._service.toggleFavorito(id_video)
    this.bookmark = this._service.icone_favorito(id_video)
  }

  CopyLink() {
    var popup = document.getElementById(this.video_data.id.toString());
    navigator.clipboard.writeText(document.URL.replace("homepage", "video/") + this.video_data.id);
    // @ts-ignore
    popup.classList.toggle("show");
  }

}
