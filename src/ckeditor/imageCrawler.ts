import {getUUid} from "../utils/utils";
import {myAgent} from "../agent/agentType";

export class ImageCrawler {
    async upload(resource) {
        let ext = '.png';
        let path = 'd:/__temp_image/' + getUUid() + ext;
        let picUrl;
        console.log(resource)
        if (resource instanceof File) {
            picUrl = await myAgent.uploadImage(resource, path)
        } else {
            picUrl = await myAgent.uploadImageUrl(resource, path)
        }
        return picUrl;
    }

}

const imageCrawler: ImageCrawler = new ImageCrawler();

export default imageCrawler;


