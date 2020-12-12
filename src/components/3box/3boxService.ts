import { default as Box } from "3box";
import { toast } from "react-toastify";
import { gitservice, ipfservice, walletservice } from "../../App";

export class BoxService {
  box: any;
  space: any;

  showspinner() {}

  hidespinner() {}
  // 3BOX connection

  async connect3Box() {
    console.log("3box connect");
    this.showspinner();
    try {
      console.log(walletservice.address, window.ethereum);
      let profile = await Box.getProfile(walletservice.address);
      await Box.openBox(walletservice.address, window.ethereum, {})
      console.log(profile)
      toast.success(`Your 3Box space is ${this.space._name}`);
      //await Box.openBox(walletservice.address, window.ethereum);
      /* this.space = await this.box.openSpace("remix-workspace");
      console.log(this.space);
      
      const hashes = await this.getHashesFrom3Box();
      await this.show3boxhashes(hashes); */
    } catch (e) {
      toast.error(`Can't connect to 3Box. Make sure the IDE runs on HTTPS.`);
    }
    this.hidespinner();
  }

  async storeHashIn3Box(space:any) {
    if (typeof this.space == "undefined") {
      toast.warning("You should connect to 3Box first");
      return false;
    }
    this.showspinner();
    await ipfservice.addToIpfs();
    console.log("export 3box", ipfservice.cid, this.space);
    const commits = await gitservice.getCommits();
    let key = `remixhash-${Date.now()}`;
    await this.space.private.set(key, {
      key: key,
      cid: ipfservice.cid,
      datestored: new Date(Date.now()),
      datecommit: commits[0].commit.committer.timestamp,
      ref: commits[0].oid,
      message: commits[0].commit.message,
    });
    toast.success("stored in 3box");
    //this.addSuccess('boxexportstatus', 'Your data was stored in 3Box')
    const hashes = await this.getHashesFrom3Box(space);
    await this.show3boxhashes(hashes);
    this.hidespinner();
  }

  async show3boxhashes(hashes: any) {
    console.log("render", hashes);

    let ipfsurl = await ipfservice.getipfsurl();
    hashes.map(async (x: any) => {
      try {
        x.link = `${ipfsurl}${x.cid}`;
        return x;
      } catch (e) {
        return false;
      }
    });

    hashes = hashes.reverse();
  }

  async getHashesFrom3Box(space:any) {
    const hashes = await space.private.all();
    console.log(hashes);
    return Object.values(hashes);
  }

  async importFrom3Box(args: string) {
    const cid = args;
    console.log("cid", cid);
    ipfservice.cid = cid;
    //$("#ipfs").val(ipfservice.cid);
    //await this.clone();
  }

  async deleteFrom3Box(args: string, space:any) {
    const key = args;
    console.log("key", key);
    this.showspinner();
    await this.space.private.remove(key);
    const hashes = await this.getHashesFrom3Box(space);
    await this.show3boxhashes(hashes);
    this.hidespinner();
  }
}
