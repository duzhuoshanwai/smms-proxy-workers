export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    const API_URL = "https://sm.ms/api/v2/";
    const PROXY_ENDPOINT = "/";

    function rawHtmlResponse(html) {
      return new Response(html, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
    }

    const DEMO_PAGE = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CORS 代理示例</title>
      </head>
      <body>
        <h1>用于<a href="https://sm.ms">sm.ms</a>图床的CORS代理</h1>
        <p>支持 POST /upload GET /delete</p>
        <a href="https://github.com/duzhuoshanwai/smms-proxy">https://github.com/duzhuoshanwai/smms-proxy</a>
      </body>
      </html>
    `;

    const url = new URL(request.url);

    // 处理根路径请求，展示 DEMO_PAGE
    if (request.method === "GET" && url.pathname === PROXY_ENDPOINT) {
      return rawHtmlResponse(DEMO_PAGE);
    }

    // 处理 POST /upload 请求
    if (request.method === "POST" && url.pathname === PROXY_ENDPOINT + "upload") {
      const formData = await request.formData();
      const file = formData.get("smfile");

      if (!file) {
        return new Response("No file uploaded. Please ensure you have selected a file to upload.", {
          status: 400,
          headers: corsHeaders
        });
      }

      // 重命名文件
      const newFileName = `renamed_${Date.now()}_${file.name}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      // 创建新的 FormData 对象
      const newFormData = new FormData();
      newFormData.append("smfile", renamedFile);
      newFormData.append("format", "json");

      // 创建新的 Headers 对象，确保 Authorization 头部被正确传递
      const newHeaders = new Headers();
      if (request.headers.has("Authorization")) {
        newHeaders.set("Authorization", request.headers.get("Authorization"));
      }

      const apiRequest = new Request(API_URL + "upload", {
        method: request.method,
        headers: newHeaders,
        body: newFormData
      });

      const apiResponse = await fetch(apiRequest);
      const apiResponseBody = await apiResponse.text();

      const response = new Response(apiResponseBody, {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers: {
          ...corsHeaders,
          ...apiResponse.headers
        }
      });

      return response;
    }

    // 处理 GET /delete/:hash 请求
    if (request.method === "GET" && url.pathname.startsWith(PROXY_ENDPOINT + "delete/")) {
      const hash = url.pathname.slice(PROXY_ENDPOINT.length + "delete/".length);

      if (!hash) {
        return new Response("Invalid hash", {
          status: 400,
          headers: corsHeaders
        });
      }

      const apiRequest = new Request(API_URL + "delete/" + hash, {
        method: request.method,
        headers: request.headers
      });

      const apiResponse = await fetch(apiRequest);
      const response = new Response(apiResponse.body, {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers: {
          ...corsHeaders,
          ...apiResponse.headers
        }
      });

      return response;
    }

    // 处理 OPTIONS 请求，用于预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // 其他请求返回 405 Method Not Allowed
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        "Allow": "POST, GET, OPTIONS",
        ...corsHeaders
      }
    });
  }
};