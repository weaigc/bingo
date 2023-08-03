const TRAGET_HOST='hf4all-bingo.hf.space' // 请将此域名改成你自己的，域名信息在设置》站点域名查看。

export default {
  async fetch(request) {
    const uri = new URL(request.url);
    uri.host = TRAGET_HOST
    return fetch(new Request(uri.toString(), request));
  },
};
