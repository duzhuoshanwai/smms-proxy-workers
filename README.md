# smms-proxy-workers
使用 Cloudflare Workers 搭建 CORS Proxy

使用示例：
```bash
curl -X POST https://smms-proxy.duzhuo.icu \
  -H "Content-Type: multipart/form-data" \
  -H "Authorization: Basic {你的api_key}" \
  -F "smfile=@{你的图片路径}" \
  -F "format=json"
```

```bash
curl -X GET https://smms-proxy.duzhuo.icu/delete/{图片hash} \
  -H "Authorization: Basic {你的api_key}" 
```

具体定义参考：[https://doc.sm.ms/#api-Image-Upload](https://doc.sm.ms/#api-Image-Upload)