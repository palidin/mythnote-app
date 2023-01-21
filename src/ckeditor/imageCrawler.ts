import {myAgent} from "../agent/agentType";

export class ImageCrawler {
    async upload(resource) {
        let picUrl;
        if (resource instanceof File) {
            picUrl = await myAgent.uploadImage(resource)
        } else {
            picUrl = await myAgent.uploadImageUrl(resource)
        }
        return picUrl;
    }

}

const imageCrawler: ImageCrawler = new ImageCrawler();

export default imageCrawler;


